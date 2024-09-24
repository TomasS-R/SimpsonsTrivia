const appfile = require('../app');
const app = appfile.app;
const triviaControll = require('../controllers/triviaControllers');
const { swaggerDocument, swaggerUi } = require('./swaggerDocs');

const routeapi = "/triviasimpsons/api/v1";

app.get([routeapi+'/', '/'], (req, res) => {
    res.send(`English:<br>Welcome to the Simpsons Trivia API, you can test the api if you want, go to ${routeapi}/login if you have user and password or ${routeapi}/register to create a new user
        <br><br>Spanish:<br>Bienvenido a la API Trivia de los Simpsons, puedes probar la api si quieres, ve a ${routeapi}/login si tienes un usuario y una contraseña o dirigete a ${routeapi}/register para crear un nuevo usuario`);
});

// Ruta de health check
app.get(routeapi + '/healthcheck', triviaControll.healthCheck);

// Login
app.post(routeapi+'/login', triviaControll.loginUserReq);

// Registro
app.post(routeapi+'/register', triviaControll.registerUserReq);

// Ver todos los usuarios
app.get(routeapi+'/users', triviaControll.getUsersList);

// Ver puntajes
app.get(routeapi+'/scores', triviaControll.getUsersScores);

// Ver preguntas
app.get(routeapi+'/questions', triviaControll.getQuestionsTrivia);

// Obtener una frase aleatoria con 4 respuestas
app.get(routeapi+'/random-quote', triviaControll.getQuote);

// Obtener frases por el id personaje
app.get(routeapi+'/quotesbycharacter/:characterId', triviaControll.getQuotesByCharacter);

// Obtener personajes
app.get(routeapi+'/characters', triviaControll.getCharacters);

// Rutas de la API documentada con Swagger usando el archivo apiRoutesDoc.yaml
app.use(routeapi + '/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
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