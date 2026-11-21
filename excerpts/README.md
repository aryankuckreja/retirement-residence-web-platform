# Excerpts

Selected pieces of the production code, cleaned up for reading. Configuration names, client-specific values and the surrounding plumbing have been removed, which means these files are not runnable on their own. The full source is in a private repository owned by the client.

| File | What it shows |
|---|---|
| `signed-review-links.js` | HMAC-signed, expiring approval tokens with constant-time comparison |
| `publish-with-retry.js` | Publishing an approved update as one commit on top of the live branch, with optimistic retries |
| `events-schedule.js` | The date rules that decide which calendars and flyers are visible on a given day |
