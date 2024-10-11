const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const queries = require('../dbFiles/queries');

// Funcion para registrar un usuario
async function registerUser (username, email, password, role = 'user', res) {
    try {
        // Valida si el usuario ya existe
        const userExist = await queries.userExists(email);

        if (userExist.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: "Email already exists. Please use a different email address.",
            });
        }
        // Encriptar la contraseña
        const hashedPassword = await bcryptjs.hash(password, 10);

        const created_at = new Date();
        const result = await queries.createUser(username, email, hashedPassword, role, created_at);
        const user = result.rows[0];

        const token = jwt.sign(
            { id: result.id, email: result.email, role: result.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            success: true,
            token: token,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "An error occurred while registering the user." + error.message,
            code: 500,
        });
    }
}

module.exports = {
    registerUser,
};