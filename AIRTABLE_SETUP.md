# Airtable Lead Setup

This site sends leads to Airtable through a Cloudflare Worker. The Worker keeps the Airtable token private, then writes each quote request into your Airtable table.

## 1. Create the Airtable base

Create a base named `Quote Heroes`.

Create a table named `Leads`.

Add these fields with these exact names:

| Field name | Airtable type |
| --- | --- |
| Date Submitted | Date |
| Status | Single select |
| Customer Name | Single line text |
| Phone | Phone number |
| Email | Email |
| Street Address | Single line text |
| City | Single line text |
| ZIP Code | Single line text |
| Service Type | Single select |
| Timeline | Single select |
| Job Description | Long text |
| Details | Long text |
| Photo Files | Long text |
| Photos | Attachment |
| Source | Single line text |

Suggested `Status` options:

- New Lead
- Contacted
- Sent to Pros
- Quoted
- Won
- Lost

## 2. Create an Airtable personal access token

Go to:

https://airtable.com/create/tokens

Create a token with:

- Scope: `data.records:write`
- Access: your `Quote Heroes` base

Copy the token once. Airtable will not show it again.

## 3. Find the Airtable base ID

Open the Airtable base. The base ID starts with `app` in the URL:

```text
https://airtable.com/appXXXXXXXXXXXXXX/...
```

## 4. Deploy the Worker

In Cloudflare:

1. Go to Workers & Pages.
2. Create a Worker.
3. Paste the contents of `airtable-worker.js`.
4. Deploy it.

Add these Worker variables/secrets:

| Name | Type | Value |
| --- | --- | --- |
| AIRTABLE_PAT | Secret | Your Airtable personal access token |
| AIRTABLE_BASE_ID | Variable | Your `app...` base ID |
| AIRTABLE_TABLE_NAME | Variable | `Leads` |
| AIRTABLE_PHOTOS_FIELD | Variable | `Photos` |
| ALLOWED_ORIGINS | Variable | `https://myquoteheroes.com,https://www.myquoteheroes.com,https://webhead2026.github.io` |

Copy the deployed Worker URL. It will look like:

```text
https://quote-heroes-leads.YOUR-SUBDOMAIN.workers.dev
```

## 5. Connect the website to the Worker

In `index.html`, update this line:

```html
<meta name="quoteheroes-submit-endpoint" content="" />
```

Put the Worker URL in `content`:

```html
<meta name="quoteheroes-submit-endpoint" content="https://quote-heroes-leads.YOUR-SUBDOMAIN.workers.dev" />
```

Commit and publish the site.

## 6. Test it

Submit one test lead from:

```text
https://myquoteheroes.com
```

You should see a new row appear in Airtable.
