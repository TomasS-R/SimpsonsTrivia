const queries = require('../dbFiles/queries');

// Funcion para validar el email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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

module.exports = {
    validateEmail,
    getUsersList,
    getUsersScores,
    getQuestionsTrivia,
};