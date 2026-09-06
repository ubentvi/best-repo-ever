const API_VERSION = process.env.SF_API_VERSION || 'v60.0';

function config() {
  const required = ['SF_CLIENT_ID', 'SF_CLIENT_SECRET', 'SF_REFRESH_TOKEN', 'SF_INSTANCE_URL'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing server configuration: ${missing.join(', ')}`);
  return { instanceUrl: process.env.SF_INSTANCE_URL.replace(/\/$/, '') };
}

async function accessToken() {
  const { instanceUrl } = config();
  const response = await fetch(`${new URL(instanceUrl).origin}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
      refresh_token: process.env.SF_REFRESH_TOKEN
    })
  });
  if (!response.ok) throw new Error(`Salesforce OAuth failed (${response.status}).`);
  return (await response.json()).access_token;
}

async function request(path, options = {}) {
  const { instanceUrl } = config();
  const token = await accessToken();
  return fetch(`${instanceUrl}/services/data/${API_VERSION}${path}`, {
    ...options,
    headers: { authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
}

module.exports = { request };