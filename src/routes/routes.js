//require('../account/passportConfig');
const triviaControll = require('../controllers/triviaControllers');
const { swaggerDocument, swaggerUi, options } = require('./swaggerDocs');
const securityRoutes = require('./securityRoutes');
const { checkRole } = require('../account/roles/roleMiddleware');
const rolesManager = require('../account/roles/rolesManager');

const routeapi = "/api/v1";

function setupRoutesV1(app, hostname) {
    app.get([routeapi+'/', '/'], (req, res) => {
        const hostnameapp = hostname || req.get('host');
        let LinkDocs = `${process.env.NODE_ENV === 'production' ? 'https://' : ''}${hostnameapp}${routeapi}/docs`;
        
        res.render('index', { LinkDocs });
    });

    // Ruta de health check
    app.get(routeapi + '/healthcheck', triviaControll.healthCheck);

    // ** Ruta configurada contra fuerza bruta **
    // Login
    app.post(routeapi+'/login', securityRoutes.bruteforce.prevent, triviaControll.loginUserReq);

    // Registro
    app.post(routeapi+'/register', triviaControll.registerUserReq);

    // Logout
    app.post(routeapi+'/logout', (req, res) => {
        res
            .clearCookie('accessToken')
            .status(200)
            .json({ success: true, message: 'Logout successful' });
    });

    // Ruta protegida
    app.get(routeapi+'/protected', triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), (req, res) => {
        const data = req.user;
        const username = data.dataUser.username;
        res.render('protected', { username });
    });

    // **** Rutas protegidas ****
    // Ver todos los usuarios
    app.get(routeapi+'/users', triviaControll.supabaseAuth, checkRole(rolesManager.roles.ADMIN), triviaControll.getUsersList);

    // Ver puntajes
    app.get(routeapi+'/scores', triviaControll.supabaseAuth, checkRole(rolesManager.roles.ADMIN), triviaControll.getUsersScores);

    // Ruta para cambiar el rol de un usuario
    app.patch(routeapi+'/users/:userId/role', triviaControll.supabaseAuth, checkRole(rolesManager.roles.ADMIN), triviaControll.changeUserRole)
    // * Fin Rutas protegidas *

    // Ver preguntas
    app.get(routeapi+'/quote/questions', triviaControll.getQuestionsTrivia);

    // Obtener una frase aleatoria con 4 respuestas
    app.get(routeapi+'/quote/random', triviaControll.getQuote);

    // Obtener frases por el id personaje
    app.get(routeapi+'/quotes/bycharacter/:characterId', triviaControll.getQuotesByCharacter);

    // Obtener personajes
    app.get(routeapi+'/characters', triviaControll.getCharacters);

    // Rutas de la API documentada con Swagger usando el archivo apiRoutesDoc.yaml
    app.use(routeapi + '/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

    // Middleware para manejar rutas no encontradas (404)
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Not Found',
            message: 'Doh!! Parece que nos perdimos en un mar de donas 🍩 mmhhh... donaaas 🤤'
        });
    });
}

// Actualizar pregunta
// app.put(routeapi+'/questions/:id',);

// Eliminar pregunta
// app.delete(routeapi+'/questions/:id',);

// Enviar respuesta a una pregunta específica
// app.post(routeapi+'/questions/:id/answer', triviaControll.answerQuestion);

module.exports = {
    setupRoutesV1,
    routeapi,
}