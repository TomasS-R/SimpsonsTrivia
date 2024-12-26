const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
const config = require('../../config');

function initSentry() {
    Sentry.init({
        dsn: `${ config.sentryDsn }`,
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
