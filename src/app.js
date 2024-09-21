const databaseManager = require('./dbFiles/databaseManager');
const { createTables } = require('./dbFiles/queries');
const userTables = require('./dbFiles/creatingTables/userTables');
const express = require('express');

const app = express();
app.use(express.json());

// Determinar el entorno
const isProduction = process.env.NODE_ENV === 'production';

// Configuración del puerto y host
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';


// Colores para mensajes en la terminal
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';

// Verifica si la conexión a postgres está habilitada
const connectionps = process.env.CONNECTPOSTGRES === 'True' ? true : (process.env.CONNECTPOSTGRES === undefined ? false : false);

async function createDatabaseTables() {
    const tables = [
        { name: userTables.tableNameUsers, columns: userTables.columnsUsers },
        { name: userTables.tableNameCharacter, columns: userTables.columnsCharacter },
        { name: userTables.tableNameScores, columns: userTables.columnsScores },
        { name: userTables.tableNameQuotes, columns: userTables.columnsQuotes },
        { name: userTables.tableNameQuotesUsers, columns: userTables.columnsQuotesUsers }
    ];

    for (const table of tables) {
        await createTables(table.name, table.columns);
    }
}

async function configureApp() {
    try {
        // Conectar a postgres
        await databaseManager.connectToPostgres(connectionps);

        if (databaseManager.isPostgresConnected()) {
            await createDatabaseTables();
            console.log(`${GREEN}${BOLD}✅ Tablas de la base de datos creadas con éxito.${RESET}`);
        } else {
            console.log(`${YELLOW}${BOLD}⚠️  La conexión a PostgreSQL está deshabilitada.${RESET}`);
        }

        // Mostrar mensajes en la terminal según el entorno
        if (isProduction) {
            console.log(`${RED}${BOLD}⚠️  Advertencia: ¡Estás en modo producción!${RESET}`);
            app.listen(PORT, () => console.log(`${GREEN}${BOLD}🚀 Servidor en producción corriendo!`));
        } else {
            console.log(`${GREEN}${BOLD}🔧 Estás en modo desarrollo.${RESET}`);
            app.listen(PORT, () => console.log(`${GREEN}${BOLD}🚀 Servidor de desarrollo corriendo en: http://${HOST}:${PORT}${RESET}`));
        }
    } catch (error) {
        console.error(`${RED}${BOLD}❌ Error: ${error.message}${RESET}`);
        process.exit(1);
    }
}

configureApp();

module.exports = {
    app,
};