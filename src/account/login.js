const { supabaseConection } = require('./authSupabase');
const config = require('../../config');

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

async function loginWithOAuth(req, res) {
    try {
        const { provider } = req.params;

        console.log('loginWithOAuth', provider);

        const isProduction = config.nodeEnv === 'production';
        const urlhost = isProduction ? config.urlHost : `http://localhost:${config.port}`;
        const redirectTo = `${urlhost}/api/v1/oauth/callback`;

        console.log('urlpath', redirectTo);
        if (!['github', 'google'].includes(provider)) {
            return res.status(400).send({ error: 'Invalid provider' });
        }
        
        const { data , error } = await supabaseConection.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo,
            },
        });

        console.log('data', data);

        if (error) {
            console.error('Error logging in with GitHub:', error);
        }
        return res.redirect(data.url);
    } catch (error) {
        console.error('Error logging in with OAuth:', error);
        throw error;
    }
}

module.exports = {
    loginUser,
    loginWithOAuth,
};