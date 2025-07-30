const redisManager = require('./redisManager');

// Usar un prefijo específico para evitar conflictos con otras aplicaciones
const KEY_PREFIX = 'trivia';

function getKey(userId, field) {
    return `${KEY_PREFIX}:user:${userId}:${field}`;
}

async function updateUserScore(userId, score) {
    try {
        // Obtener valores actuales para calcular nuevos máximos
        const currentStreak = await getCurrentStreak(userId);
        const bestStreak = await getBestStreak(userId);
        
        const newStreak = currentStreak + 1;
        const newBestStreak = Math.max(newStreak, bestStreak);
        
        // Incrementar score y obtener el nuevo valor
        const result = await redisManager.transaction([
            ['incrby', getKey(userId, 'score'), score],
            ['incr', getKey(userId, 'correct_answers')],
            ['incr', getKey(userId, 'total_questions')],
            ['set', getKey(userId, 'current_streak'), newStreak],
            ['set', getKey(userId, 'best_streak'), newBestStreak],
            ['setex', getKey(userId, 'lastUpdate'), 3600, Date.now()]
        ]);
        
        // El primer resultado de la transacción es el nuevo score
        const newScore = result[0][1]; // result[0] = ['incrby', newScore]
        
        // Actualizar highest_score si es necesario
        const currentHighestScore = await getHighestScore(userId);
        if (newScore > currentHighestScore) {
            await redisManager.set(getKey(userId, 'highest_score'), newScore);
        }
        
        return {
            score: newScore,
            currentStreak: newStreak,
            bestStreak: newBestStreak,
            highestScore: Math.max(newScore, currentHighestScore)
        };
    } catch (error) {
        console.error('Error updating user score:', error);
        throw error;
    }
}

async function updateUserScoreFailed(userId) {
    try {
        const currentScore = await getUserScore(userId);
        
        // Solo guardar last_score si es mayor a 0
        const commands = [
            ['incr', getKey(userId, 'incorrect_answers')],
            ['incr', getKey(userId, 'total_questions')],
            ['set', getKey(userId, 'score'), 0],
            ['set', getKey(userId, 'current_streak'), 0],
            ['setex', getKey(userId, 'lastUpdate'), 3600, Date.now()]
        ];
        
        if (currentScore > 0) {
            commands.unshift(['set', getKey(userId, 'last_score'), currentScore]);
        }
        
        await redisManager.transaction(commands);
        
        return {
            score: 0,
            lastScore: currentScore > 0 ? currentScore : await getLastScore(userId),
            currentStreak: 0
        };
    } catch (error) {
        console.error('Error updating user score failed:', error);
        throw error;
    }
}

async function getUserScore(userId) {
    try {
        const score = await redisManager.get(getKey(userId, 'score'));
        return score ? parseInt(score) : 0;
    } catch (error) {
        console.error('Error getting user score:', error);
        return 0;
    }
}

async function getCurrentStreak(userId) {
    try {
        const streak = await redisManager.get(getKey(userId, 'current_streak'));
        return streak ? parseInt(streak) : 0;
    } catch (error) {
        console.error('Error getting current streak:', error);
        return 0;
    }
}

async function getBestStreak(userId) {
    try {
        const streak = await redisManager.get(getKey(userId, 'best_streak'));
        return streak ? parseInt(streak) : 0;
    } catch (error) {
        console.error('Error getting best streak:', error);
        return 0;
    }
}

async function getHighestScore(userId) {
    try {
        const score = await redisManager.get(getKey(userId, 'highest_score'));
        return score ? parseInt(score) : 0;
    } catch (error) {
        console.error('Error getting highest score:', error);
        return 0;
    }
}

async function getLastScore(userId) {
    try {
        const score = await redisManager.get(getKey(userId, 'last_score'));
        return score ? parseInt(score) : 0;
    } catch (error) {
        console.error('Error getting last score:', error);
        return 0;
    }
}

async function getUserStats(userId) {
    try {
        const [score, lastScore, highestScore, correctAnswers, incorrectAnswers, 
               totalQuestions, currentStreak, bestStreak] = await Promise.all([
            getUserScore(userId),
            getLastScore(userId),
            getHighestScore(userId),
            redisManager.get(getKey(userId, 'correct_answers')).then(val => val ? parseInt(val) : 0),
            redisManager.get(getKey(userId, 'incorrect_answers')).then(val => val ? parseInt(val) : 0),
            redisManager.get(getKey(userId, 'total_questions')).then(val => val ? parseInt(val) : 0),
            getCurrentStreak(userId),
            getBestStreak(userId)
        ]);
        
        return {
            current_score: score,
            last_score: lastScore,
            highest_score: highestScore,
            correct_answers: correctAnswers,
            incorrect_answers: incorrectAnswers,
            total_questions: totalQuestions,
            current_streak: currentStreak,
            best_streak: bestStreak,
            avg_answer: 0, // No trackeo tiempo promedio en Redis por simplicidad
            highest_score_correct_answers: 0 // No trackeo esto para anónimos
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        return {
            current_score: 0,
            last_score: 0,
            highest_score: 0,
            correct_answers: 0,
            incorrect_answers: 0,
            total_questions: 0,
            current_streak: 0,
            best_streak: 0,
            avg_answer: 0,
            highest_score_correct_answers: 0
        };
    }
}

// Función para limpiar datos de usuario anónimo
async function deleteAnonymousUser(userId) {
    try {
        const keysToDelete = [
            getKey(userId, 'score'),
            getKey(userId, 'last_score'),
            getKey(userId, 'highest_score'),
            getKey(userId, 'correct_answers'),
            getKey(userId, 'incorrect_answers'),
            getKey(userId, 'total_questions'),
            getKey(userId, 'current_streak'),
            getKey(userId, 'best_streak'),
            getKey(userId, 'lastUpdate')
        ];
        
        await redisManager.transaction(
            keysToDelete.map(key => ['del', key])
        );
        
        console.log(`Deleted anonymous user data for: ${userId}`);
        return true;
    } catch (error) {
        console.error('Error deleting anonymous user:', error);
        return false;
    }
}

// Función para resetear la racha actual y puntaje al iniciar nueva sesión de juego
async function resetGameSession(userId) {
    try {
        await redisManager.transaction([
            ['set', getKey(userId, 'current_streak'), 0],
            ['set', getKey(userId, 'score'), 0]
        ]);
        return true;
    } catch (error) {
        console.error('Error resetting game session:', error);
        return false;
    }
}

// Función para obtener solo claves del trivia (útil para debug)
async function getTriviaKeys() {
    try {
        return await redisManager.getAllKeys(`${KEY_PREFIX}:*`);
    } catch (error) {
        console.error('Error getting trivia keys:', error);
        return {};
    }
}

module.exports = {
    updateUserScore,
    updateUserScoreFailed,
    getUserScore,
    getCurrentStreak,
    getBestStreak,
    getHighestScore,
    getLastScore,
    getUserStats,
    deleteAnonymousUser,
    resetGameSession,
    getTriviaKeys
}