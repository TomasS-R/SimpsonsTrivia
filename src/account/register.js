const queries = require('../dbFiles/queries');
const { supabaseConection } = require('../account/authSupabase');
const redisManager = require('../dbFiles/redisManager');
const { z } = require('zod');

// Función que devuelve el esquema de validación para el registro de usuarios
const validateDataUser = () => {
    return z.object({
        username: z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" }),
        email: z.string().email({ message: "Debe ser un correo electrónico válido" }),
        password: z.string()
            .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
            .refine((data) => /[A-Z]/.test(data) && /[a-z]/.test(data) && /[0-9]/.test(data) && /[\W_]/.test(data), { message: "La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial" }),
    });
};

function formatUserTag(username) {
    return '@' + username
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_{2,}/g, '_');
}

// Función para registrar un usuario usando Supabase Auth
async function registerUser(username, email, password, role, anonymousId, res) {
    
    // 1. Validar los datos de entrada con Zod usando la función encapsulada
    const validationResult = validateDataUser().safeParse({ username, email, password });

    if (!validationResult.success) {
        // Si hay errores de validación, devolver un error con los detalles
        return res.status(400).json({
            success: false,
            error: validationResult.error.errors.map(err => err.message).join(", "),
        });
    }
    try {
        const redisKey = `registration:${email}${username}`;
        const emailExist = await queries.emailExists(email);
        const usernameExist = await queries.usernameExists(username);
        if (emailExist.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: "Email already exists. Please use a different email address.",
            });
        }
        if (usernameExist.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: "Username already exists. Please use a different username.",
            });
        }
        
        let data, error;
        
        if (anonymousId) {
            // Actualizar el usuario anónimo existente
            ({ data, error } = await supabaseConection.auth.updateUser({
                email: email,
                password: password,
                data: {
                    first_name: username,
                }
            }));

            // Obtener una nueva sesión después de actualizar
            if (!error) {
                const { data: sessionData, error: sessionError } = await supabaseConection.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                
                if (sessionError) throw sessionError;
                data = sessionData;
            }
        } else {
            // Crear nuevo usuario
            ({ data, error } = await supabaseConection.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        first_name: username,
                    }
                }
            }));
            // 4. Limpiar datos de Redis después de crear el usuario
            await redisManager.delete(redisKey);
        }

        if (error) {
            return res.status(400).json({
                success: false,
                error: "Supabase Authentication failed: " + error.message,
            });
        }

        // Datos comunes para crear usuario
        const created_at = new Date();
        //const is_anon_user = false;
        const supabaseUserId = data.user.id;

        const user_tag = formatUserTag(username);

        let result;
        if (anonymousId) {
            try {
                result = await queries.createUser(
                    username,
                    user_tag,
                    email,
                    supabaseUserId,
                    role,
                    created_at,
                );
            } catch (dbError) {
                console.error('Database error:', dbError);
                return res.status(500).json({
                    success: false,
                    error: "Database error: " + dbError.message
                });
            }
        }

        const user = result.rows[0];
        
        // Verificar que tenemos todos los datos necesarios
        if (!user || !data || !data.session) {
            return res.status(500).json({
                success: false,
                error: "Missing required data after user operation"
            });
        }

        return {
            user: {
                id: user.id,
                username: user.username,
                user_tag: user.user_tag,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
            },
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_in: data.session.expires_in,
            },
        };

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            error: "An error occurred while registering the user. " + error.message,
            code: 500,
        });
    }
}

module.exports = {
    registerUser,
};
