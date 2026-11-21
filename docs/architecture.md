# Architecture

## Overview

The site is plain HTML, CSS and JavaScript served as static files by Vercel. Anything in `api/` becomes a Node.js serverless function. There is no framework, no bundler and no build step: every page loads one stylesheet and one script, and a push to `main` is a deploy.

```
site/
├── index.html, about.html, suites-care.html, lifestyle.html,
│   events.html, gallery.html, social.html, contact.html, careers.html   public pages
├── submit.html            staff upload page (passcode)
├── review.html            approver page (signed link from email)
├── css/style.css          all styling
├── js/main.js             all behaviour (navigation, search, zoom, carousel, gallery, scroll effects)
├── content/events.json    monthly calendars and event flyers (the only "database")
├── content/social.json    fallback posts when the social API is not configured
├── admin/                 Decap CMS shell and config
├── api/                   serverless functions
│   ├── auth.js            GitHub OAuth redirect for /admin
│   ├── callback.js        OAuth code exchange and Decap handshake
│   ├── update.js          staff submissions: passcode, upload, open pull request, email approvers
│   ├── review.js          approvals: view, approve (publish), reject
│   ├── social.js          Instagram and Facebook feed through the Meta Graph API
│   └── _lib/              shared code: GitHub client, signing, email, events logic
├── tools/check-site.py    pre-commit checker
└── vercel.json            redirects, security headers, weekly cron
```

## Request paths

| Path | What happens |
|---|---|
| Public page | Served from the Vercel edge. `events.html` fetches `content/events.json` and renders the current month. |
| `/social` | The page calls `api/social`, which returns normalised posts cached for 7 days at the edge. A Monday cron forces a refresh. |
| `/admin` | Decap CMS loads, the owner signs in with GitHub through `api/auth` and `api/callback`, and every save is a commit. |
| `/submit` | Staff enter a passcode, upload files (type-sniffed, size-limited), and submit. `api/update` stores each file as a git blob, opens a branch and pull request, and emails the approvers. |
| `/review` | The approver opens the signed link. `api/review` shows exactly what each item replaces on the live site, then publishes or rejects. |

## Events data model

```json
{
  "calendars": [
    { "month": "2027-01", "title": "January 2027 Activities Calendar", "file": "images/events/calendar-2027-01.png" }
  ],
  "flyers": [
    { "title": "New Year's Party", "file": "images/events/new-years.png", "date": "2026-12-31" }
  ]
}
```

The page shows the current month, lists later months as "coming up" tabs, retires past months automatically (keeping the newest if nothing is current), and hides a dated flyer the day after its event. Any date can be previewed with `events.html?today=YYYY-MM-DD`.

## Security

- No secrets in the repository. Every credential (OAuth client secret, repository token, signing secret, passcode, mail credentials) is a Vercel environment variable.
- The repository token used by the functions is fine-grained and scoped to one repository. The staff function can only create branches and pull requests.
- Review links are HMAC-signed, expire, and are compared in constant time. A wrong passcode costs 1.5 seconds per attempt.
- Uploads are limited in size and checked by file signature, not by extension.
- `vercel.json` sets `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy` on every response.
- A deploy ignore list keeps documentation, tooling and editor files off the public site.

## Migration from WordPress

- 308 redirects for every old page URL and every legacy PDF path, which keeps existing links and search results working.
- Old admin and login paths (`/wp-admin`, `/wp-login.php`) redirect home instead of returning errors.
- `sitemap.xml`, `robots.txt` and canonical tags on every page.
- DNS moved from the old host to Vercel with the old site still answering until the switch.
