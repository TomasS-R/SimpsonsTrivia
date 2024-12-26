const Redis = require('ioredis');
const config = require('../../config');

class RedisManager {
    constructor() {
        this.redisClient = null;
    }

    async connectToRedis(shouldConnect = true) {
        if (shouldConnect && !this.redisClient) {
            const { upstashRedisUrl, upstashRedisToken } = config;

            if (!upstashRedisUrl || !upstashRedisToken) {
                console.log('Missing required environment variables for Redis connection');
                return null;
            }

            try {
                this.redisClient = new Redis({
                    url: upstashRedisUrl,
                    token: upstashRedisToken,
                    maxRetriesPerRequest: null,
                    retryStrategy: (times) => {
                        console.log(`Retry attempt #${times}`);
                        return null;
                    },
                });

                // Verificar la conexión
                await this.redisClient.ping();
                console.log('😄 Connected to Redis');
            } catch (err) {
                console.error('😞 Error connecting to Redis:', err);
                this.redisClient = null;
            }
        } else if (!shouldConnect) {
            console.log('💬 Not connected to Redis, if you want to connect use True in variable CONNECTREDIS file .env');
        }
        return this.redisClient;
    }

    isRedisConnected() {
        return this.redisClient !== null;
    }

    // Obtener valor
    async get(key) {
        if (!this.redisClient) {
            console.error('Not connected to Redis');
            return null;
        }
        try {
            return await this.redisClient.get(key);
        } catch (err) {
            console.error('Error getting data from Redis:', err);
            throw err;
        }
    }

    // Establecer valor con tiempo de expiración opcional
    async set(key, value, expireSeconds = null) {
        if (!this.redisClient) {
            console.error('Not connected to Redis');
            return null;
        }
        try {
            if (expireSeconds) {
                return await this.redisClient.setex(key, expireSeconds, value);
            }
            return await this.redisClient.set(key, value);
        } catch (err) {
            console.error('Error setting data in Redis:', err);
            throw err;
        }
    }

    async delete(key) {
        if (!this.redisClient) {
            console.error('Not connected to Redis');
            return null;
        }
        try {
            return await this.redisClient.del(key);
        } catch (err) {
            console.error('Error deleting data from Redis:', err);
            throw err;
        }
    }

    async exists(key) {
        if (!this.redisClient) {
            console.error('Not connected to Redis');
            return null;
        }
        try {
            return await this.redisClient.exists(key);
        } catch (err) {
            console.error('Error checking key existence in Redis:', err);
            throw err;
        }
    }

    // Establecer valor con tiempo de expiración
    async setex(key, seconds, value) {
        if (!this.redisClient) {
            console.error('Not connected to Redis');
            return null;
        }
        try {
            return await this.redisClient.setex(key, seconds, value);
        } catch (err) {
            console.error('Error setting data with expiration in Redis:', err);
            throw err;
        }
    }

    // Función para obtener todas las claves que coincidan con un patrón
    async getAllKeys(pattern = '*') {
        if (!this.redisClient) {
            console.error('Not connected to Redis');
            return null;
        }
        try {
            const keys = await this.redisClient.keys(pattern);
            const result = {};
            
            for (const key of keys) {
                const value = await this.get(key);
                result[key] = value ? JSON.parse(value) : null;
            }
            
            return result;
        } catch (err) {
            console.error('Error getting all keys from Redis:', err);
            throw err;
        }
    }

    async ttl(key) {
        if (!this.redisClient) {
            console.error('Not connected to Redis');
            return null;
        }
        try {
            return await this.redisClient.ttl(key);
        } catch (err) {
            console.error('Error getting TTL from Redis:', err);
            throw err;
        }
    }

    async execute(command, ...args) {
        if (!this.redisClient) {
            console.error('Not connected to Redis');
            return null;
        }
        
        try {
            // Verificar que el comando existe en el cliente Redis
            if (typeof this.redisClient[command] !== 'function') {
                throw new Error(`Invalid Redis command: ${command}`);
            }

            const result = await this.redisClient[command](...args);
            return result;

        } catch (err) {
            console.error(`Error executing Redis command ${command}:`, err);
            throw err;
        }
    }

    // Método para ejecutar múltiples comandos en una transacción
    async transaction(commands) {
        if (!this.redisClient) {
            console.error('Not connected to Redis');
            return null;
        }

        try {
            const multi = this.redisClient.multi();

            for (const [command, ...args] of commands) {
                if (typeof multi[command] !== 'function') {
                    throw new Error(`Invalid Redis command: ${command}`);
                }
                multi[command](...args);
            }

            return await multi.exec();

        } catch (err) {
            console.error('Error executing Redis transaction:', err);
            throw err;
        }
    }

    async debugRedis(pattern = '*') {
        const data = await this.getAllKeys(pattern);
        console.log('\n=== Redis Storage Debug ===');
        console.log('Pattern:', pattern);
        console.log('Stored Data:', JSON.stringify(data, null, 2));
        console.log('========================\n');
        return data;
    }

    async getConnectionInfo() {
        if (!this.redisClient) {
            console.log('\n=== Redis Connection Status ===');
            console.log('Status: Not Connected');
            console.log('========================\n');
            return null;
        }

        try {
            console.log('\n=== Redis Connection Status ===');
            console.log('Status: Connected');
            console.log('URL:', config.upstashRedisUrl);
            console.log('========================\n');

            const pingResult = await this.redisClient.ping();
            console.log('Ping Test:', pingResult === 'PONG' ? 'Successful' : 'Failed');

            return {
                status: 'connected',
                url: config.upstashRedisUrl,
                pingResult
            };
        } catch (err) {
            console.error('Error getting connection info:', err);
            throw err;
        }
    }
}

module.exports = new RedisManager();
