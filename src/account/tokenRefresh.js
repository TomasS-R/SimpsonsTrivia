const { supabaseConection } = require('./authSupabase');
const config = require('../../config');

const refreshAccessToken = (req, res, next) => {
    (async () => {
        try {
            // Log detallado del estado actual
            /*
            console.log('\n=== Refresh Token Middleware ===');
            console.log('Request path:', req.path);
            console.log('Cookies:', {
                accessToken: req.cookies?.accessToken ? 'present' : 'missing',
                refreshToken: req.cookies?.refreshToken ? 'present' : 'missing'
            });
            */

            if (!req.cookies?.refreshToken) {
                //console.log('❌ No refresh token found');
                return next();
            }

            // Si hay access token, verificar si está por expirar
            if (req.cookies?.accessToken) {
                try {
                    const [, payload] = req.cookies.accessToken.split('.');
                    const decodedToken = JSON.parse(Buffer.from(payload, 'base64').toString());
                    const expiresIn = decodedToken.exp * 1000 - Date.now();
                    
                    //console.log(`Access token expires in: ${Math.floor(expiresIn / 1000)} seconds`);
                    
                    // Si el token expira en menos de 5 minutos, refrescarlo
                    if (expiresIn > 5 * 60 * 1000) {
                        //console.log('✅ Access token still valid');
                        return next();
                    }
                } catch (e) {
                    console.log('Error decoding token:', e);
                }
            }

            //console.log('🔄 Attempting to refresh token...');
            
            const { data, error } = await supabaseConection.auth.refreshSession({
                refresh_token: req.cookies.refreshToken
            });

            if (error) {
                console.error('❌ Error refreshing session:', error);
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
                return next();
            }

            if (data?.session) {
                //console.log('✅ Session refreshed successfully');
                
                // Establecer nuevas cookies
                res.cookie('accessToken', data.session.access_token, {
                    httpOnly: true,
                    secure: config.nodeEnv === 'production',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 1000 // 1 hora
                });

                res.cookie('refreshToken', data.session.refresh_token, {
                    httpOnly: true,
                    secure: config.nodeEnv === 'production',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
                });
            }

            next();
        } catch (error) {
            console.error('❌ Error in refresh middleware:', error);
            next(error);
        }
    })();
};

module.exports = refreshAccessToken; 