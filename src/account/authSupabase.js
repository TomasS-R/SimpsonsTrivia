const { createClient } = require('@supabase/supabase-js')
const config = require('../../config');

const supabaseConection = createClient(config.supabaseUrl, config.supabaseAnonKey);

module.exports = {
    supabaseConection
}