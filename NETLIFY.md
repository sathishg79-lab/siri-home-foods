Netlify Functions setup (Publish Admin Edits)

This project includes two Netlify Functions to store and serve site data via the GitHub repo:

- `/.netlify/functions/getSiteData` — reads `data/site-data.json` from the `main` branch and returns JSON.
- `/.netlify/functions/updateSiteData` — accepts POST with site JSON and commits/updates `data/site-data.json` in the repo using GitHub Contents API.

Requirements

1. Host the site on Netlify (or any provider that supports Netlify Functions). Ensure the site deploys the same repo where this code lives.
2. Set the following environment variables in the Netlify site settings:
   - `REPO` — the GitHub repo in `owner/repo` format, e.g. `satheesh/Siri_MyHoefoods`.
   - `GITHUB_TOKEN` — a GitHub Personal Access Token with `repo` permissions (to create/update repository contents). Keep this secret.

Deployment notes

- When `updateSiteData` runs it will commit `data/site-data.json` to the `main` branch. The GitHub Pages workflow (`.github/workflows/deploy.yml`) will trigger on pushes to `main` and rebuild the `dist`/`docs` and publish.
- Make sure the Netlify build runs from the same repo/branch so that functions have access to the same codebase context.

Security

- The functions currently accept any request that reaches them and use the GitHub token to commit — protect these endpoints by restricting access or adding simple authentication (for example, require a secret header `X-ADMIN-KEY` and configure the same value in Netlify environment variables).

Next steps (optional)

- Add an `X-ADMIN-KEY` header check in the functions and set `ADMIN_KEY` in Netlify env vars.
- If you prefer the function to create a branch+PR rather than commit to `main`, update the function to create a branch and open a PR via GitHub API.

If you want, I can add the `ADMIN_KEY` header check to the functions now.