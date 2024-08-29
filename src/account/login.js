const queries = require('../dbFiles/queries');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

async function loginUser(username, password, res){
    try {
        // Verificar si el usuario existe
        const result = await queries.userExists(username);

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: "User not found",
            });
        }

        const user = result.rows[0];

        // Validar la contraseña
        const validPassword = await bcryptjs.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                error: "Invalid password",
            });
        }
        // Generar el token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            error: e.message,
        });
    }
}

module.exports = {
    loginUser,
};