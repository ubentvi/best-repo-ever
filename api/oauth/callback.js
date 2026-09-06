const crypto = require('node:crypto');

function validState(state) {
  const [payload, signature] = String(state || '').split('.');
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', process.env.SF_CLIENT_SECRET).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

module.exports = async function handler(req, res) {
  try {
    const state = validState(req.query?.state);
    if (!state || !req.query?.code) return res.status(400).send('Invalid OAuth callback.');
    const response = await fetch(`${process.env.SF_INSTANCE_URL.replace(/\/$/, '')}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SF_CLIENT_ID,
        client_secret: process.env.SF_CLIENT_SECRET,
        redirect_uri: `${process.env.PUBLIC_APP_URL}/api/oauth/callback`,
        code: req.query.code,
        code_verifier: state.verifier
      })
    });
    const body = await response.json();
    if (!response.ok || !body.refresh_token) return res.status(502).send(`Salesforce OAuth failed: ${body.error_description || 'no refresh token returned'}`);
    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!doctype html><title>Salesforce authorized</title><p>Copy the refresh token below into your terminal. Do not share it.</p><textarea rows="5" cols="80" readonly>${body.refresh_token}</textarea>`);
  } catch (error) {
    return res.status(400).send(`Invalid OAuth callback: ${error.message}`);
  }
};