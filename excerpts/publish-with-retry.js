// Excerpt: publishing an approved staff update (from the private repository, cleaned for reading).
//
// Publishing = one new commit on top of the CURRENT live branch, so two pending
// updates never conflict. If the live branch moves between reading it and
// updating it, GitHub answers 422 and the commit is rebuilt on the new head.

import { headSha, readFile, createBlob, commitFiles, moveBranch } from "./github.js";
import { applyToEvents, touchesEvents, todayInToronto } from "./changes.js";

const LIVE_BRANCH = "main";

export async function publish(number, manifest) {
  const items = manifest.items;

  for (let attempt = 1; attempt <= 4; attempt++) {
    const base = await headSha(LIVE_BRANCH);

    // Uploaded files were stored as git blobs at submission time; reuse them.
    const files = items.map((i) => ({ path: i.path, sha: i.blob }));

    // Calendars and flyers also update the events file, applied to the live version.
    if (touchesEvents(items)) {
      const current = await readFile("content/events.json", base);
      let existing = {};
      try { existing = current ? JSON.parse(current.text) : {}; } catch { existing = {}; }
      const next = applyToEvents(existing, items, todayInToronto());
      const json = JSON.stringify(next, null, 2) + "\n";
      files.push({ path: "content/events.json", sha: await createBlob(Buffer.from(json).toString("base64")) });
    }

    const commit = await commitFiles({
      parent: base,
      message: `${manifest.headline} (approved update #${number})`,
      files,
    });

    // Point the pull request branch at the final commit first, then fast-forward
    // the live branch to it. GitHub then records the pull request as merged.
    await moveBranch(manifest.branch, commit, true).catch(() => {});
    try {
      await moveBranch(LIVE_BRANCH, commit, false);   // fast-forward only
      return commit;
    } catch (e) {
      if (e.status !== 422 || attempt === 4) throw e;  // 422: live branch moved, rebuild on top of it
    }
  }
}
