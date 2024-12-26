const queries = require('../dbFiles/queries');
const accountRegister = require('../account/register');
const accountLogin = require('../account/login');
const rolesManager = require('../account/roles/rolesManager');
const { supabaseConection } = require('../account/authSupabase');
const config = require('../../config');
const queriesRedis = require('../dbFiles/queriesRedis');
const redisManager = require('../dbFiles/redisManager');

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

const logoutUser = async (req, res) => {
  try {
    const { error } = await supabaseConection.auth.signOut();
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.clearCookie('accessToken').clearCookie('refreshToken').status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Error in logoutUser:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Ruta protegida para pruebas en backend luego del login
const protectedRoute = (req, res) => {
  try {
    const userId = req.user.user.id;
    res.render('protected', { user: userId });
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

    if (isCorrect) {
      scoreToAdd = calculateScore(time);
      
      if (user && !user.isAnonymous) {
        const userID = user.id
        await queries.updateUserScore(userID, scoreToAdd, time);
        await queries.lastScoreUser(userID);
      } else {
        const sessionId = user?.id || req.sessionID;
        await queriesRedis.updateUserScore(sessionId, scoreToAdd);
        (async () => {
          await redisManager.debugRedis('*');
        })();
      }
    } else {
      if (user && !user.isAnonymous) {
        await queries.updateUserScoreFailed(user.id);
      }
    }

    res.json({
      success: true,
      result: {
        correct: isCorrect,
        score: isCorrect ? scoreToAdd : 0,
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
    const userId = req.user.user.id;
    const stats = await queries.getUserStats(userId);

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
  supabaseAuth,
  logoutUser,
  protectedRoute,
  answerQuestion,
  getUserStats,
  userDataProfile,
  gameOverRefreshPage
};