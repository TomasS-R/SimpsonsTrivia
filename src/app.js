const databaseManager = require('./dbFiles/databaseManager');
const { createTables } = require('./dbFiles/queries');
const userTables = require('./dbFiles/creatingTables/userTables');
const express = require('express');

const app = express();
app.use(express.json());

// Verifica si el host es localhost y si el puerto es diferente a 3000
const isProductionHost = (process.env.HOST && process.env.HOST.replace(/:$/, '') !== 'localhost');
const isProductionPort = process.env.PORT && process.env.PORT !== '3000';

const PORT = isProductionPort ? process.env.PORT : 3000;
const HOST = isProductionHost ? process.env.HOST : 'localhost:';

// Colores para mensajes en la terminal
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const BOLD = '\x1b[1m';

// Verifica si la conexión a postgres está habilitada
const connectionps = process.env.CONNECTPOSTGRES === 'False' ? false : true;

async function configureApp() {
    try {
        // Conectar a postgres
        await databaseManager.connectToPostgres(connectionps);

        if (databaseManager.isPostgresConnected()) {
            // Crear las tablas en la base de datos
            // Tabla usuarios
            await createTables(userTables.tableNameUsers, userTables.columnsUsers);
            // Tabla personajes
            await createTables(userTables.tableNameCharacter, userTables.columnsCharacter);
            // Tabla puntajes
            await createTables(userTables.tableNameScores, userTables.columnsScores);
            // Tabla preguntas
            await createTables(userTables.tableNameQuotes, userTables.columnsQuotes);
            // Tabla frases creadas por los usuarios
            await createTables(userTables.tableNameQuotesUsers, userTables.columnsQuotesUsers);
        }
        // Mostrar mensajes en la terminal según el entorno
        if (isProductionHost == true) {
            console.log(`${RED}${BOLD}⚠️  Advertencia: ¡Estás en modo producción!${RESET}`);
            app.listen(PORT, () => console.log(`Server running on url: http://${HOST}`));
        } else {
            console.log(`${GREEN}${BOLD}🔧 Estás en modo desarrollo.${RESET}`);
            app.listen(PORT, () => console.log(`Server running on port ${PORT} url: http://${HOST}${PORT}`));
        }
    } catch (error) {
        console.log(`${RED}${BOLD}Error: ${error.message}${RESET}`);
    }
}

configureApp();

module.exports = {
    app,
};