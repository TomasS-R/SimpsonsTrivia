// En este archivo nombramos las diferentes tablas a crear en la BD
// Tabla de usuarios
const tableNameUsers = 'users_trivia';

const columnsUsers = [
    {name: 'id', type: 'bigserial', primaryKey: true, identity: true},
    {name: 'username', type: 'text', notNull: true},
    {name: 'email', type: 'text', notNull: true, unique: true},
    {name: 'password_hash', type: 'text', notNull: true},
    {name: 'role', type: 'varchar(50)', default: "'user'"},
    {name: 'created_at', type: 'timestamptz', notNull: true},
]

// Tabla de puntajes
const tableNameScores = 'scores';

const columnsScores = [
    {name: 'id', type: 'bigserial', primaryKey: true, notNull: true, unique: true},
    {name: 'user_id', type: 'bigserial', reference: 'users_trivia(id)'},
    {name: 'score', type: 'bigserial',notNull: true},
    {name: 'updated_at', type: 'timestamptz'},
    {name: 'correct_answers', type: 'bigserial', notNull: true},
    {name: 'incorrect_answers', type: 'bigserial', notNull: true},
    {name: 'total_questions', type: 'bigserial', notNull: true},
    {name: 'last_evalueated', type: 'timestamptz'},
]

// Tabla de frases
const tableNameQuotes = 'quotes';

const columnsQuotes = [
    {name: 'id', type: 'bigserial', primaryKey: true, notNull: true, identity: true},
    {name: 'quote', type: 'text',primaryKey: true, notNull: true},
    {name: 'character_id', type: 'bigserial', reference: 'characters(id)'},
]

// Tabla de personajes
const tableNameCharacter = 'characters';

const columnsCharacter = [
    {name: 'id', type: 'bigserial', primaryKey: true, identity: true, notNull: true},
    {name: 'name', type: 'text', notNull: true, unique: true},
]

// Frases subidas por usuarios
const tableNameQuotesUsers = 'quotes_users';

const columnsQuotesUsers = [
    {name: 'id', type: 'bigserial', primaryKey: true, identity: true, notNull: true},
    {name: 'user_id', type: 'bigserial', reference: 'users_trivia(id)'},
    {name: 'character_id', type: 'bigserial', reference: 'characters(id)'},
    {name: 'quote', type: 'text', notNull: true},
    {name: 'approved', type: 'bool', default: false},
    {name: 'submitted_at', type: 'timestamptz'},
]

module.exports = {
    tableNameUsers,
    columnsUsers,
    tableNameScores,
    columnsScores,
    tableNameQuotes,
    columnsQuotes,
    tableNameCharacter,
    columnsCharacter,
    tableNameQuotesUsers,
    columnsQuotesUsers,
}