const databaseManager = require('./dbFiles/databaseManager');
const { createTables } = require('./dbFiles/queries');
const userTables = require('./dbFiles/creatingTables/userTables');
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} url: http://localhost:${PORT}`));

// Conectar a postgres
databaseManager.connectToPostgres(true).then(() => {
    if (databaseManager.isPostgresConnected()) {
        // Crear las tablas en la base de datos
        // Tabla usuarios
        createTables(userTables.tableNameUsers, userTables.columnsUsers);
        // Tabla personajes
        createTables(userTables.tableNameCharacter, userTables.columnsCharacter);
        // Tabla puntajes
        createTables(userTables.tableNameScores, userTables.columnsScores);
        // Tabla preguntas
        createTables(userTables.tableNameQuotes, userTables.columnsQuotes);
        // Tabla frases creadas por los usuarios
        createTables(userTables.tableNameQuotesUsers, userTables.columnsQuotesUsers);
    }
});

module.exports = {
    app,
};