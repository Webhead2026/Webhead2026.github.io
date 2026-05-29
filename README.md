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

Do not paste a Make webhook directly into the page. Anyone who views the page source can see client-side URLs and potentially submit data to them.

For production, route form submissions through a backend or serverless function, then put that protected endpoint in the `quoteheroes-submit-endpoint` meta tag in `index.html`.
