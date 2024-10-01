const { Pool } = require('pg');

// Clase para manejar la conexión a la base de datos
class DatabaseManager {
    constructor() {
        this.pgPool = null;
    }

    // Conectar a la base de datos mediante una conexion pool PostgreSQL
    async connectToPostgres(shouldConnect = true) {
        if (shouldConnect && !this.pgPool) {
            const { DATABASEUSER, DATABASEPASS, DATABASEHOST, DATABASEPORT, DATABASENAME } = process.env;
            
            if (!DATABASEUSER || !DATABASEPASS || !DATABASEHOST || !DATABASEPORT || !DATABASENAME) {
                console.log('Missing required environment variables for PostgreSQL connection');
                return null;
            }
    
            this.pgPool = new Pool({
                user: DATABASEUSER,
                password: DATABASEPASS,
                host: DATABASEHOST,
                port: DATABASEPORT,
                database: DATABASENAME,
                ssl: {
                    rejectUnauthorized: false,
                }
            });

            // Intentar realizar una consulta simple para verificar la conexión
            this.pgPool.query('SELECT 1', (err) => {
                if (err) {
                    console.error('😞 Error connecting to PostgreSQL:', err);
                    this.pgPool = null;
                } else {
                    console.log('😄 Connected to PostgreSQL');
                }
            });
        } else if (!shouldConnect) {
            console.log('💬 Not connected to PostgreSQL, if you want to connect use True in variable CONNECTPOSTGRES file .env');
        }
        return this.pgPool;
    }

    // Desconectar de la base de datos para evitar fugas de memoria
    disconnectFromPostgres() {
        if (this.pgPool) {
            this.pgPool.end();
            this.pgPool = null;
            console.log('Disconnected from PostgreSQL');
        }
    }

    isPostgresConnected() {
        return this.pgPool != null;
    }

    // Realizar las consultas a la base de datos
    async query(sql, params) {
        if (!this.pgPool) {
            console.error('Not connected to PostgreSQL');
            return null;
        }
        const client = await this.pgPool.connect();
        try {
            const res = await client.query(sql, params);
            return res;
        } catch (err) {
            console.error('Error in the query to the data base: ', err);
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new DatabaseManager();