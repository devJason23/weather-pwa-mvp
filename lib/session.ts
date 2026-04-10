import { createHash, timingSafeEqual } from "crypto";

export const COOKIE_NAME = "courtreview_session";

export function sessionToken(email: string, secret: string) {
  return createHash("sha256").update(`${email}:${secret}`).digest("hex");
}

export function constantCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
