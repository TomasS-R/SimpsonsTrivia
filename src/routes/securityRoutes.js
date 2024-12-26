const rateLimit = require('express-rate-limit');
const ExpressBrute = require('express-brute');
const config = require('../../config');

// Limiter para API pública
const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

// Limiter para API con token
const authenticatedApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Too many requests from this authenticated user.',
    keyGenerator: (req) => req.user?.id || req.ip // Usa ID de usuario si está autenticado
});

// Limiter específico para el servidor donde se aloje el proyecto
const internalApiLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs || 15 * 60 * 1000,
    max: config.rateLimitMaxRequests || 10000,
    message: 'Internal server rate limit exceeded.',
    skip: (req) => {
        const internalIPs = config.internalIps?.split(',') || [];
        //console.log('Request IP:', req.ip);
        //console.log('Internal IPs:', internalIPs);
        return internalIPs.includes(req.ip);
    }
});

// Limiter para endpoints críticos (login/registro)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.'
});

// Configuración de protección contra fuerza bruta
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store, {
    freeRetries: 3,
    minWait: 5 * 60 * 1000,
    maxWait: 60 * 60 * 1000,
    failCallback: function (req, res) {
        res.status(429).json({
            error: 'Too many failed attempts. Please try again later.',
            nextValidRequest: req.brute.nextValidRequestDate
        });
    }
});

module.exports = { 
    publicApiLimiter, 
    authenticatedApiLimiter, 
    internalApiLimiter,
    authLimiter, 
    bruteforce 
};