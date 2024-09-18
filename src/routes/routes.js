const appfile = require('../app');
const app = appfile.app;
const triviaControll = require('../controllers/triviaControllers');

let tasks = [];
const routeapi = "/triviasimpsons/api/v1";

app.get([routeapi+'/', '/'], (req, res) => {
    res.send(`English:<br>Welcome to the Simpsons Trivia API, you can test the api if you want, go to ${routeapi}/login if you have user and password or ${routeapi}/register to create a new user <br><br>Spanish:<br>Bienvenido a la API Trivia de los Simpsons, puedes probar la api si quieres, ve a ${routeapi}/login si tienes un usuario y una contraseña o dirigete a ${routeapi}/register para crear un nuevo usuario`);
});

app.post(routeapi+'/login', triviaControll.loginUserReq);

// Registro
app.post(routeapi+'/register', triviaControll.registerUserReq);

// Ver todos los usuarios
app.get(routeapi+'/users', triviaControll.getUsersList);

// Ver puntajes
app.get(routeapi+'/scores', triviaControll.getUsersScores);

// Ver preguntas
app.get(routeapi+'/questions', triviaControll.getQuestionsTrivia);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Doh!! Parece que nos perdimos en un mar de donas 🍩 mmhhh... donaaas 🤤'
    });
});

// Crear pregunta
// app.post(routeapi+'/questions',);

// Actualizar pregunta
// app.put(routeapi+'/questions/:id',);

// Eliminar pregunta
// app.delete(routeapi+'/questions/:id',);

// Enviar respuesta
// app.post(routeapi+'/questions/:id/answer',);

// PUT /task/:id para actualizar una tarea por ID
app.put('/task/:id', (req, res) => {
    const id = req.params.id;
    const task = tasks.find(t => t.id === id);
    if (task){
        task.name = req.body.name;
        res.status(200).json(task);
    } else {
        res.status(404).send('Task not found');
    }
});

// DELETE /task/:id para eliminar una tarea por ID
app.delete('/task/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const taskindex = tasks.findIndex(t => t.id === id);

    if (taskindex !== -1){
        tasks.splice(taskindex, 1);
        res.status(204).send();
    } else {
        res.status(404).send('Task not found');
    }
});