const { supabaseConection } = require('./authSupabase');

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

module.exports = { loginUser };