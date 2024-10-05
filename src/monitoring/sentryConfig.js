const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

function initSentry() {
    Sentry.init({
        dsn: `${ process.env.SENTRY_DSN }`,
        integrations: [
          nodeProfilingIntegration(),
        ],
        // Tracing
        tracesSampleRate: 1.0, //  Captura el 100% de las transacciones
      
        profilesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });

}

module.exports = {
    initSentry,
    Sentry
}
