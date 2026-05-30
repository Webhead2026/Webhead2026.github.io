# Quote Heroes Website

This is a static website for Quote Heroes.

## Files

- `index.html` - the full website
- `.nojekyll` - tells GitHub Pages to serve the site as plain static files
- `airtable-worker.js` - private endpoint code for sending leads to Airtable
- `AIRTABLE_SETUP.md` - setup steps for the Airtable lead inbox

## Publish with GitHub Pages

1. Create a new GitHub repository named `webhead2026.github.io`.
2. Upload `index.html` and `.nojekyll` to the root of the repository.
3. Go to Settings > Pages.
4. Set the source to deploy from a branch.
5. Choose the `main` branch and `/root`.
6. Save.

Your site should publish at:

https://webhead2026.github.io

## Airtable Leads

Use `AIRTABLE_SETUP.md` to create the Airtable lead table and deploy the private Cloudflare Worker endpoint.

After the Worker is deployed, put its URL in the `quoteheroes-submit-endpoint` meta tag in `index.html`.

## Important Security Note

Do not paste Airtable tokens, Make webhooks, or other private keys directly into the page. Anyone who views the page source can see client-side URLs and secrets.

For production, route form submissions through a backend or serverless function, then put that protected endpoint in the `quoteheroes-submit-endpoint` meta tag in `index.html`.
