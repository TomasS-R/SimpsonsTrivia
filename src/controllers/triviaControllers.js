const queries = require('../dbFiles/queries');
const accountRegister = require('../account/register');
const accountLogin = require('../account/login');

// Funcion para validar el email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Funcion para registrar un usuario
async function registerUserReq (req, res) {
  try {
      const { email, username, password, role } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, error: "The request needs the 'email' field!" });
      }
      else if (!validateEmail(email)) {
        return res.status(400).json({ success: false, error: "The email is not valid!" });
      }
      else if (!username) {
        return res.status(400).json({ success: false, error: "The request needs the 'username' field!" });
      }
      else if (!password) {
        return res.status(400).json({ success: false, error: "The request needs the 'password' field!" });
      }
      else if (!username || !password || !email) {
        return res.status(400).json({ success: false, error: "The request need 'email', 'username' and 'password' fields!" });
      }
      accountRegister.registerUser(username, email, password, role, res);
  }
  catch (e) {
      console.log(e);
  }
};

// Funcion para loguear un usuario
async function loginUserReq (req, res) {
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
      else if (!validateEmail(email)) {
          return res.status(409).json({ success: false, error: "The email is not valid!" });
      }
      else if (!password) {
          return res.status(409).json({ success: false, error: "The request needs the 'password' field!" });
      }
      else if (!email || !password) {
          return res.status(409).json({ success: false, error: "The request need 'email' and 'password' fields!" });
      }
      accountLogin.loginUser(email, password, res);
  }
  catch (e) {
      console.log(e);
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

module.exports = {
    validateEmail,
    registerUserReq,
    loginUserReq,
    getUsersList,
    getUsersScores,
    getQuestionsTrivia,
    getQuote,
};