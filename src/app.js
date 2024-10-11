const databaseManager = require('./dbFiles/databaseManager');
const { createTables } = require('./dbFiles/queries');
const userTables = require('./dbFiles/creatingTables/userTables');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const { setupRoutesV1, routeapi } = require('../src/routes/routes');
const securityRoutes = require('../src/routes/securityRoutes');
const sentryConfig = require('./monitoring/sentryConfig');

const app = express();
// Configura la aplicación para que confíe en el encabezado X-Forwarded-For establecido por el proxy.
app.set('trust proxy', 1);

// Inicializa Sentry
sentryConfig.initSentry();

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins[0] === '*' || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));
app.use(express.json());
app.use(passport.initialize());
app.use(securityRoutes.apiLimiter);

// Determinar el entorno
const isProduction = process.env.NODE_ENV === 'production';

// Configuración del puerto y host
const PORT = process.env.PORT || 3000;
const HOST = isProduction ? '0.0.0.0' : 'localhost';
const hostname = isProduction ? process.env.URLHOST : `http://localhost:${PORT}`;

// Importa y configura las rutas
setupRoutesV1(app, hostname);

// Colores para mensajes en la terminal
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[96m';
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
            app.listen(PORT, () => console.log(`${GREEN}${BOLD}🚀 Servidor en producción corriendo en el puerto: ${PORT}!`));
            if (hostname == undefined){
                console.log(`${YELLOW}${BOLD} ❗ Configura la variable de entorno *URLHOST* en tu host para poder ver la ruta de desplegue.${RESET}`);
            } else {
                console.log(`${BLUE}${BOLD} 🌐 Puedes acceder a traves de https://${hostname}${routeapi} ${RESET}`);
            }
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

process.on('SIGINT', () => {
    console.log('Shutting out the aplication...');
    process.exit(0);
});

module.exports = {
    app,
    isProduction
};