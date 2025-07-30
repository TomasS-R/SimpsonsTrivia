const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');
const config = require('../../config');

const router = express.Router();

// Cargar documentación completa para desarrollo
const fullDocsPath = path.join(__dirname, 'apiRoutesDoc.yaml');
const fullDocs = yaml.load(fullDocsPath);

// Cargar documentación limitada para producción
const prodDocsPath = path.join(__dirname, 'apiRoutesDocProduction.yaml');
const prodDocs = yaml.load(prodDocsPath);

// Función para determinar qué documentación mostrar
function getDocumentationForEnvironment() {
    const isDevelopment = config.nodeEnv === 'development' || config.nodeEnv === 'local';
    
    if (isDevelopment) {
        console.log('📖 Serving full API documentation (development mode)');
        return fullDocs;
    } else {
        console.log('📖 Serving limited API documentation (production mode)');
        return prodDocs;
    }
}

// Configuración de Swagger UI con tema oscuro
const swaggerOptions = {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui { background-color: #1a1a1a; }
        .swagger-ui .scheme-container { background-color: #2d2d2d; }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .info .title { color: #ffffff; }
        .swagger-ui .info .description { color: #cccccc; }
        .swagger-ui .opblock { background-color: #2d2d2d; border: 1px solid #3d3d3d; }
        .swagger-ui .opblock .opblock-summary { background-color: #404040; }
        .swagger-ui .opblock.opblock-get .opblock-summary { background-color: #49cc90; }
        .swagger-ui .opblock.opblock-post .opblock-summary { background-color: #61affe; }
        .swagger-ui .opblock.opblock-put .opblock-summary { background-color: #fca130; }
        .swagger-ui .opblock.opblock-delete .opblock-summary { background-color: #f93e3e; }
        .swagger-ui .opblock.opblock-patch .opblock-summary { background-color: #50e3c2; }
        .swagger-ui .btn { background-color: #61affe; }
        .swagger-ui .btn:hover { background-color: #4990e2; }
    `,
    customSiteTitle: `Simpsons Trivia API - ${config.nodeEnv === 'development' ? 'Full Documentation' : 'Public Documentation'}`,
    customfavIcon: '/favicon.ico'
};

// Ruta para servir la documentación
router.use('/docs', (req, res, next) => {
    const docs = getDocumentationForEnvironment();
    swaggerUi.setup(docs, swaggerOptions)(req, res, next);
});

// Ruta para servir los assets de Swagger UI
router.use('/docs', swaggerUi.serve);

// Endpoint para obtener la spec JSON directamente
router.get('/docs.json', (req, res) => {
    const docs = getDocumentationForEnvironment();
    res.json(docs);
});

// Endpoint para información sobre la documentación
router.get('/docs-info', (req, res) => {
    const isDevelopment = config.nodeEnv === 'development' || config.nodeEnv === 'local';
    
    res.json({
        success: true,
        environment: config.nodeEnv,
        documentationType: isDevelopment ? 'full' : 'limited',
        availableEndpoints: isDevelopment ? 'All API endpoints' : 'Public, Game, and Admin endpoints only',
        message: isDevelopment 
            ? 'Full API documentation available in development mode'
            : 'Limited API documentation for production environment'
    });
});

module.exports = router;