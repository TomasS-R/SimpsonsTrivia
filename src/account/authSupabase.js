const { createClient } = require('@supabase/supabase-js')

const supabaseConection = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = {
    supabaseConection
}