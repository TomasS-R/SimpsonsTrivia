const USER_TABLE = 'users_app' // No llamar a la tabla "users", ya que supabase ya tiene reservado ese nombre
const CHARACTER_TABLE = 'characters'
const SCORES_TABLE = 'scores_trivia'
const QUOTES_TABLE = 'quotes'
const QUOTES_USERS_TABLE = 'quotes_users'
const PROFILE_IMAGES_TABLE = 'profile_images'

// En este archivo nombramos las diferentes tablas a crear en la BD
const userTables = {
    users: {
        tableName: USER_TABLE,
        columns: [
            { name: 'id', type: 'bigserial', primaryKey: true, identity: true },
            { name: 'username', type: 'text', unique: true },
            { name: 'user_tag', type: 'text', unique: true },
            { name: 'email', type: 'text', unique: true },
            { name: 'image_url', type: 'smallint', reference: `${PROFILE_IMAGES_TABLE}(id)` },
            { name: 'supabase_user_id', type: 'UUID', unique: true },
            { name: 'role', type: 'varchar(50)', default: "'anon'" },
            { name: 'created_at', type: 'timestamptz', notNull: true }
        ]
    },
    character: {
        tableName: CHARACTER_TABLE,
        columns: [
            { name: 'id', type: 'bigserial', primaryKey: true, identity: true, notNull: true },
            { name: 'name', type: 'text', notNull: true, unique: true },
        ]
    },
    scores: {
        tableName: SCORES_TABLE,
        columns: [
            { name: 'id', type: 'bigserial', primaryKey: true, notNull: true, unique: true },
            { name: 'user_id', type: 'UUID', reference: `${USER_TABLE}(supabase_user_id)` },
            { name: 'score', type: 'bigint', notNull: true, default: 0 },
            { name: 'last_score', type: 'bigint', notNull: true, default: 0 },
            { name: 'highest_score', type: 'bigint', notNull: true, default: 0 },
            { name: 'avg_answer', type: 'float', default: 0 },
            { name: 'correct_answers', type: 'bigint', notNull: true, default: 0 },
            { name: 'incorrect_answers', type: 'bigint', notNull: true, default: 0 },
            { name: 'total_questions', type: 'bigint', notNull: true, default: 0 },
            { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' }
        ]
    },
    quotes: {
        tableName: QUOTES_TABLE,
        columns: [
            { name: 'id', type: 'bigserial', primaryKey: true, notNull: true, identity: true },
            { name: 'quote', type: 'text', primaryKey: true, notNull: true },
            { name: 'character_id', type: 'bigserial', reference: `${CHARACTER_TABLE}(id)` },
        ]
    },
    // Frases subidas por usuarios
    quotes_users: {
        tableName: QUOTES_USERS_TABLE,
        columns: [
            {name: 'id', type: 'bigserial', primaryKey: true, identity: true, notNull: true},
            {name: 'user_id', type: 'UUID', reference: `${USER_TABLE}(supabase_user_id)`},
            {name: 'character_id', type: 'bigserial', reference: `${CHARACTER_TABLE}(id)`},
            {name: 'quote', type: 'text', notNull: true},
            {name: 'approved', type: 'bool', default: false},
            {name: 'submitted_at', type: 'timestamptz'},
        ]
    },
    profile_images: {
        tableName: PROFILE_IMAGES_TABLE,
        columns: [
            { name: 'id', type: 'smallint', primaryKey: true },
            { name: 'image_url', type: 'text', notNull: true },
            { name: 'name', type: 'text', notNull: true },
        ]
    },

};

module.exports = userTables;
