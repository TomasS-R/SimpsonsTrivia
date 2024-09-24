// Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load the Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'apiRoutesDoc.yaml'));

module.exports = {
    swaggerDocument,
    swaggerUi
}
