const appfile = require('../app');
const app = appfile.app;
const triviaControll = require('../controllers/triviaControllers');
const accountRegister = require('../account/register');
const accountLogin = require('../account/login');

let tasks = [];
const routeapi = "/triviasimpsons/api";

app.get([routeapi+'/', '/'], (req, res) => {
    res.send('English:<br>Welcome to the Simpsons Trivia API, you can test the api if you want, go to /triviasimpsons/api/login if you have user and password or /triviasimpsons/api/register to create a new user <br><br>Spanish:<br>Bienvenido a la API Trivia de los Simpsons, puedes probar la api si quieres, ve a /triviasimpsons/api/login si tienes un usuario y una contraseña o dirigete a /triviasimpsons/api/register para crear un nuevo usuario');
});

// Login
app.post(routeapi+'/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username) {
            return res.status(400).json({ success: false, error: "The request needs the 'email' field in the 'username' field!" });
        }
        else if (!triviaControll.validateEmail(username)) {
            return res.status(400).json({ success: false, error: "The email is not valid!" });
        }
        else if (!password) {
            return res.status(400).json({ success: false, error: "The request needs the 'password' field!" });
        }
        else if (!username || !password) {
            return res.status(400).json({ success: false, error: "The request need 'username' and 'password' fields!" });
        }
        accountLogin.loginUser(username, password, res);
    }
    catch (e) {
        console.log(e);
    }
});

// Registro
app.post(routeapi+'/register', (req, res) => {
    try {
        // El username es el email
        const { username, password, role } = req.body;

        if (!username) {
            return res.status(400).json({ success: false, error: "The request needs the 'email' field in the 'username' field!" });
        }
        else if (!triviaControll.validateEmail(username)) {
            return res.status(400).json({ success: false, error: "The email is not valid!" });
        }
        else if (!password) {
            return res.status(400).json({ success: false, error: "The request needs the 'password' field!" });
        }
        else if (!username || !password) {
            return res.status(400).json({ success: false, error: "The request need 'username' and 'password' fields!" });
        }
        accountRegister.registerUser(username, password, role, res);
    }
    catch (e) {
        console.log(e);
    }
});

app.get(routeapi+'/users', triviaControll.getUsersList);

app.get(routeapi+'/scores', triviaControll.getUsersScores);

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

// POST /task para agregar una nueva tarea
app.post('/task', (req, res) => {
    if (!req.body.name){
        res.status(400).send('Name is required');
    } else {
        const newtask = {id: tasks.length + 1, name: req.body.name};
        tasks.push(newtask);
        res.status(201).json(tasks);
    }
});

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