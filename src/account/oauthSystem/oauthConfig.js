const config = require('../../../config');

const oauthProviders = {
  google: {
    name: 'Google',
    icon: 'https://www.google.com/favicon.ico',
    enabled: true,
    clientId: config.oauthGoogleClientId,
    clientSecret: config.oauthGoogleClientSecret
  },
  github: {
    name: 'GitHub',
    icon: 'https://github.com/favicon.ico',
    enabled: true,
    clientId: config.oauthGithubClientId,
    clientSecret: config.oauthGithubClientSecret
  }
};

function getRedirectUrl() {
  const port = process.env.PORT || 3001;
  const baseUrl = config.nodeEnv === 'production' 
    ? `https://${config.urlHost}:${port}`
    : `http://localhost:${port}`;
  return `${baseUrl}/api/v1/oauth/callback`;
}

module.exports = {
  oauthProviders,
  getRedirectUrl
}; 