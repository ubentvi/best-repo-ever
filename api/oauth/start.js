const crypto = require('node:crypto');

function sign(value) {
  return crypto.createHmac('sha256', process.env.SF_CLIENT_SECRET).update(value).digest('base64url');
}

module.exports = function handler(req, res) {
  if (!process.env.SF_CLIENT_ID || !process.env.SF_CLIENT_SECRET || !process.env.SF_INSTANCE_URL) {
    return res.status(500).send('Salesforce OAuth is not configured.');
  }
  const verifier = crypto.randomBytes(32).toString('base64url');
  const statePayload = Buffer.from(JSON.stringify({ verifier, nonce: crypto.randomBytes(16).toString('hex') })).toString('base64url');
  const state = `${statePayload}.${sign(statePayload)}`;
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SF_CLIENT_ID,
    redirect_uri: `${process.env.PUBLIC_APP_URL}/api/oauth/callback`,
    state,
    code_challenge: crypto.createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
    scope: 'api refresh_token offline_access'
  });
  return res.redirect(`${process.env.SF_INSTANCE_URL.replace(/\/$/, '')}/services/oauth2/authorize?${params}`);
};