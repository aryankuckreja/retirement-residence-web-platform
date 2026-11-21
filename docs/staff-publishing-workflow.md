# Staff publishing workflow

The owner wanted staff to be able to post the monthly activities calendar, event flyers and photo updates without being able to change the public site themselves. This is the flow that delivers that on free tiers.

```mermaid
sequenceDiagram
    actor Staff
    participant Submit as /submit + api/update
    participant GH as Private repo
    actor Owner
    participant Review as /review + api/review
    participant Vercel

    Staff->>Submit: passcode, then upload calendar / flyer / photo
    Submit->>Submit: check size and file signature
    Submit->>GH: store files as blobs, create branch update/<id>, open pull request
    Submit->>Owner: email with a signed review link (valid 30 days)
    Owner->>Review: open link on any device
    Review->>GH: read the pull request and what each item replaces
    Review-->>Owner: side-by-side "what changes on the live site"
    alt Approve
        Owner->>Review: approve
        Review->>GH: build one commit on top of current main, fast-forward main
        GH->>Vercel: push triggers deploy
        Review->>Staff: result email
    else Reject
        Owner->>Review: reject with optional reason
        Review->>GH: label and close the pull request, delete the branch
        Review->>Staff: result email with the reason
    end
```

## Why it is built this way

**Staff can only propose.** The function behind `/submit` can create a branch and open a pull request. It cannot move `main`. The only code path that changes the live site is the approval in `api/review`, which requires a valid signed link.

**No conflicts between pending updates.** If two calendars are waiting, approving the second one must not undo the first. On approval the function reads the *current* `main`, applies the change to that version of `events.json`, creates one commit, and fast-forwards `main`. If `main` moved during that window, GitHub rejects the update and the function rebuilds and retries (up to 4 times).

**GitHub still shows a merged pull request.** The pull request branch is pointed at the final commit before `main` is fast-forwarded, which makes GitHub record the pull request as merged and keeps the history readable.

**Approvers need no account.** Approval happens through a link in an email. The token inside it names exactly one pull request and an expiry, and is signed with a server-side secret.

**Every change is reversible.** Because publishing is an ordinary commit, any update can be reverted from the repository history.
