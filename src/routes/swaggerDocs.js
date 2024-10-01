// Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Cargar el documento Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'apiRoutesDoc.yaml'));

module.exports = {
    swaggerDocument,
    swaggerUi
}
