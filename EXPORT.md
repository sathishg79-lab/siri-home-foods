Workflow: Publish admin changes to live site

1. In the Admin portal (login via /admin), click **Export Site Data**. This downloads `sirihomefoods-data.json`.

2. Copy the downloaded `sirihomefoods-data.json` to the project root (next to package.json).

3. Run the helper to apply the exported data into the code defaults:

```bash
node scripts/apply_export.js sirihomefoods-data.json
```

This will update `src/context/StoreContext.jsx` (a backup is created) with the exported products, categories, contact info, banners and banner settings.

4. Review the changes, commit and push a branch, then open a PR to `main` so the GitHub Actions build will run and deploy the updated site.

Example Git commands:

```bash
git checkout -b update/site-data
git add src/context/StoreContext.jsx
git commit -m "Update site defaults from admin export"
git push -u origin update/site-data
# Open a PR on GitHub to merge into main
```

Notes:
- The site on GitHub Pages is a static build created from `dist/` and served from `docs/` by the workflow in `.github/workflows/deploy.yml`.
- This approach updates the default data baked into the site. For live editing without rebuilding, consider implementing a remote backend for persistence (I can help scaffold this if you want).