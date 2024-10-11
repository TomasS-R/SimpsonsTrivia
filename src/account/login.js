const passport = require('passport');
const jwt = require('jsonwebtoken');

async function loginUser(req, res, next) {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) {
            console.error('Error in the authentication:', err);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: info ? info.message : 'Invalid credentials',
            });
        }

        req.login(user, {session: false}, (err) => {
            if (err) {
                console.error('Error in req.login:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error to login',
                });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const responseData = {
                success: true,
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                },
            };

            return res.status(200).json(responseData)
        });
    })(req, res, next);
}

module.exports = {
    loginUser,
};