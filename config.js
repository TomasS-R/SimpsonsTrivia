const {
    // ** POSTGRES **
    CONNECTPOSTGRES: connectPostgres = 'True',
    DATABASEUSER: databaseUser = '',
    DATABASEPASS: databasePassword = '',
    DATABASEHOST: databaseHost = '',
    DATABASEPORT: databasePort = '',
    DATABASENAME: databaseName ='',
    // ** SUPABASE **
    SUPABASE_URL: supabaseUrl = '',
    SUPABASE_ANON_KEY: supabaseAnonKey = '',
    SERVICE_ROLE_KEY: supabaseServiceRoleKey = '',
    // ** HOST & PORT **
    HOST: host = 'localhost',
    PORT: port = '3000',
    // ** JWT **
    JWT_SECRET: JwtSecret = '',
    // ** ENVIRONMENT & HOST WEB**
    NODE_ENV: nodeEnv = 'development',
    URLHOST: urlHost = 'simpsons-trivia.fly.dev',
    // ** CORS **
    CORS_ORIGIN: corsOrigin = '*',
    // ** SENTRY **
    SENTRY_DSN: sentryDsn = '',
    // ** REDIS **
    CONNECT_REDIS: connectRedis = 'True',
    UPSTASH_REDIS_URL: upstashRedisUrl = '',
    UPSTASH_REDIS_TOKEN: upstashRedisToken = '',
    // ** Desarrollo **
    INTERNAL_IPS: internalIps = '',
    RATE_LIMIT_WINDOW_MS: rateLimitWindowMs = '900000',
    RATE_LIMIT_MAX_REQUESTS: rateLimitMaxRequests = '10000'

} = process.env;

module.exports = {
    connectPostgres,
    databaseUser,
    databasePassword,
    databaseHost,
    databasePort,
    databaseName,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    host,
    port,
    JwtSecret,
    nodeEnv,
    urlHost,
    corsOrigin,
    sentryDsn,
    connectRedis,
    upstashRedisUrl,
    upstashRedisToken,
    internalIps,
    rateLimitWindowMs,
    rateLimitMaxRequests
}
