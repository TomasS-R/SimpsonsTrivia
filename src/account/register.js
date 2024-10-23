const queries = require('../dbFiles/queries');
const { supabaseConection } = require('../account/authSupabase')
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

// Función para registrar un usuario usando Supabase Auth
async function registerUser(username, email, password, role, res) {
    
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
        // 2. Verificar si el usuario ya existe en la base de datos personalizada
        const userExist = await queries.userExists(email);
        if (userExist.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: "Email already exists. Please use a different email address.",
            });
        }
        
        // 3. Crear el usuario en Supabase Auth
        const { data, error } = await supabaseConection.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: "Supabase Authentication failed: " + error.message,
            });
        }

        // ID del usuario creado en Supabase Auth
        const supabaseUserId = data.user.id;

        // 4. Guardar el usuario en la base de datos con el rol asignado
        const created_at = new Date();
        const result = await queries.createUser(username, email, supabaseUserId, role, created_at); // Guardar en tu DB

        const user = result.rows[0];

        return {
            user: {
                id: user.id,
                username: user.username,
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
