# Key decisions

| # | Decision | Options considered | Why this one |
|---|---|---|---|
| 1 | Plain HTML, CSS and JavaScript | A React or Next.js site; a page builder | No build step, fast on older devices, and maintainable by anyone who knows the basics. The site is content-led and does not need client-side state. |
| 2 | Vercel Hobby + private GitHub repo | Paid hosting; keeping WordPress | Zero cost was a hard constraint. Vercel gives static hosting, serverless functions, cron and preview deploys on the free tier. |
| 3 | Approval through pull requests opened by a function | Branch protection; giving staff CMS accounts | Branch protection on a private repository needs a paid plan, and CMS accounts would give staff direct publish rights. |
| 4 | Signed, expiring email links for approval | Approver accounts and passwords | The owner approves from her phone in one tap. Nothing to sign up for, nothing to forget. |
| 5 | One JSON file drives the Events page | A database; editing HTML each month | Dates in the data make content expire automatically. JSON is easy to diff, review and roll back. |
| 6 | Decap CMS for owner edits | A hosted headless CMS | Free, stores content in the same repository, and every save is a commit. |
| 7 | Redirect every legacy URL | Letting old links 404 | Preserves existing links and search rankings after the WordPress shutdown. |
| 8 | Pre-commit checker | Manual review before pushing | Catches broken links, missing navigation or search entries, and files that should not be public, before they ship. |
