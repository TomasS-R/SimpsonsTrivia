const rateLimit = require('express-rate-limit');
const ExpressBrute = require('express-brute');
const passport = require('passport');

// Configuración de Rate Limiting (limita la cantidad de solicitudes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50 // limita cada IP a 100 solicitudes por ventana
});

// limitar los intentos de inicio de sesion
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store, {
    freeRetries: 5,
    minWait: 5*60*1000, // 5 minutos
    maxWait: 60*60*1000, // 1 hora,
    failCallback: function (req, res) {
        res.status(429).json({error: 'Too many failed attempts. Please try again later.'});
    },
});

// Middleware de autenticación
const authenticateJWT = passport.authenticate('jwt', { session: false });

module.exports = { apiLimiter, bruteforce, authenticateJWT };