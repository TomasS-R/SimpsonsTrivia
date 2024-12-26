const databaseManager = require('./dbFiles/databaseManager');
const { createTables } = require('./dbFiles/queries');
const userTables = require('./dbFiles/creatingTables/userTables');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const { setupRoutesV1, routeapi } = require('../src/routes/routes');
const securityRoutes = require('../src/routes/securityRoutes');
const sentryConfig = require('./monitoring/sentryConfig');
const { supabaseConection } = require('../src/account/authSupabase');
const deleteUsersAuth = require('../src/account/deleteUsersAuth');
const refreshAccessToken = require('../src/account/tokenRefresh');
const redisManager = require('./dbFiles/redisManager');
const config = require('../config');

const app = express();
// Configura la aplicación para que confíe en el encabezado X-Forwarded-For establecido por el proxy.
app.set('trust proxy', 1);
// Configurar EJS para la configuracion del login y el registro como motor de plantillas
app.set('view engine', 'ejs')
// Establecer el directorio de vistas
app.set('views', './src/views');

// Inicializa Sentry
sentryConfig.initSentry();

const allowedOrigins = config.corsOrigin ? config.corsOrigin.split(',') : ['*'];

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
app.use(cookieParser());
app.use(refreshAccessToken);
// Middleware para verificar si la solicitud proviene de JMeter
const isJMeter = (req) => {
    return req.headers['user-agent'] && req.headers['user-agent'].includes('Apache-HttpClient');
};
  
// Aplicar el limitador de API solo si no es una solicitud de JMeter
app.use((req, res, next) => {
    if (!isJMeter(req)) {
        securityRoutes.publicApiLimiter(req, res, next);
    } else {
        next(); // Si es JMeter, continúa sin aplicar el limitador
    }
});

deleteUsersAuth.startScheduledTask();

// Determinar el entorno
const isProduction = config.nodeEnv === 'production';

// Configuración del puerto y host
const PORT = config.port || 3000;
const HOST = isProduction ? '0.0.0.0' : 'localhost';
const hostname = isProduction ? config.urlHost : `http://localhost:${PORT}`;

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
const connectionps = config.connectPostgres === 'True' ? true : (config.connectPostgres === undefined ? false : false);

// Verifica si la conexión a redis está habilitada
const connectionredis = config.connectRedis === 'True' ? true : (config.connectRedis === undefined ? false : false);

async function createDatabaseTables() {
    // Obtener todas las tablas y sus columnas desde userTables
    const tables = Object.keys(userTables).map(key => {
        return {
            name: userTables[key].tableName,
            columns: userTables[key].columns
        };
    });

    for (const table of tables) {
        await createTables(table.name, table.columns);
    }
}

async function configureApp() {
    try {
        // Conectar a postgres
        await databaseManager.connectToPostgres(connectionps);
        // Conectar a redis
        const redisConnection = await redisManager.connectToRedis(connectionredis);

        if (databaseManager.isPostgresConnected()) {
            await createDatabaseTables();
            console.log(`${GREEN}${BOLD}✅ Tablas de la base de datos creadas con éxito.${RESET}`);
        } else {
            console.log(`${YELLOW}${BOLD}⚠️  La conexión a PostgreSQL está deshabilitada.${RESET}`);
        }

        // Comprobar si se conecto o no con la api de supabase
        if (supabaseConection) {
            console.log(`${GREEN}${BOLD}✅ Conexion con el cliente Supabase establecida exitosamente${RESET}`);
        } else {
            console.log(`${RED}${BOLD}❌ Falló la conexion con el cliente Supabase.${RESET}`);
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

        if (redisConnection) {
            //await redisManager.getConnectionInfo();
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