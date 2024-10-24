const queries = require('../dbFiles/queries');
const accountRegister = require('../account/register');
const accountLogin = require('../account/login');
const rolesManager = require('../account/roles/rolesManager')
const { supabaseConection } = require('../account/authSupabase')

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
    const data = await accountRegister.registerUser(username, email, password, defaultRole, res);

    // Establecer cookies después de un inicio de sesión exitoso
    res.cookie('accessToken', data.session.access_token, {
      httpOnly: true, // Solo se puede acceder desde el servidor
      secure: process.env.NODE_ENV === 'production', // secure true en produccion
      sameSite: 'strict', // Evitar que se envien a través de peticiones CSRF
      maxAge: 1000 * 60 * 60 // 1 hora de duracion de la cookie
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        token: data.session.access_token,
        data: {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
          created_at: data.user.created_at,
        },
    });
  }
  catch (e) {
    console.log(e);
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
      secure: process.env.NODE_ENV === 'production', // secure true en produccion
      sameSite: 'strict', // Evitar que se envien a través de peticiones CSRF
      maxAge: 1000 * 60 * 60 // 1 hora de duracion de la cookie
    });
    //res.cookie('refreshToken', data.session.refresh_token, { httpOnly: true, secure: true }); // Asegúrate de que 'secure' sea true en producción

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
    console.log(e);
    if (e.message === "Invalid login credentials") {
      return res.status(401).json({ success: false, error: "Invalid credentials. Please check your email and password." });
    } else {
      next(e);
    }
  }
};

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
  try {
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const { data, error } = await supabaseConection.auth.getUser(token);

    if (error || !data) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Obtiene la data del usuario
    const userData = data.user;
    // Obtiene el id dentro de la data
    const userID = userData.id;
    // Busca mediante el id el rol del usuario
    const userDataDB = await queries.getUserDataSupabaseAuth(userID);

    // Devuelve la data del usuario (por si se quiere usar) y los datos del usuario de la DB
    req.user = { user: userData, dataUser: userDataDB };
    next();
  } catch (error) {
    console.error('Error in supabaseAuth:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
    registerUserReq,
    loginUserReq,
    changeUserRole,
    getUsersList,
    getUsersScores,
    getQuestionsTrivia,
    getQuote,
    healthCheck,
    getQuotesByCharacter,
    getCharacters,
    supabaseAuth
};