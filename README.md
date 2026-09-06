# Salesforce DX Project: Next Steps

## Record Files SPA

This project includes a Vercel-compatible headless SPA in `public/` and two serverless endpoints in `api/`. The browser only receives document metadata and same-origin download links; Salesforce OAuth credentials remain server-side.

### Local setup

1. Create a Salesforce External Client App or Connected App with OAuth Web Server Flow, PKCE, and scopes `api`, `refresh_token`, `offline_access`, and `mcp_api`. Use a callback URL appropriate for the host, such as `https://YOUR-APP.vercel.app/oauth/callback`.
2. Obtain a refresh token through that app's OAuth flow. Do not use or commit passwords, client secrets, or refresh tokens.
3. Copy `.env.example` to `.env` and fill in the OAuth values. Keep `.env` untracked.
4. Run `npm run test:web`, then `npm run dev:web` and open the displayed local URL.

The `sigma` Salesforce CLI alias is already configured for org administration. It does not replace the app's OAuth refresh token and is not read by the deployed serverless functions.

### Deployment

Authenticate interactively with `vercel login`, link the project, and run `vercel --prod`. Add `SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_REFRESH_TOKEN`, `SF_INSTANCE_URL`, and optionally `SF_API_VERSION` as encrypted Vercel environment variables for Production before deploying. Never commit `.env` or paste secrets into source control.

The alternative Cloudflare command is `npx wrangler pages deploy public`; that command only serves the static UI unless the API is separately hosted on a compatible serverless runtime. Vercel is the supported deployment target for the included `api/` handlers.

### Security notes

- `recordId` and `versionId` are validated before any Salesforce request.
- SOQL is constructed only after strict record-ID validation.
- `Content-Disposition: inline` allows browser preview without exposing a Salesforce bearer token.
- Rotate any credentials that were shared in chat or another untrusted channel before using this app.

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
