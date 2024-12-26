const triviaControll = require('../controllers/triviaControllers');
const securityRoutes = require('./securityRoutes');
const { checkRole } = require('../account/roles/roleMiddleware');
const rolesManager = require('../account/roles/rolesManager');
const sessionHandler = require('../account/sessionHandler');
const YAML = require('yamljs');
const path = require('path');
const config = require('../../config');

const routeapi = "/api/v1";

function setupRoutesV1(app) {
    // ** Rutas públicas **
    app.get([routeapi+'/', '/'], securityRoutes.publicApiLimiter, sessionHandler.verifyUserSession, (req, res) => {
        const swaggerSpec = YAML.load(path.join(__dirname, 'apiRoutesDoc.yaml'));
        const isAuthenticated = req.user && !req.user.isAnonymous;
        res.render('index', { swaggerSpec, isAuthenticated, isDevelopment: config.nodeEnv !== 'production'});
    });

    app.get(routeapi + '/healthcheck', securityRoutes.publicApiLimiter, triviaControll.healthCheck);
    app.get(routeapi+'/quote/questions', securityRoutes.publicApiLimiter, triviaControll.getQuestionsTrivia);
    app.get(routeapi+'/quote/random', securityRoutes.publicApiLimiter, triviaControll.getQuote);
    app.get(routeapi+'/quotes/bycharacter/:characterId', securityRoutes.publicApiLimiter, triviaControll.getQuotesByCharacter);
    app.get(routeapi+'/characters', securityRoutes.publicApiLimiter, triviaControll.getCharacters);

    // ** Rutas de autenticación **
    app.post(routeapi+'/login', securityRoutes.authLimiter, securityRoutes.bruteforce.prevent, triviaControll.loginUserReq);
    app.post(routeapi+'/register', securityRoutes.authLimiter, sessionHandler.handleUserSession, triviaControll.registerUserReq);
    app.post(routeapi+'/logout', securityRoutes.authLimiter, triviaControll.logoutUser);

    // ** Rutas protegidas (requieren autenticación) **
    // Rutas administrativas
    app.get(routeapi+'/users', securityRoutes.authenticatedApiLimiter, triviaControll.supabaseAuth, checkRole(rolesManager.roles.ADMIN), triviaControll.getUsersList);
    app.get(routeapi+'/scores', securityRoutes.authenticatedApiLimiter, triviaControll.supabaseAuth, checkRole(rolesManager.roles.ADMIN), triviaControll.getUsersScores);
    app.patch(routeapi+'/users/:userId/role', securityRoutes.authenticatedApiLimiter, triviaControll.supabaseAuth, checkRole(rolesManager.roles.ADMIN), triviaControll.changeUserRole);

    // ** Rutas de usuario autenticado **
    app.get(routeapi+'/protected', securityRoutes.authenticatedApiLimiter, sessionHandler.verifyUserSession, triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), triviaControll.protectedRoute);
    app.get(routeapi+'/account', securityRoutes.authenticatedApiLimiter, (req, res) => {res.render('account');});
    app.post(routeapi+'/quotes/:id/answer', securityRoutes.authenticatedApiLimiter, sessionHandler.handleUserSession, triviaControll.answerQuestion);
    app.post(routeapi+'/gameover', securityRoutes.authenticatedApiLimiter, sessionHandler.verifyUserSession, sessionHandler.handleUserSession, triviaControll.gameOverRefreshPage);
    app.get(routeapi+'/user/stats', securityRoutes.authenticatedApiLimiter, sessionHandler.verifyUserSession, triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), triviaControll.getUserStats);
    app.get(routeapi+'/user/data', securityRoutes.authenticatedApiLimiter, sessionHandler.verifyUserSession, triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), triviaControll.userDataProfile);

    // ** Rutas internas/sistema **
    app.get(routeapi+'/session-status', securityRoutes.internalApiLimiter, sessionHandler.verifyUserSession, sessionHandler.sessionStatusController);

    if (config.nodeEnv !== 'production') {
        app.get(routeapi+'/play', securityRoutes.internalApiLimiter, sessionHandler.verifyUserSession, 
            (req, res) => {
                res.render('trivia', {
                    user: req.user || null,
                    isAnonymous: !req.user
                });
            }
        );
    }

    // Middleware para manejar rutas no encontradas (404)
    app.use(securityRoutes.publicApiLimiter, (req, res) => {
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

module.exports = {
    setupRoutesV1,
    routeapi,
}