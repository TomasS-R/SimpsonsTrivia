const { supabaseConection } = require('./authSupabase');
const { getRedirectUrl } = require('./oauthSystem/oauthConfig');

/**
 * Inicia sesión de usuario con email y contraseña
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Datos del usuario autenticado
 */
async function loginUser(email, password) {
    const { data, error } = await supabaseConection.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return { data };
}

/**
 * Inicia el flujo de autenticación OAuth
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>}
 */
async function loginWithOAuth(req, res) {
    try {
        const { provider } = req.params;

        if (!['github', 'google'].includes(provider)) {
            return res.status(400).send({ error: 'Proveedor no válido' });
        }
        
        const redirectTo = getRedirectUrl();
        console.log(`Iniciando flujo OAuth con ${provider}, URL de redirección: ${redirectTo}`);
        
        const { data, error } = await supabaseConection.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account'
                }
            },
        });

        if (error) {
            console.error(`Error al iniciar sesión con ${provider}:`, error);
            return res.status(500).json({ 
                success: false, 
                error: `Error al iniciar sesión con ${provider}: ${error.message}` 
            });
        }
        
        console.log(`Respuesta de Supabase para ${provider}:`, data);
        
        if (!data?.url) {
            return res.status(500).json({
                success: false,
                error: `No se pudo obtener URL de autenticación para ${provider}`
            });
        }
        
        console.log(`Redirigiendo a ${provider} URL:`, data.url);
        return res.redirect(data.url);
    } catch (error) {
        console.error('Error al iniciar sesión con OAuth:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor durante la autenticación OAuth: ' + error.message 
        });
    }
}

/**
 * Verifica y procesa el token de acceso de OAuth
 * @param {string} accessToken - Token de acceso proporcionado por el proveedor OAuth
 * @returns {Promise<Object>} - Datos del usuario autenticado
 */
async function verifyOAuthToken(accessToken) {
    try {
        // Establecer la sesión usando el token de acceso
        const { data, error } = await supabaseConection.auth.setSession({
            access_token: accessToken,
        });

        if (error) {
            throw new Error(error.message);
        }

        console.log(data);

        return { data };
    } catch (error) {
        console.error('Error al verificar el token OAuth:', error);
        throw error;
    }
}

module.exports = {
    loginUser,
    loginWithOAuth,
    verifyOAuthToken,
};