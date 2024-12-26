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
                    // eslint-disable-next-line no-undef
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
        const result = await databaseManager.query(`
            SELECT exists (select * from information_schema.tables where table_name = $1)
        `, [tableName]);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Funcion que consulta la bd y obtiene los usuarios de la tabla
async function getUsers() {
    try {
        const result = await databaseManager.query(`
            SELECT id, username, role
            FROM ${userTables.users.tableName}
        `);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Funcion que consulta la bd y obtiene los puntajes de la tabla
async function getScores() {
    try {
        const result = await databaseManager.query(`
            SELECT *
            FROM ${userTables.scores.tableName}
        `);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Funcion que consulta la bd y obtiene las preguntas de la tabla
async function getQuestions() {
    try {
        const result = await databaseManager.query(`
            SELECT *
            FROM ${userTables.quotes.tableName}
        `);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Funcion que crea un usuario en la bd
async function createUser(username, user_tag, email, supabase_user_id, role, created_at) {
    try {
        const result = await databaseManager.query(`
            INSERT INTO ${userTables.users.tableName} (username, user_tag, email, supabase_user_id, role, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [username, user_tag, email, supabase_user_id, role, created_at]);
        return result;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

// Valida si existe el email en la bd
async function emailExists(email) {
    try {
        const result = await databaseManager.query(`
            SELECT *
            FROM ${userTables.users.tableName}
            WHERE email = $1
            `, [email]);
        return result;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function usernameExists(username) {
    try {
        const result = await databaseManager.query(`
            SELECT *
            FROM ${userTables.users.tableName}
            WHERE username = $1
            `, [username]);
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
            SELECT q.id, q.quote, 
                   c.id as correct_character_id, 
                   c.name as correct_character_name,
                   (SELECT json_agg(json_build_object('id', c2.id, 'name', c2.name))
                    FROM ${userTables.character.tableName} c2
                    WHERE c2.id != q.character_id
                    ORDER BY RANDOM()
                    LIMIT 10) as incorrect_options
            FROM ${userTables.quotes.tableName} q
            JOIN ${userTables.character.tableName} c ON q.character_id = c.id
            ORDER BY RANDOM()
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            //console.log("No questions found in the database.");
            return undefined;
        }

        return {
            id: result.rows[0].id,
            quote: result.rows[0].quote,
            correct_character: {
                id: result.rows[0].correct_character_id,
                name: result.rows[0].correct_character_name
            },
            incorrect_options: result.rows[0].incorrect_options || []
        };
    } catch (e) {
        console.log(e);
        throw e;
    }
}

// Función que obtiene las frases de un personaje específico
async function getQuotesByCharacter(characterId) {
    try {
        const characterResult = await databaseManager.query(`
            SELECT id, name
            FROM ${userTables.character.tableName}
            WHERE id = $1
        `, [characterId]);

        // Si no se encuentra el personaje, se retorna null
        if (characterResult.rows.length === 0) {
            return null;
        }

        // Se obtiene el nombre del personaje
        const character = characterResult.rows[0];

        // Se obtiene las frases del personaje
        const quotesResult = await databaseManager.query(`
            SELECT id, quote
            FROM ${userTables.quotes.tableName}
            WHERE character_id = $1
        `, [characterId]);

        console.log(quotesResult);

        // Se obtiene el total de frases
        const totalQuotes = quotesResult.rows.length;

        return {
            character: character,
            totalQuotes: totalQuotes,
            quotes: quotesResult.rows
        };
    } catch (e) {
        console.log("Error al obtener frases por personaje:", e);
        throw e;
    }
}

// Funcion que obtiene los personajes de la bd
async function getCharacters() {
    try {
        const result = await databaseManager.query(`
            SELECT id, name 
            FROM ${userTables.character.tableName}
            `);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Función para obtener un usuario por ID
async function getUserById(id) {
    try {
        const result = await databaseManager.query(`
            SELECT id, username, email, role 
            FROM ${userTables.users.tableName} 
            WHERE id = $1
        `, [id]);
        return result.rows[0] || null;
    } catch (e) {
        console.error("Error getting user by ID:", e);
        throw e;
    }
}

async function changeUserRole(userId, newRole) {
    try {
      const result = await databaseManager.query(
        `UPDATE ${userTables.users.tableName} SET role = $1 WHERE id = $2 RETURNING *`,
        [newRole, userId]);
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
}

async function getUserRole(userId) {
    try {
      const result = await databaseManager.query(`
        SELECT role 
        FROM ${userTables.users.tableName} 
        WHERE id = $1`, [userId]);
      if (result.rows.length === 0) {
        throw new Error('Role not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error obtain user role:', error);
      throw error;
    }
}

// Función para obtener TODOS los datos de un usuario por ID de Supabase
async function getUserDataSupabaseAuth(userId) {
    try {
      const result = await databaseManager.query(`
        SELECT * 
        FROM ${userTables.users.tableName} 
        WHERE supabase_user_id = $1`, [userId]);
      if (result.rows.length === 0) {
        throw new Error('Role not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error obtain user role:', error);
      throw error;
    }
}

// Funcion que verifica si la respuesta es correcta
async function checkAnswer(quoteId, answer) {
    try {
        const result = await databaseManager.query(`
            SELECT *
            FROM ${userTables.quotes.tableName}
            WHERE id = $1 AND character_id = $2
        `, [quoteId, answer]);
        return result.rows.length > 0;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function updateTimeAvgAnswer(userId, time) {
    try {
        const result = await databaseManager.query(`
            UPDATE ${userTables.scores.tableName}
            SET avg_answer = avg_answer + $1
            WHERE user_id = $2
        `, [time, userId]);
        return result;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function scoresUser(userId) {
    try {
        const userScore = await databaseManager.query(`
            SELECT COALESCE(score, 0) as score
            FROM ${userTables.scores.tableName}
            WHERE user_id = $1
        `, [userId]);

        return userScore;
    } catch (e) {
        console.log('Error getting user score:', e);
        throw e;
    }
}

async function lastScoreUser(userId) {
    try {
        // Traer el score mediante una consulta y luego actualizar el last_score
        let score = await scoresUser(userId);

        if (score.rows.length === 0) {
            return false;
        }
        else if (score.rows[0].score) {
            score = score.rows[0].score;
            const userLastScore = await databaseManager.query(`
                UPDATE ${userTables.scores.tableName}
                SET last_score = $1
                WHERE user_id = $2
            `, [score, userId]);
            return userLastScore;
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function updateUserScore(userId, score, time) {
    try {
        // Primero, verifica si existe un registro para el usuario
        const checkUser = await databaseManager.query(`
            SELECT 1 FROM ${userTables.scores.tableName}
            WHERE user_id = $1
        `, [userId]);

        if (checkUser.rows.length === 0) {
            // Si no existe, crea un nuevo registro con los valores iniciales
            await databaseManager.query(`
                INSERT INTO ${userTables.scores.tableName} 
                (user_id, score, highest_score, last_score, correct_answers)
                VALUES ($1, $2, $2, $2, 1)
            `, [userId, score]);
            
            if (time) {
                await updateTimeAvgAnswer(userId, time);
            }
            
            return true;
        }

        // Si existe, actualiza el puntaje y el mayor puntaje
        await databaseManager.query(`
            UPDATE ${userTables.scores.tableName}
            SET 
                score = COALESCE(score, 0) + $1,
                correct_answers = COALESCE(correct_answers, 0) + 1,
                highest_score = CASE 
                    WHEN COALESCE(score, 0) + $1 > COALESCE(highest_score, 0) 
                    THEN COALESCE(score, 0) + $1 
                    ELSE highest_score 
                END
            WHERE user_id = $2
        `, [score, userId]);

        if (time) {
            await updateTimeAvgAnswer(userId, time);
        }

        // Para verificar los valores actualizados
        const updatedScores = await databaseManager.query(`
            SELECT score, highest_score 
            FROM ${userTables.scores.tableName}
            WHERE user_id = $1
        `, [userId]);

        if (updatedScores.rows[0]) {
            console.log('Updated scores:', {
                currentScore: updatedScores.rows[0].score,
                highestScore: updatedScores.rows[0].highest_score
            });
        }

        return true;
    } catch (e) {
        console.log('Error updating user score:', e);
        throw e;
    }
}

async function updateUserScoreFailed(userId) {
    try {
        // Primero obtenemos el score actual para guardarlo como last_score
        const currentScore = await scoresUser(userId);
        
        if (currentScore.rows[0]) {
            const scoreValue = currentScore.rows[0].score;
            
            // Actualizamos reseteando el score y guardando el último puntaje
            const result = await databaseManager.query(`
                UPDATE ${userTables.scores.tableName}
                SET 
                    last_score = $1,
                    score = 0,
                    highest_score = CASE 
                        WHEN $1 > highest_score THEN $1 
                        ELSE highest_score 
                    END,
                    incorrect_answers = COALESCE(incorrect_answers, 0) + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $2
                RETURNING score, last_score, highest_score, incorrect_answers
            `, [scoreValue, userId]);
            return result;
        }

        return null;
    } catch (e) {
        console.log('Error resetting user score:', e);
        throw e;
    }
}

async function getUserStats(userId) {
    try {
        const stats = await databaseManager.query(`
            SELECT 
                COALESCE(score, 0) as current_score,
                COALESCE(highest_score, 0) as highest_score,
                COALESCE(last_score, 0) as last_score,
                COALESCE(avg_answer, 0) as avg_answer,
                COALESCE(correct_answers, 0) as correct_answers,
                COALESCE(incorrect_answers, 0) as incorrect_answers,
                (COALESCE(correct_answers, 0) + COALESCE(incorrect_answers, 0)) as total_questions
            FROM ${userTables.scores.tableName}
            WHERE user_id = $1
        `, [userId]);

        return stats.rows[0] || {
            current_score: 0,
            highest_score: 0,
            last_score: 0,
            avg_answer: 0,
            correct_answers: 0,
            incorrect_answers: 0,
            total_questions: 0
        };
    } catch (e) {
        console.log('Error getting user stats:', e);
        throw e;
    }
}

async function getUserData(userId) {
    try {
        const result = await databaseManager.query(`
            SELECT * 
            FROM ${userTables.users.tableName} 
            WHERE supabase_user_id = $1
        `, [userId]);
        return result.rows[0] || null;
    } catch (e) {
        console.error("Error getting user by ID:", e);
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
    emailExists,
    usernameExists,
    getRandomQuestion,
    getQuotesByCharacter,
    getCharacters,
    getUserById,
    changeUserRole,
    getUserRole,
    getUserDataSupabaseAuth,
    checkAnswer,
    lastScoreUser,
    updateUserScore,
    updateUserScoreFailed,
    getUserStats,
    getUserData
}