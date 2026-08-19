# Heroku Deployment

The app deploys to Heroku through [GitHub Actions](../.github/workflows/deploy-heroku.yml). Heroku runs `python3 server.py` from the `Procfile` and supplies the port through `$PORT`.

## One-time setup

### 1. Create the Heroku app

Install the Heroku CLI, sign in, and create or link an app:

```bash
heroku login
heroku create YOUR_APP_NAME --stack heroku-26
```

If the app already exists:

```bash
heroku git:remote --app YOUR_APP_NAME
```

Heroku may require a paid dyno or Eco subscription.

### 2. Configure GitHub

In the GitHub repository, open **Settings → Secrets and variables → Actions** and add:

| Type | Name | Value |
|---|---|---|
| Repository secret | `HEROKU_API_KEY` | Token from Heroku Account Settings → Applications → Authorizations |
| Repository variable | `HEROKU_APP_NAME` | Your Heroku app name |

Never commit or print the API key.

## Deploy

Push an application change to `main`:

```bash
git add <files>
git commit -m "Describe the change"
git push origin main
```

The workflow deploys code, scripts, configuration, and app assets. A push containing only GitHub workflow or documentation changes is skipped.

To deploy manually, open **GitHub → Actions → Deploy to Heroku → Run workflow**.

## Verify and troubleshoot

Check the run under **GitHub → Actions → Deploy to Heroku**. For direct Heroku checks:

```bash
heroku open --app YOUR_APP_NAME
heroku ps --app YOUR_APP_NAME
heroku logs --tail --app YOUR_APP_NAME
```

Common issues:

- **Authentication failed:** replace `HEROKU_API_KEY` with a valid authorization token.
- **App not found:** confirm `HEROKU_APP_NAME` exactly matches the Heroku app.
- **Build failed:** review the Actions and Heroku logs; confirm `Procfile`, `.python-version`, and `requirements.txt` remain in the repository root.
- **App starts slowly:** Eco dynos can sleep while inactive.

## Storage note

Heroku does not store client plans. The browser saves them in `localStorage`, scoped to the deployed site address and browser profile.
