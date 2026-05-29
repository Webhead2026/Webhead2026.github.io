# Quote Heroes Website

This is a static website for Quote Heroes.

## Files

- `index.html` — the full website
- `.nojekyll` — tells GitHub Pages to serve the site as plain static files

## Publish with GitHub Pages

1. Create a new GitHub repository named `webhead2026.github.io`.
2. Upload `index.html` and `.nojekyll` to the root of the repository.
3. Go to Settings → Pages.
4. Set the source to deploy from a branch.
5. Choose the `main` branch and `/root`.
6. Save.

Your site should publish at:

https://webhead2026.github.io

## Important security note

The current `index.html` includes a public Make webhook URL. That means anyone who views the page source can see the webhook and potentially submit data to it. For a quick MVP this may be acceptable, but for a real production site you should route form submissions through a backend/serverless function or rotate/protect the webhook.
