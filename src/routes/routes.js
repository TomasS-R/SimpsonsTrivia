const triviaControll = require('../controllers/triviaControllers');
const securityRoutes = require('./securityRoutes');
const { checkRole } = require('../account/roles/roleMiddleware');
const rolesManager = require('../account/roles/rolesManager');
const sessionHandler = require('../account/sessionHandler');
const docsConditional = require('./docsConditional');
const YAML = require('yamljs');
const path = require('path');
const config = require('../../config');

const routeapi = "/api/v1";

function setupRoutesV1(app) {
    // ** Rutas públicas **
    app.get([routeapi+'/', '/'], securityRoutes.publicApiLimiter, sessionHandler.verifyUserSession, (req, res) => {
        // Determinar qué documentación mostrar basado en el entorno
        const isDevelopment = config.nodeEnv === 'development' || config.nodeEnv === 'local';
        const docPath = isDevelopment ? 'apiRoutesDoc.yaml' : 'apiRoutesDocProduction.yaml';
        const swaggerSpec = YAML.load(path.join(__dirname, docPath));
        const isAuthenticated = req.user && !req.user.isAnonymous;
        
        res.render('index', { 
            swaggerSpec, 
            isAuthenticated, 
            isDevelopment: isDevelopment,
            documentationType: isDevelopment ? 'full' : 'limited'
        });
    });

    app.get(routeapi + '/healthcheck', securityRoutes.publicApiLimiter, triviaControll.healthCheck);
    app.get(routeapi+'/quote/questions', securityRoutes.publicApiLimiter, triviaControll.getQuestionsTrivia);
    app.get(routeapi+'/quote/random', securityRoutes.publicApiLimiter, triviaControll.getQuote);
    app.get(routeapi+'/quotes/bycharacter/:characterId', securityRoutes.publicApiLimiter, triviaControll.getQuotesByCharacter);
    app.get(routeapi+'/characters', securityRoutes.publicApiLimiter, triviaControll.getCharacters);

    // ** Rutas de documentación condicional **
    app.use(routeapi, docsConditional);

    // ** Rutas de autenticación **
    app.post(routeapi+'/login', securityRoutes.authLimiter, securityRoutes.bruteforce.prevent, triviaControll.loginUserReq);
    app.get(routeapi+'/loginoauth/:provider', /*securityRoutes.authLimiter, securityRoutes.bruteforce.prevent,*/ triviaControll.loginUserOAuth);
    app.get(routeapi+'/oauth/callback', /*securityRoutes.authLimiter, securityRoutes.bruteforce.prevent,*/ triviaControll.handleOAuthCallback);
    app.post(routeapi+'/register', securityRoutes.authLimiter, sessionHandler.handleUserSession, triviaControll.registerUserReq);
    app.post(routeapi+'/logout', securityRoutes.authLimiter, sessionHandler.verifyUserSession, triviaControll.logoutUser);
    app.post(routeapi+'/oauth/process-token', securityRoutes.authLimiter, triviaControll.processOAuthToken);

    // ** Rutas de linking de cuentas OAuth **
    app.post(routeapi+'/oauth/link/:provider', securityRoutes.authenticatedApiLimiter, triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), triviaControll.linkOAuthProvider);
    app.get(routeapi+'/oauth/link-callback', securityRoutes.publicApiLimiter, triviaControll.handleOAuthLinkCallback);
    app.get(routeapi+'/oauth/linked-accounts', securityRoutes.authenticatedApiLimiter, triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), triviaControll.getUserLinkedIdentities);
    app.delete(routeapi+'/oauth/unlink/:provider', securityRoutes.authenticatedApiLimiter, triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), triviaControll.unlinkOAuthProvider);

    // ** Rutas protegidas (requieren autenticación) **
    // Rutas administrativas
    app.get(routeapi+'/users', securityRoutes.authenticatedApiLimiter, triviaControll.supabaseAuth, checkRole(rolesManager.roles.ADMIN), triviaControll.getUsersList);
    app.get(routeapi+'/scores', securityRoutes.authenticatedApiLimiter, triviaControll.supabaseAuth, checkRole(rolesManager.roles.ADMIN), triviaControll.getUsersScores);
    app.patch(routeapi+'/users/:userId/role', securityRoutes.authenticatedApiLimiter, triviaControll.supabaseAuth, checkRole(rolesManager.roles.ADMIN), triviaControll.changeUserRole);

    // ** Rutas de usuario autenticado **
    app.get(routeapi+'/profile', securityRoutes.authenticatedApiLimiter, sessionHandler.verifyUserSession, triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), triviaControll.protectedRoute);
    app.get(routeapi+'/account', securityRoutes.authenticatedApiLimiter, (req, res) => {res.render('account');});
    app.post(routeapi+'/quotes/:id/answer', securityRoutes.authenticatedApiLimiter, sessionHandler.handleUserSession, triviaControll.answerQuestion);
    app.post(routeapi+'/gameover', securityRoutes.authenticatedApiLimiter, sessionHandler.verifyUserSession, sessionHandler.handleUserSession, triviaControll.gameOverRefreshPage);
    app.get(routeapi+'/user/stats', securityRoutes.authenticatedApiLimiter, sessionHandler.verifyUserSession, triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), triviaControll.getUserStats);
    app.post(routeapi+'/user/reset-session', securityRoutes.authenticatedApiLimiter, sessionHandler.handleUserSession, triviaControll.resetGameSession);
    app.get(routeapi+'/user/data', securityRoutes.authenticatedApiLimiter, sessionHandler.verifyUserSession, triviaControll.supabaseAuth, checkRole(rolesManager.roles.USER), triviaControll.userDataProfile);

    // ** Rutas internas/sistema **
    app.get(routeapi+'/session-status', securityRoutes.internalApiLimiter, sessionHandler.verifyUserSession, sessionHandler.sessionStatusController);

    if (config.nodeEnv !== 'production') {
        app.get(routeapi+'/play', securityRoutes.internalApiLimiter, sessionHandler.handleUserSession, 
            (req, res) => {
                res.render('trivia', {
                    user: req.user || null,
                    isAnonymous: req.user?.isAnonymous || false
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