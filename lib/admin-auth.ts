import "server-only";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "cms_admin_session";

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isLocalDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export class UnauthorizedAdminError extends Error {
  constructor(message = "Admin access denied.") {
    super(message);
    this.name = "UnauthorizedAdminError";
  }
}

/**
 * True once the admin secret has been unlocked for this browser session (or
 * immediately, if no ADMIN_SECRET is configured at all — NODE_ENV is then
 * the only gate). Checking the secret via an httpOnly cookie rather than a
 * client-supplied header means it can't be read or replayed by JS in the
 * page, and it never leaves the machine since production never reaches here.
 */
export async function isAdminUnlocked(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === secret;
}

/**
 * The single security boundary for every admin mutation. Call this first,
 * unconditionally, at the top of every Server Action in app/admin/actions.ts.
 *
 * - Production is refused outright, with no override — this is what
 *   guarantees zero public write access regardless of any leaked secret or
 *   middleware misconfiguration.
 * - Outside production (dev, or a local `next start`), an optional
 *   ADMIN_SECRET adds a second factor for cases where NODE_ENV alone isn't
 *   enough (e.g. testing a production build locally).
 */
export async function assertLocalAdmin(): Promise<void> {
  if (isProductionEnv()) {
    throw new UnauthorizedAdminError("Admin mutations are disabled in production.");
  }
  if (!(await isAdminUnlocked())) {
    throw new UnauthorizedAdminError("Enter the admin secret to make changes.");
  }
}

export async function unlockAdmin(secretAttempt: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  if (secretAttempt !== secret) return false;

  const store = await cookies();
  store.set(ADMIN_COOKIE, secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // local-only by design; this cookie is never set in production
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  return true;
}

export async function lockAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
