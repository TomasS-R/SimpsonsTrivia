// Swagger
const swaggerUi = require('swagger-ui-express');
const { SwaggerTheme, SwaggerThemeNameEnum } = require('swagger-themes');
const YAML = require('yamljs');
const path = require('path');

// Cargar el documento Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'apiRoutesDoc.yaml'));

// Modo oscuro para swagger https://www.npmjs.com/package/swagger-themes#themes
const theme = new SwaggerTheme();

const options = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.GRUVBOX)
};

module.exports = {
    swaggerDocument,
    swaggerUi,
    options
}
