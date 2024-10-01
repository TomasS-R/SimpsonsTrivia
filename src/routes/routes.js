require('../account/passportConfig');
const appfile = require('../app');
const app = appfile.app;
const triviaControll = require('../controllers/triviaControllers');
const { swaggerDocument, swaggerUi } = require('./swaggerDocs');
const securityRoutes = require('./securityRoutes');
const { checkRole } = require('../account/roles/roleMiddleware');
const rolesManager = require('../account/roles/rolesManager');

const routeapi = "/triviasimpsons/api/v1";

app.use(routeapi, securityRoutes.apiLimiter);

app.get([routeapi+'/', '/'], (req, res) => {
    const hostname = appfile.hostname || req.get('host');
    const LinkDocs = `<a href="${hostname}${routeapi}/docs">${hostname}${routeapi}/docs</a>`
    res.send(`English:<br>Welcome to the Simpsons Trivia API, you can test the api if you want, go to ${LinkDocs} to see all the routes
        <br><br>Spanish:<br>Bienvenido a la API Trivia de los Simpsons, puedes probar la api si quieres, ve a ${LinkDocs} para ver todas las rutas disponibles`);
});

// Ruta de health check
app.get(routeapi + '/healthcheck', triviaControll.healthCheck);

// ** Ruta configurada contra fuerza bruta **
// Login
app.post(routeapi+'/login', securityRoutes.bruteforce.prevent, triviaControll.loginUserReq);

// Registro
app.post(routeapi+'/register', triviaControll.registerUserReq);

// **** Rutas protegidas ****
// Ver todos los usuarios
app.get(routeapi+'/users', securityRoutes.authenticateJWT, checkRole(rolesManager.roles.ADMIN), triviaControll.getUsersList);

// Ver puntajes
app.get(routeapi+'/scores', securityRoutes.authenticateJWT, checkRole(rolesManager.roles.ADMIN), triviaControll.getUsersScores);

// Ruta para cambiar el rol de un usuario
app.patch(routeapi+'/users/:userId/role', securityRoutes.authenticateJWT, checkRole(rolesManager.roles.ADMIN), triviaControll.changeUserRole)
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
app.use(routeapi + '/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Doh!! Parece que nos perdimos en un mar de donas 🍩 mmhhh... donaaas 🤤'
    });
});

// Actualizar pregunta
// app.put(routeapi+'/questions/:id',);

// Eliminar pregunta
// app.delete(routeapi+'/questions/:id',);

// Enviar respuesta a una pregunta específica
// app.post(routeapi+'/questions/:id/answer', triviaControll.answerQuestion);