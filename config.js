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
    // ** OAUTH SETTINGS **
    OAUTH_GOOGLE_CLIENT_ID: oauthGoogleClientId = '',
    OAUTH_GOOGLE_CLIENT_SECRET: oauthGoogleClientSecret = '',
    OAUTH_GITHUB_CLIENT_ID: oauthGithubClientId = '',
    OAUTH_GITHUB_CLIENT_SECRET: oauthGithubClientSecret = '',
    // ** SENTRY **
    SENTRY_DSN: sentryDsn = '',
    // ** REDIS **
    CONNECTREDIS: connectRedis = 'True',
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
    // OAuth
    oauthGoogleClientId,
    oauthGoogleClientSecret,
    oauthGithubClientId,
    oauthGithubClientSecret,
    // Sentry
    sentryDsn,
    connectRedis,
    upstashRedisUrl,
    upstashRedisToken,
    internalIps,
    rateLimitWindowMs,
    rateLimitMaxRequests
}
