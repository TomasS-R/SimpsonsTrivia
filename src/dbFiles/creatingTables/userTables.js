// En este archivo nombramos las diferentes tablas a crear en la BD
const userTables = {
    users: {
        tableName: 'users_trivia',
        columns: [
            { name: 'id', type: 'bigserial', primaryKey: true, identity: true },
            { name: 'username', type: 'text', notNull: true },
            { name: 'email', type: 'text', notNull: true, unique: true },
            { name: 'supabase_user_id', type: 'UUID', notNull: true },
            { name: 'role', type: 'varchar(50)', default: "'user'" },
            { name: 'created_at', type: 'timestamptz', notNull: true },
        ]
    },
    character: {
        tableName: 'characters',
        columns: [
            { name: 'id', type: 'bigserial', primaryKey: true, identity: true, notNull: true },
            { name: 'name', type: 'text', notNull: true, unique: true },
        ]
    },
    scores: {
        tableName: 'scores',
        columns: [
            { name: 'id', type: 'bigserial', primaryKey: true, notNull: true, unique: true },
            { name: 'user_id', type: 'bigserial', reference: 'users_trivia(id)' },
            { name: 'score', type: 'bigserial', notNull: true },
            { name: 'updated_at', type: 'timestamptz' },
            { name: 'correct_answers', type: 'bigserial', notNull: true },
            { name: 'incorrect_answers', type: 'bigserial', notNull: true },
            { name: 'total_questions', type: 'bigserial', notNull: true },
            { name: 'last_evaluated', type: 'timestamptz' },
        ]
    },
    quotes: {
        tableName: 'quotes',
        columns: [
            { name: 'id', type: 'bigserial', primaryKey: true, notNull: true, identity: true },
            { name: 'quote', type: 'text', primaryKey: true, notNull: true },
            { name: 'character_id', type: 'bigserial', reference: 'characters(id)' },
        ]
    },

    // Frases subidas por usuarios
    quotes_users: {
        tableName: 'quotes_users',
        columns: [
            {name: 'id', type: 'bigserial', primaryKey: true, identity: true, notNull: true},
            {name: 'user_id', type: 'bigserial', reference: 'users_trivia(id)'},
            {name: 'character_id', type: 'bigserial', reference: 'characters(id)'},
            {name: 'quote', type: 'text', notNull: true},
            {name: 'approved', type: 'bool', default: false},
            {name: 'submitted_at', type: 'timestamptz'},
        ]
    },
    
    // Tabla de usuarios anonimos
    users_anonimus: {
        tableName: 'users_anonimus',
        columns: [
            { name: 'id', type: 'bigserial', primaryKey: true, notNull: true, identity: true },
            { name: 'score', type: 'bigserial', notNull: true },
            { name: 'temporal_token', type: 'text', notNull: true },
        ]
    },

};

module.exports = userTables;
