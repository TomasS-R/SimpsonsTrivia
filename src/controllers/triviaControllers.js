const queries = require('../dbFiles/queries');
const accountRegister = require('../account/register');
const accountLogin = require('../account/login');
const rolesManager = require('../account/roles/rolesManager');
const { supabaseConection } = require('../account/authSupabase');
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');
const queriesRedis = require('../dbFiles/queriesRedis');

// Funcion para registrar un usuario
async function registerUserReq (req, res) {
  try {
    const { email, username, password } = req.body;
    const defaultRole = rolesManager.getDefaultRole();

    if (!email) {
      return res.status(400).json({ success: false, error: "The request needs the 'email' field!" });
    }
    else if (!username) {
      return res.status(400).json({ success: false, error: "The request needs the 'username' field!" });
    }
    else if (!password) {
      return res.status(400).json({ success: false, error: "The request needs the 'password' field!" });
    }

    const anonymousId = req.user?.isAnonymous ? req.user.id : null;
    const data = await accountRegister.registerUser(username, email, password, defaultRole, anonymousId, res);

    // Si existe un usuario anónimo, transferir sus datos
    if (req.user?.isAnonymous) {
      //console.log('req.user', req.user);
      //await queries.transferAnonymousData(req.user.id, data.user.id, score);
    }

    // Verificar que data y session existan antes de usar access_token
    if (data?.session?.access_token) {
      res.cookie('accessToken', data.session.access_token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 3 * 60 * 60 * 1000 // 3 horas
      });

      res.cookie('refreshToken', data.session.refresh_token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });
    }

    // Verificar que tengamos los datos necesarios para la respuesta
    if (!data?.user) {
      throw new Error('User data not available after registration');
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: data.session?.access_token,
      data: {
        id: data.user.id,
        username: data.user.username,
        user_tag: data.user.user_tag,
        email: data.user.email,
        role: data.user.role,
        created_at: data.user.created_at,
      },
    });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({
      success: false,
      error: "An error occurred during registration: " + e.message
    });
  }
};

// Función para que un usuario con rol superior cambie el rol de otro usuario
async function changeUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { newRole } = req.body
    const changerRole = req.user.roleUser.role; // El rol del usuario que intenta hacer el cambio

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    if (!newRole || !rolesManager.isValidRole(newRole)) {
      return res.status(400).json({ success: false, error: "Invalid new role" });
    }

    // Obtener el usuario cuyo rol se va a cambiar
    const userToChange = await queries.getUserById(userId);
    if (!userToChange) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Verificar si el usuario que hace el cambio tiene un rol superior al usuario a cambiar
    if (rolesManager.getRoleHierarchy(changerRole) < rolesManager.getRoleHierarchy(userToChange.role)) {
      return res.status(403).json({ success: false, error: "You don't have permission to change this user's role" });
    }

    // Verificar si el usuario que hace el cambio tiene un rol superior al nuevo rol
    if (rolesManager.getRoleHierarchy(changerRole) < rolesManager.getRoleHierarchy(newRole)) {
      return res.status(403).json({ success: false, error: "You don't have permission to assign this role" });
    }

    // Obtener rol actual
    const currentRole = await queries.getUserRole(userId);

    // Cambiar el rol del usuario
    const newRoleUser = await queries.changeUserRole(userId, newRole);

    res.status(200).json({ 
      success: true, 
      message: `User role updated successfully!`,
      user: {
        id: newRoleUser.id,
        name: newRoleUser.username,
        email: newRoleUser.email,
        previousRole: currentRole.role,
        newRole: newRoleUser.role
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: "An error occurred while changing the user role" });
  }
}

// Funcion para loguear un usuario
async function loginUserReq (req, res, next) {
  try {
    const { email, password } = req.body;
    const fields = Object.keys(req.body);

    // Comprueba que solo se envien 2 campos, usuario y password
    if (fields.length > 2) {
      return res.status(400).json({ success: false, error: "The request has more than 2 fields!" });
    }
    else if (!email) {
      return res.status(409).json({ success: false, error: "The request needs the 'email' field!" });
    }
    else if (!password) {
      return res.status(409).json({ success: false, error: "The request needs the 'password' field!" });
    }
    const { data } = await accountLogin.loginUser(email, password);

    // Establecer cookies después de un inicio de sesión exitoso
    res.cookie('accessToken', data.session.access_token, {
      httpOnly: true, // Solo se puede acceder desde el servidor
      secure: config.nodeEnv === 'production', // secure true en produccion
      sameSite: 'strict', // Evitar que se envien a través de peticiones CSRF
      maxAge: 3 * 60 * 60 * 1000 // 3 horas de duracion de la cookie
    });

    res.cookie('refreshToken', data.session.refresh_token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.status(200).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        createdAt: data.user.created_at,
        lastSignInAt: data.user.last_sign_in_at,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      },
    });
  } catch (e) {
    if (e.message === "Invalid login credentials") {
      return res.status(401).json({ success: false, error: "Invalid credentials. Please check your email and password." });
    } else {
      next(e);
    }
  }
};

async function loginUserOAuth(req, res) {
  try {
    const { provider } = req.params;
    
    if (!provider) {
      return res.status(400).json({ 
        success: false, 
        error: "Authentication provider is required" 
      });
    } else if (!['google', 'github'].includes(provider)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid authentication provider. Use 'google' or 'github'" 
      });
    }
    
    await accountLogin.loginWithOAuth(req, res);
    
  } catch (e) {
    console.error('Error during OAuth login:', e);
    return res.status(500).json({
      success: false,
      error: "Internal server error during authentication"
    });
  }
}

async function handleOAuthCallback(req, res) {
  try {
    console.log("OAuth Callback - Método:", req.method);
    console.log("OAuth Callback - URL completa:", req.originalUrl);
    console.log("OAuth Callback - Query completo:", JSON.stringify(req.query));
    
    // Si hay código, procesarlo normalmente
    if (req.query.code) {
      console.log("Authorization code found:", req.query.code);
      
      try {
        const { data, error } = await supabaseConection.auth.exchangeCodeForSession(req.query.code);
        
        if (error) {
          console.error('Error exchanging code for session:', error);
          return res.render('account', { 
            errorMessage: `Error processing authentication: ${error.message}`
          });
        }
        
        if (!data || !data.session) {
          console.error('Could not get user session');
          return res.render('account', { 
            errorMessage: 'Could not get user session'
          });
        }
        
        console.log("Session obtained correctly:", {
          access_token: data.session.access_token ? "***" : undefined,
          refresh_token: data.session.refresh_token ? "***" : undefined,
          user_id: data.user?.id
        });
        
        // Establecer cookies
        res.cookie('accessToken', data.session.access_token, {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: 'lax',
          maxAge: (data.session.expires_in || 3600) * 1000
        });
        
        if (data.session.refresh_token) {
          res.cookie('refreshToken', data.session.refresh_token, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
          });
        }

         // Guardar usuario en la base de datos si es necesario
         if (data.user && data.user.email) {
          try {
            const userEmail = data.user.email;
            const existingUser = await queries.getUserByEmail(userEmail);
            
            if (!existingUser) {
              const userName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || userEmail.split('@')[0];
              
              await queries.createUserOAuth({
                id: data.user.id,
                email: userEmail,
                username: userName,
                provider: data.user.app_metadata?.provider || 'oauth'
              });
            } else {
              // Usuario ya existe con este email pero diferente proveedor
              console.log(`User already exists with email ${userEmail}, but authenticated with different provider`);
              // Supabase ya maneja automáticamente múltiples identidades para el mismo email
              // Solo necesitamos verificar que el usuario se creó correctamente en nuestra DB local
            }
          } catch (dbError) {
            console.error('Error saving user OAuth:', dbError);
          }
        }
        
        return res.redirect('/api/v1/profile');
        
      } catch (exchangeError) {
        console.error('Detailed error exchanging code:', exchangeError);
        return res.render('account', { 
          errorMessage: 'Error processing authentication'
        });
      }
    } 
    // Si no hay código, necesitamos manejar el hash fragment
    else {
      console.log("No code detected in query, sending page to process possible hash fragment");
      
      // Esta página HTML mejora la detección del token en el hash
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Procesando autenticación</title>
          <script>
            window.onload = function() {
              // Verificar si hay un hash en la URL
              let hash = window.location.hash;
              console.log("Hash detectado:", hash ? "SÍ" : "NO");
              
              if (hash && hash.startsWith('#')) {
                // Remover el # inicial
                hash = hash.substring(1);
                console.log("Procesando hash:", hash);
                
                // Extraer los parámetros
                const params = {};
                hash.split('&').forEach(part => {
                  const keyValue = part.split('=');
                  if (keyValue.length === 2) {
                    params[keyValue[0]] = decodeURIComponent(keyValue[1]);
                  }
                });
                
                console.log("Parámetros extraídos:", JSON.stringify(params));
                
                // Verificar si tenemos un access_token
                if (params.access_token) {
                  console.log("Token encontrado, enviando al servidor");
                  
                  // Enviar el token al servidor
                  fetch('/api/v1/oauth/process-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(params)
                  })
                  .then(response => {
                    console.log("Respuesta del servidor:", response.status);
                    return response.json();
                  })
                  .then(data => {
                    console.log("Datos del servidor:", data);
                    if (data.success) {
                      window.location.href = '/api/v1/profile';
                    } else {
                      window.location.href = '/api/v1/account?error=' + encodeURIComponent(data.error || 'Error desconocido');
                    }
                  })
                  .catch(err => {
                    console.error("Error procesando token:", err);
                    window.location.href = '/api/v1/account?error=error_procesando_token';
                  });
                } else {
                  console.log("No se encontró token en el hash");
                  window.location.href = '/api/v1/account?error=no_token_found';
                }
              } else {
                console.log("No se encontró hash ni código");
                // Si no hay hash ni código, intentar redireccionar a la página del OAuth nuevamente
                window.location.href = '/api/v1/loginoauth/google';
              }
            };
          </script>
        </head>
        <body>
          <div style="text-align: center; margin-top: 100px;">
            <h3>Procesando su autenticación...</h3>
            <p>Por favor espere un momento.</p>
            <p id="debug"></p>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('General error in OAuth callback:', error);
    return res.status(500).render('account', { 
      errorMessage: 'Server error during authentication: ' + error.message
    });
  }
}

// Funcion para obtener la lista de usuarios
async function getUsersList (req, res) {
    try {
      const response = await queries.getUsers(); 
      res.status(200).json({
          success: true,
          data: response,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
};

// Funcion para obtener los puntajes de los usuarios
async function getUsersScores (req, res) {
    try {
      const response = await queries.getScores(); 
      res.status(200).json({
          success: true,
          data: response,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
};

async function getQuestionsTrivia (req, res) {
    try {
      const response = await queries.getQuestions(); 
      res.status(200).json({
          success: true,
          data: response,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
};

async function getQuote(req, res) {
    try {
      const question = await queries.getRandomQuestion();
      
      if (!question) {
        return res.status(404).json({ success: false, error: "No questions available" });
      }

      // Mezclar las opciones
      const allOptions = [question.correct_character, ...question.incorrect_options];
      // Selecciona 4 opciones de la BD 3 erroneas y 1 correcta
      if (allOptions.length > 4) {
        allOptions.splice(4);
      } else if (allOptions.length < 4) {
        console.error("Not enough options for question ID:", question.id);
        return res.status(500).json({ success: false, error: "Not enough options available" });
      }

      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      res.status(200).json({
          success: true,
          data: {
            id: question.id,
            quote: question.quote,
            options: shuffledOptions
          }
      });

    } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
    }
}

async function healthCheck(req, res) {
    res.status(200).json({
      success: true,
      message: 'La API está funcionando correctamente',
      timestamp: new Date().toISOString()
    });
}

async function getQuotesByCharacter(req, res) {
    try {
      const characterId = parseInt(req.params.characterId);
      
      if (isNaN(characterId)) {
        return res.status(400).json({
          success: false,
          message: 'Character ID must be a number'
        });
      }

      const result = await queries.getQuotesByCharacter(characterId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `Character with ID ${characterId} does not exist`
        });
      }

      if (result.quotes.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No quotes found for character ${result.character.name}`
        });
      }

        // Convertir el array de quotes en un objeto con el indice como clave
        const quotesObject = result.quotes.reduce((acc, quote, index) => {
          acc[index + 1] = {
            id: quote.id,
            quote: quote.quote
          };
          return acc;
      }, {});

      res.json({
        success: true,
        data: {
          character: result.character.name,
          totalQuotes: result.totalQuotes,
          quotes: quotesObject
        }
      });
    } catch (error) {
      console.error('Error getting quotes by character:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting quotes by character'
      });
    }
};

const getCharacters = async (req, res) => {
    try {
      const characters = await queries.getCharacters();
      
      if (characters.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No characters found"
        });
      }

      const charactersArray = characters.map(character => ({
        id: character.id,
        name: character.name
      }));

      res.status(200).json({
        success: true,
        data: charactersArray
      });
    } catch (error) {
      console.error('Error getting characters:', error);
      res.status(500).json({
        success: false,
        message: "Error getting characters",
        error: error.message
      });
    }
};

const supabaseAuth = async (req, res, next) => {
  // Obtener el token de las cookies
  const token = req.cookies.accessToken;
  
  // Si no hay token, configurar como usuario anónimo y continuar
  if (!token) {
    // Si ya hay un usuario anónimo configurado, no crear otro
    if (!req.user || !req.user.isAnonymous) {
      req.user = { 
        isAnonymous: true,
        role: 'anon',
        id: req.sessionID || 'anonymous-' + Math.random().toString(36).substring(2, 15)
      };
    }
    return next();
  }
  
  try {
    const { data, error } = await supabaseConection.auth.getUser(token);

    if (error || !data) {
      // Token inválido, tratar como usuario anónimo
      if (!req.user || !req.user.isAnonymous) {
        req.user = { 
          isAnonymous: true,
          role: 'anon',
          id: req.sessionID || 'anonymous-' + Math.random().toString(36).substring(2, 15)
        };
        console.log('Invalid token, setting anonymous user');
      }
      return next();
    }

    // Obtiene la data del usuario
    const userData = data.user;
    const userID = userData.id;

    console.log("userData supabaseAuth", userData);
    
    // En lugar de llamar a getUserDataSupabaseAuth, hacemos una consulta directa
    // para verificar si el usuario existe, y si no, lo tratamos como anónimo
    try {
      req.user = { 
        user: userData,
        dataUser: { 
          id: userID,
          role: 'user' // Asignamos un rol por defecto
        }
      };
      
      // Evitamos completamente la llamada a getUserDataSupabaseAuth
      // Esto debería evitar el error actual
      
      next();
    } catch (dbError) {
      console.warn('Error procesando usuario:', dbError.message);
      if (!req.user || !req.user.isAnonymous) {
        req.user = { 
          isAnonymous: true,
          role: 'anon',
          id: req.sessionID || 'anonymous-' + Math.random().toString(36).substring(2, 15)
        };
      }
      next();
    }
  } catch (error) {
    console.error('Error en supabaseAuth:', error);
    if (!req.user || !req.user.isAnonymous) {
      req.user = { 
        isAnonymous: true,
        role: 'anon',
        id: req.sessionID || 'anonymous-' + Math.random().toString(36).substring(2, 15)
      };
    }
    next();
  }
};

const logoutUser = async (req, res) => {
  try {
    // Intentar obtener información del usuario de múltiples fuentes
    let userInfo = 'usuario desconocido';
    let isAnonymous = false;
    
    if (req.user) {
      // Verificar si es anónimo
      isAnonymous = req.user.isAnonymous || false;
      
      // Extraer información del usuario según la estructura
      if (req.user.user?.email) {
        userInfo = req.user.user.email;
      } else if (req.user.user?.id) {
        userInfo = req.user.user.id;
      } else if (req.user.dataUser?.id) {
        userInfo = req.user.dataUser.id;
      } else if (req.user.id) {
        userInfo = req.user.id;
      }
    }
    
    console.log(`Cerrando sesión para ${isAnonymous ? 'usuario anónimo' : 'usuario registrado'}: ${userInfo}`);
    
    // Primero limpiar cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    // Luego cerrar sesión en Supabase
    const { error } = await supabaseConection.auth.signOut();
    
    if (error) {
      console.error('Error en Supabase al cerrar sesión:', error);
      return res.status(400).json({ success: false, error: error.message });
    }
    
    console.log(`Sesión cerrada correctamente para: ${userInfo}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Logout successful',
      user: userInfo,
      wasAnonymous: isAnonymous
    });
  } catch (error) {
    console.error('Error en logoutUser:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Ruta protegida para pruebas en backend luego del login
const protectedRoute = (req, res) => {
  try {
    const userId = req.user.user.id;
    res.render('profile', { user: userId });
  } catch (error) {
    console.error('Error in protectedRoute:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

function calculateScore(time) {
  let score = 1;

  if (time) {
    if (time <= 2000) {
      score = 6;
    }
    else if (time <= 5000) {
      score = 4;
    } else if (time <= 10000) {
      score = 2;
    } else {
      score = 1;
    }
  }
  return score;
}

// Enviar respuesta a una pregunta
async function answerQuestion(req, res) {
  try {
    const quoteId = req.params.id;
    const { answer, time = null } = req.body;
    const user = req.user; // ID del usuario (anónimo o registrado)

    const isCorrect = await queries.checkAnswer(quoteId, answer);
    let scoreToAdd = 0;
    let currentStreak = 0;

    if (isCorrect) {
      scoreToAdd = calculateScore(time);
      
      if (user && !user.isAnonymous) {
        const userID = user.id
        await queries.updateUserScore(userID, scoreToAdd, time);
        await queries.lastScoreUser(userID);
        
        // Obtener la racha actual después de la actualización
        const stats = await queries.getUserStats(userID);
        currentStreak = stats.current_streak;
      } else {
        const sessionId = user?.id || req.sessionID;
        const result = await queriesRedis.updateUserScore(sessionId, scoreToAdd);
        currentStreak = result.currentStreak;
        (async () => {
          await queriesRedis.getTriviaKeys();
        })();
      }
    } else {
      if (user && !user.isAnonymous) {
        await queries.updateUserScoreFailed(user.id);
        currentStreak = 0; // Se resetea la racha al fallar
      } else {
        const sessionId = user?.id || req.sessionID;
        await queriesRedis.updateUserScoreFailed(sessionId);
        currentStreak = 0; // Se resetea la racha al fallar
      }
    }

    res.json({
      success: true,
      result: {
        correct: isCorrect,
        score: isCorrect ? scoreToAdd : 0,
        currentStreak: currentStreak,
        time: time,
        message: isCorrect ? '¡Correct!' : '¡Incorrect! Game over!'
      }
    });

  } catch (error) {
    console.error('Error in answerQuestion:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

async function getUserStats(req, res) {
  try {
    let stats;
    
    if (req.user && !req.user.isAnonymous) {
      // Usuario registrado - usar PostgreSQL
      const userId = req.user.user.id;
      stats = await queries.getUserStats(userId);
    } else {
      // Usuario anónimo - usar Redis
      const sessionId = req.user?.id || req.sessionID;
      stats = await queriesRedis.getUserStats(sessionId);
    }

    const accuracy = stats.total_questions > 0
      ? ((stats.correct_answers / stats.total_questions) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        currentScore: stats.current_score,
        highestScore: stats.highest_score,
        lastScore: stats.last_score,
        answerTime: stats.avg_answer,
        correctAnswers: stats.correct_answers,
        incorrectAnswers: stats.incorrect_answers,
        highestScoreCorrectAnswers: stats.highest_score_correct_answers,
        bestStreak: stats.best_streak,
        currentStreak: stats.current_streak,
        totalQuestions: stats.total_questions,
        accuracy: `${accuracy}%`
      }
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving user statistics'
    });
  }
}

async function resetGameSession(req, res) {
  try {
    if (req.user && !req.user.isAnonymous) {
      // Usuario registrado - resetear en PostgreSQL
      const userId = req.user.user.id;
      await queries.resetGameSession(userId);
    } else {
      // Usuario anónimo - resetear en Redis
      const sessionId = req.user?.id || req.sessionID;
      await queriesRedis.resetGameSession(sessionId);
    }

    res.json({
      success: true,
      message: 'Game session reset successfully'
    });
  } catch (error) {
    console.error('Error in resetGameSession:', error);
    res.status(500).json({
      success: false,
      error: 'Error resetting game session'
    });
  }
}

async function gameOverRefreshPage(req, res) {
  try {
    const userId = req.user.id;
    await queries.updateUserScoreFailed(userId);
  } catch (error) {
    console.error('Error in gameOverRefreshPage:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating user score refresh page'
    });
  }
}

async function userDataProfile(req, res) {
  try {
    const userId = req.user.user.id;
    const userData = await queries.getUserData(userId);

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error in userDataProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving user data'
    });
  }
}

async function processOAuthToken(req, res) {
  try {
    console.log("processOAuthToken - Body recibido:", req.body);
    
    const access_token = req.body.access_token;
    const refresh_token = req.body.refresh_token;
    const expires_in = parseInt(req.body.expires_in || '3600');
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Token de acceso no proporcionado'
      });
    }
    
    // Validar token con Supabase
    const { data, error } = await supabaseConection.auth.getUser(access_token);
    
    if (error) {
      console.error('Error validando token:', error);
      return res.status(400).json({
        success: false,
        error: 'Token inválido: ' + error.message
      });
    }
    
    // Establecer cookies
    res.cookie('accessToken', access_token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: expires_in * 1000
    });
    
    if (refresh_token) {
      res.cookie('refreshToken', refresh_token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    }
    
    // Guardar usuario en BD si es necesario
    if (data && data.user && data.user.email) {
      try {
        const userEmail = data.user.email;
        const existingUser = await queries.getUserByEmail(userEmail);
        
        if (!existingUser) {
          const userName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || userEmail.split('@')[0];
          
          await queries.createUserOAuth({
            id: data.user.id,
            email: userEmail,
            username: userName,
            provider: data.user.app_metadata?.provider || 'oauth'
          });
        }
      } catch (dbError) {
        console.error('Error guardando usuario OAuth:', dbError);
      }
    }
    
    return res.json({
      success: true,
      message: 'Autenticación exitosa'
    });
    
  } catch (error) {
    console.error('Error procesando token OAuth:', error);
    return res.status(500).json({
      success: false,
      error: 'Error del servidor procesando token'
    });
  }
}

// Función para linkear un proveedor OAuth a la cuenta actual
async function linkOAuthProvider(req, res) {
  try {
    const { provider } = req.params;
    
    console.log('LinkOAuth - Starting linking process for provider:', provider);
    console.log('LinkOAuth - User authenticated:', !!req.user && !req.user.isAnonymous);
    
    if (!provider || !['google', 'github'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: "Invalid provider. Use 'google' or 'github'"
      });
    }

    // Verificar que el usuario esté autenticado
    if (!req.user || req.user.isAnonymous || !req.user.dataUser || !req.user.dataUser.id) {
      console.log('LinkOAuth - Authentication failed:', {
        hasUser: !!req.user,
        isAnonymous: req.user?.isAnonymous,
        hasDataUser: !!req.user?.dataUser,
        hasDataUserId: !!req.user?.dataUser?.id
      }); // Debug
      
      return res.status(401).json({
        success: false,
        error: "User must be authenticated to link accounts"
      });
    }

    // Obtener el token de acceso del usuario autenticado
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: "Access token not found. Please login again."
      });
    }

    // Primero establecer la sesión del usuario en el cliente
    const userSupabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    
    // Establecer la sesión del usuario autenticado
    const { data: session, error: sessionError } = await userSupabase.auth.setSession({
      access_token: accessToken,
      refresh_token: req.cookies.refreshToken || ''
    });
    
    if (sessionError) {
      console.error('Error setting session for linking:', sessionError);
      return res.status(401).json({
        success: false,
        error: 'Invalid session for linking'
      });
    }

    console.log('Session established for linking:', !!session.session); // Debug

    // Generar URL de callback usando la misma lógica que el OAuth normal
    const port = config.port || 3000;
    const baseUrl = config.nodeEnv === 'production' 
      ? `https://${config.urlHost}`
      : `http://localhost:${port}`;
    const callbackUrl = `${baseUrl}/api/v1/oauth/link-callback`;
    
    console.log('LinkOAuth - Using callback URL:', callbackUrl); // Debug

    // Generar URL de linking con Supabase usando el cliente autenticado
    const { data, error } = await userSupabase.auth.linkIdentity({
      provider: provider,
      options: {
        redirectTo: callbackUrl
      }
    });

    if (error) {
      console.error('Error generating link URL:', error);
      return res.status(500).json({
        success: false,
        error: 'Error generating authentication link: ' + error.message
      });
    }

    console.log('LinkOAuth - Successfully generated linking URL for provider:', provider);
    
    return res.json({
      success: true,
      linkUrl: data.url,
      message: `Redirect to this URL to link your ${provider} account`
    });

  } catch (error) {
    console.error('Error in linkOAuthProvider:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during account linking'
    });
  }
}

// Función para manejar el callback del linking
async function handleOAuthLinkCallback(req, res) {
  try {
    console.log("OAuth Link Callback - Query:", JSON.stringify(req.query));
    console.log("OAuth Link Callback - Hash:", req.url.includes('#') ? 'Hash present' : 'No hash');
    console.log("OAuth Link Callback - Full URL:", req.originalUrl);
    
    // Verificar si hay un código de autorización
    if (req.query.code) {
      console.log('OAuth account linked successfully with code');
      return res.redirect('/api/v1/profile?linked=success');
    }

    // Verificar si hay un error explícito
    if (req.query.error) {
      console.error('OAuth linking error:', req.query.error);
      return res.redirect('/api/v1/profile?linked=error&message=' + encodeURIComponent(req.query.error_description || req.query.error));
    }

    // Si no hay query params, podría ser que el linking se completó pero sin parámetros
    // En este caso, asumimos éxito y dejamos que el frontend verifique
    console.log('OAuth link callback without query params - assuming success');
    return res.redirect('/api/v1/profile?linked=success');

  } catch (error) {
    console.error('Error in OAuth link callback:', error);
    return res.redirect('/api/v1/profile?linked=error&message=' + encodeURIComponent('Server error during account linking'));
  }
}

// Función para obtener las identidades vinculadas del usuario
async function getUserLinkedIdentities(req, res) {
  try {
    if (!req.user || req.user.isAnonymous || !req.user.dataUser || !req.user.dataUser.id) {
      return res.status(401).json({
        success: false,
        error: "User must be authenticated"
      });
    }

    // Obtener datos del usuario de Supabase
    const { data: { user }, error } = await supabaseConection.auth.getUser(req.cookies.accessToken);
    
    if (error) {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication"
      });
    }

    // Extraer información de las identidades
    const identities = user.identities || [];
    const linkedProviders = identities.map(identity => ({
      provider: identity.provider,
      email: identity.identity_data?.email,
      created_at: identity.created_at,
      updated_at: identity.updated_at
    }));

    return res.json({
      success: true,
      data: {
        user_id: user.id,
        email: user.email,
        linked_providers: linkedProviders,
        total_linked: linkedProviders.length
      }
    });

  } catch (error) {
    console.error('Error getting linked identities:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving linked accounts'
    });
  }
}

// Función para desenlazar un proveedor OAuth
async function unlinkOAuthProvider(req, res) {
  try {
    const { provider } = req.params;
    
    if (!provider || !['google', 'github'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: "Invalid provider. Use 'google' or 'github'"
      });
    }

    if (!req.user || req.user.isAnonymous || !req.user.dataUser || !req.user.dataUser.id) {
      return res.status(401).json({
        success: false,
        error: "User must be authenticated"
      });
    }

    // Obtener identidades actuales
    const { data: { user }, error: userError } = await supabaseConection.auth.getUser(req.cookies.accessToken);
    
    if (userError) {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication"
      });
    }

    const identities = user.identities || [];
    const providerIdentity = identities.find(id => id.provider === provider);
    
    if (!providerIdentity) {
      return res.status(404).json({
        success: false,
        error: `No ${provider} account linked to this user`
      });
    }

    // Verificar que no sea la única identidad
    if (identities.length <= 1) {
      return res.status(400).json({
        success: false,
        error: "Cannot unlink the only authentication method. Link another provider first."
      });
    }

    // Crear cliente de Supabase con el token del usuario
    const userSupabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${req.cookies.accessToken}`
        }
      }
    });

    // Desenlazar la identidad
    const { error: unlinkError } = await userSupabase.auth.unlinkIdentity(providerIdentity);
    
    if (unlinkError) {
      console.error('Error unlinking identity:', unlinkError);
      return res.status(500).json({
        success: false,
        error: 'Error unlinking account'
      });
    }

    return res.json({
      success: true,
      message: `${provider} account unlinked successfully`
    });

  } catch (error) {
    console.error('Error in unlinkOAuthProvider:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during account unlinking'
    });
  }
}

module.exports = {
  registerUserReq,
  loginUserReq,
  loginUserOAuth,
  handleOAuthCallback,
  changeUserRole,
  getUsersList,
  getUsersScores,
  getQuestionsTrivia,
  getQuote,
  healthCheck,
  getQuotesByCharacter,
  getCharacters,
  supabaseAuth,
  logoutUser,
  protectedRoute,
  answerQuestion,
  getUserStats,
  resetGameSession,
  userDataProfile,
  gameOverRefreshPage,
  processOAuthToken,
  linkOAuthProvider,
  handleOAuthLinkCallback,
  getUserLinkedIdentities,
  unlinkOAuthProvider
};