const redisManager = require('./redisManager');

async function updateUserScore(userId, score) {
    try {
        await redisManager.transaction([
            ['incrby', `user:${userId}:score`, score],
            ['setex', `user:${userId}:lastUpdate`, 3600, Date.now()]
        ]);
    } catch (error) {
        console.error('Error updating user score:', error);
        throw error;
    }
}

module.exports = {
    updateUserScore
}