const databaseManager = require('./databaseManager');
const userTables = require('./creatingTables/userTables');

async function createTables(tableName, columns) {

    try {
        // Verificar si la tabla existe
        const res = await databaseManager.query('select exists (select * from information_schema.tables where table_name = $1)', [tableName]);

        const verifyTable = res.rows[0].exists;
        // Si no existe, cree la tabla en supabase
        if (!verifyTable) {
            let foreignKeyQueries = [];

            let columnsQuery = columns.map(column => {
                let columnDef = `${column.name} ${column.type}`;
                
                if (column.primaryKey) {
                    primaryKeyColumn = column.name;
                }
                if (column.unique) {
                    columnDef += ' UNIQUE';
                }
                if (column.notNull) {
                    columnDef += ' NOT NULL';
                }
                if (column.default !== undefined) {
                    if (!column.identity) {
                        columnDef += ` DEFAULT ${column.default}`;
                    }
                }
                if (column.reference) {
                    foreignKeyQueries.push(`ALTER TABLE ${tableName} ADD CONSTRAINT ${tableName}_${column.name}_fkey FOREIGN KEY (${column.name}) REFERENCES ${column.reference}`);
                }
                
                return columnDef;
            }).join(', ');

            let createTableQuery = `CREATE TABLE ${tableName} (${columnsQuery})`;

            try {
                const resCreateTable = await databaseManager.query(createTableQuery);
                if (resCreateTable.error) {
                    console.log("❌ Error to create the table "+ tableName+": ",resCreateTable.error);
                } else {
                    console.log("✅ Table "+tableName+" created successfully");
                }

                // Habilitar la seguridad a nivel de fila en la tabla supabase
                const enableRLSQuery = `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`;
                const resEnableRLS = await databaseManager.query(enableRLSQuery);
                if (resEnableRLS.error) {
                    console.log("❌📜 Error to create the Row level security: ",resEnableRLS.error);
                } else {
                    console.log('📜 Row level security enabled');
                }

                // Add primary key to id
                const addPrimaryKeyQuery = `ALTER TABLE ${tableName} ADD CONSTRAINT ${tableName}_pkey PRIMARY KEY (id)`;
                const resPK = await databaseManager.query(addPrimaryKeyQuery);
                if (resPK.error) {
                    console.log("❌🔑 Error to create the Row level security: ",resPK.error);
                } else {
                    console.log('🔑 Primary key added');
                }

                // Agregar las claves foraneas a las tablas que tengan la referencia
                for (const foreignKeyQuery of foreignKeyQueries) {
                    const resFK = await databaseManager.query(foreignKeyQuery);
                    if (resFK.error) {
                        console.log("❌🗝️ Error to add foreign key: ", resFK.error);
                    } else {
                        console.log('🗝️ Foreign key added');
                    }
                }

            } catch (error) {
                console.log("⛔ Error to create the table: ",error);
            }
        
        } else {
            console.log("✅ Table " +tableName+ " already exists");
        }
    } catch (e) {
        console.log("📵 Error to entablish comunication to supabase:",e);
    }
}

// Verificar la existencia de la tabla
async function verifyTable(tableName) {
    try {
        const result = await databaseManager.query('select exists (select * from information_schema.tables where table_name = $1)', [tableName]);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Funcion que consulta la bd y obtiene los usuarios de la tabla
async function getUsers() {
    try {
        const result = await databaseManager.query(`SELECT id, username, role FROM ${userTables.tableNameUsers}`);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Funcion que consulta la bd y obtiene los puntajes de la tabla
async function getScores() {
    try {
        const result = await databaseManager.query(`SELECT * FROM ${userTables.tableNameScores}`);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Funcion que consulta la bd y obtiene las preguntas de la tabla
async function getQuestions() {
    try {
        const result = await databaseManager.query(`SELECT * FROM ${userTables.tableNameQuotes}`);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Funcion que crea un usuario en la bd
async function createUser(username, email, hashedPassword, role, created_at) {
    try {
        const result = await databaseManager.query('INSERT INTO users_trivia (username, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', [username, email,hashedPassword, role, created_at]);
        return result;
    } catch (e) {
        console.log(e);
    }
}

// Valida si existe el usuario en la bd
async function userExists(email) {
    try {
        const result = await databaseManager.query('SELECT * FROM users_trivia WHERE email = $1', [email]);
        return result;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

// Funcion que obtiene una pregunta aleatoria
async function getRandomQuestion() {
    try {
        const result = await databaseManager.query(`
            SELECT q.id, q.quote, c.name as correct_character,
                   (SELECT array_agg(c2.name) FROM ${userTables.tableNameCharacter} c2 WHERE c2.id != q.character_id ORDER BY RANDOM() LIMIT 3) as incorrect_options
            FROM ${userTables.tableNameQuotes} q
            JOIN ${userTables.tableNameCharacter} c ON q.character_id = c.id
            ORDER BY RANDOM()
            LIMIT 1
        `);
        return result.rows[0];
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = {
    createTables,
    verifyTable,
    getUsers,
    getScores,
    getQuestions,
    createUser,
    userExists,
    getRandomQuestion,
}