// Excerpt: signed approval links (from the private repository, cleaned for reading).
//
// A review link carries a token = base64url({ pr, exp }) + "." + HMAC-SHA256.
// It names exactly one submission (pull request) and stops working after LINK_DAYS.
// The signing secret lives only in a server-side environment variable.

import { createHmac, timingSafeEqual } from "node:crypto";

const LINK_DAYS = 30;

function sameText(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && timingSafeEqual(x, y);   // constant-time compare
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");
const sign = (data) => b64url(createHmac("sha256", process.env.APPROVAL_SECRET).update(data).digest());

export function makeReviewToken(pr, now = Date.now()) {
  const data = b64url(JSON.stringify({ pr, exp: now + LINK_DAYS * 86_400_000 }));
  return `${data}.${sign(data)}`;
}

export function readReviewToken(token, now = Date.now()) {
  const [data, sig] = String(token || "").split(".");
  if (!data || !sig || !process.env.APPROVAL_SECRET || !sameText(sig, sign(data))) {
    throw Object.assign(new Error("This review link is not valid."), { status: 403 });
  }
  let body;
  try { body = JSON.parse(Buffer.from(data, "base64url").toString("utf8")); } catch { body = {}; }
  if (!Number.isInteger(body.pr)) throw Object.assign(new Error("This review link is not valid."), { status: 403 });
  if (!(body.exp > now)) throw Object.assign(new Error("This review link has expired."), { status: 410 });
  return { pr: body.pr };
}

// A wrong staff passcode costs 1.5 seconds, which makes guessing impractical.
export async function passcodeOk(given) {
  const ok = !!process.env.SUBMIT_PASSWORD && sameText(String(given || "").trim(), process.env.SUBMIT_PASSWORD);
  if (!ok) await new Promise((r) => setTimeout(r, 1500));
  return ok;
}
