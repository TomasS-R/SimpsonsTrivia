const { supabaseConection } = require('../account/authSupabase');
const queries = require('../dbFiles/queries');
const redisManager = require('../dbFiles/redisManager');
const config = require('../../config');

// Verificar autenticación
const checkUserSession = async (req) => {
  try {
    // Verificar tokens válidos
    if (req.cookies?.accessToken && req.cookies?.refreshToken) {
      const { data: { user } } = await supabaseConection.auth.getUser(
        req.cookies.accessToken
      );

      if (user) {
        const userData = await queries.getUserDataSupabaseAuth(user.id);
        return {
          id: user.id,
          role: userData?.role || 'USER',
          isAnonymous: false
        };
      }
    }

    // Verificar sesión existente
    const { data: { session } } = await supabaseConection.auth.getSession();
    
    if (session && session.user.is_anonymous === false) {
      const userData = await queries.getUserDataSupabaseAuth(session.user.id);
      return {
        id: session.user.id,
        role: userData?.role || 'USER',
        isAnonymous: false
      };
    }

    return null;
  } catch (error) {
    console.error('Error in checkUserSession:', error);
    throw error;
  }
};

// Middleware para verificar estado de autenticación
const verifyUserSession = async (req, res, next) => {
  try {
    req.user = await checkUserSession(req);
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware completo que maneja usuarios anónimos y Redis
const handleUserSession = async (req, res, next) => {
  try {
    // Primero intentar obtener usuario autenticado
    const authenticatedUser = await checkUserSession(req);
    
    if (authenticatedUser) {
      // Verificar datos temporales en Redis
      const redisKey = `registration:${authenticatedUser.id}`;
      const tempData = await redisManager.get(redisKey);

      if (tempData) {
        const userData = JSON.parse(tempData);
        req.user = {
          ...authenticatedUser,
          role: 'PENDING',
          registrationStatus: userData.registration_step
        };
        return next();
      }

      req.user = authenticatedUser;
      return next();
    }

    // Manejar usuario anónimo
    let user;
    if (req.cookies.accessToken) {
      const { data: { user: existingUser } } = await supabaseConection.auth.getUser(req.cookies.accessToken);
      if (existingUser) {
        user = existingUser;
      }
    }

    // Si no hay usuario, crear uno anónimo
    if (!user) {
      if (req.cookies.accessToken) {
        res.clearCookie('accessToken');
      }

      const { data, error } = await supabaseConection.auth.signInAnonymously();
      if (error) throw error;
      user = data.user;

      res.cookie('accessToken', data.session.access_token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 3 * 60 * 60 * 1000 // 3 horas
      });

      // Guardar datos en Redis para usuario anónimo
      const redisKey = `anonymous:${user.id}`;
      const tempData = {
        id: user.id,
        created_at: new Date().toISOString(),
        status: 'anonymous'
      };
      await redisManager.setex(redisKey, 3 * 60 * 60, JSON.stringify(tempData)); // 3 horas

      req.user = {
        id: user.id,
        role: 'anon',
        isAnonymous: true,
        username: `anon_${user.id.slice(0, 8)}`
      };
    } else {
      // Usuario anónimo existente
      const redisKey = `anonymous:${user.id}`;
      const tempData = await redisManager.get(redisKey);

      req.user = {
        id: user.id,
        role: 'anon',
        isAnonymous: true,
        ...(tempData && { tempData: JSON.parse(tempData) })
      };
    }

    next();
  } catch (error) {
    console.error('Error in handleUserSession:', error);
    next(error);
  }
};

// Enviar mensaje con el estado de la sesión si esta por expirar
const sessionStatusController = async (req, res) => {
  try {
    // Intentar obtener usuario del token
    let user;
    if (req.cookies?.accessToken) {
      const { data: { user: sessionUser } } = await supabaseConection.auth.getUser(
        req.cookies.accessToken
      );
      user = sessionUser;
    }

    if (!user || user.is_anonymous) {
      // Solo verificar TTL si hay un usuario anónimo
      if (user?.id) {
        const redisKey = `anonymous:${user.id}`;
        const ttl = await redisManager.ttl(redisKey);

        res.json({
          status: 'success',
          data: {
            isAnonymous: true,
            timeRemaining: ttl,
            shouldWarn: ttl <= (15 * 60), // 15 minutos
            sessionExpires: new Date(Date.now() + (ttl * 1000)).toISOString()
          }
        });
      } else {
        res.json({
          status: 'success',
          data: {
            isAnonymous: true,
            isAuthenticated: false
          }
        });
      }
    } else {
      res.json({
        status: 'success',
        data: {
          isAnonymous: false,
          isAuthenticated: true
        }
      });
    }
  } catch (error) {
    console.error('Error checking session status:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error checking session status'
    });
  }
};

module.exports = {
  handleUserSession,
  verifyUserSession,
  sessionStatusController
};