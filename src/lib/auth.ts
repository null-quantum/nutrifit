import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import type { SafeUser } from "@/lib/types";

const JWT_SECRET = process.env.JWT_SECRET || "nutrifit-dev-secret-change-in-production";
const COOKIE_NAME = "nutrifit_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * Detect whether the current request arrived over HTTPS — from the
 * BROWSER's perspective, which is what matters for cookie acceptance.
 *
 * The app is exposed two ways:
 *  1. Direct on http://localhost:3000 (dev / agent-browser tests).
 *  2. Through the Caddy gateway, externally served over HTTPS and
 *     rendered inside a cross-site iframe (the preview panel).
 *
 * Cross-site iframes require `SameSite=None; Secure` for cookies to
 * persist. Direct localhost is plain HTTP, so it must use
 * `SameSite=Lax` (Secure cookies cannot be set over HTTP, and
 * `SameSite=None` requires `Secure`).
 *
 * Detection order (most reliable first):
 *  - `referer`: the browser sends the page's full URL; its scheme is
 *    the ground truth for how the user loaded the app.
 *  - `x-forwarded-proto`: set by the Caddy gateway.
 *  - `x-forwarded-ssl` / `forwarded`: alternate proxy conventions.
 */
async function isHttpsRequest(): Promise<boolean> {
  const hdrs = await headers();

  const referer = hdrs.get("referer");
  if (referer) return referer.startsWith("https://");

  const proto = hdrs.get("x-forwarded-proto");
  if (proto) return proto.includes("https");

  if (hdrs.get("x-forwarded-ssl") === "on") return true;

  const forwarded = hdrs.get("forwarded");
  if (forwarded) return /proto=https/i.test(forwarded);

  return false;
}

async function cookieOptions() {
  const secure = await isHttpsRequest();
  return {
    httpOnly: true,
    secure,
    // `SameSite=None` is only valid when `Secure` is also true.
    sameSite: secure ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

/** Hash a plaintext password using bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/** Verify a plaintext password against a bcrypt hash. */
export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

/** Sign a JWT for a user. */
export function signToken(user: SessionUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Sign a JWT and set it as an HTTP-only cookie. Returns the token so the
 * caller can ALSO return it in the JSON body as a Bearer fallback (used
 * when third-party cookies are blocked in cross-site iframe previews).
 */
export async function setAuthCookie(user: SessionUser): Promise<string> {
  const token = signToken(user);
  const store = await cookies();
  store.set(COOKIE_NAME, token, await cookieOptions());
  return token;
}

/** Clear the auth cookie (logout). Matches the cookie's security flags. */
export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  // delete() with explicit options ensures a Secure cookie is matched.
  store.set(COOKIE_NAME, "", {
    ...(await cookieOptions()),
    maxAge: 0,
  });
}

/** Load a user from a verified JWT string. */
async function getUserFromToken(token: string) {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
    sub: string;
  };
  if (!decoded?.sub) return null;
  return db.user.findUnique({
    where: { id: decoded.sub },
    select: {
      id: true,
      name: true,
      email: true,
      onboardingDone: true,
      profile: true,
      createdAt: true,
    },
  });
}

/**
 * Read & verify the current session.
 *
 * Checks the HTTP-only cookie first; if absent (e.g. blocked by the
 * browser in a cross-site iframe), falls back to the `Authorization:
 * Bearer <token>` header. Returns the user document or null.
 */
export async function getSession() {
  try {
    const store = await cookies();
    let token = store.get(COOKIE_NAME)?.value;

    if (!token) {
      const hdrs = await headers();
      const authHeader = hdrs.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) return null;
    return await getUserFromToken(token);
  } catch {
    return null;
  }
}

/** Require an authenticated session or throw a 401-ish error. */
export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    throw new AuthError("Unauthorized — please sign in.", 401);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * The raw user row from Prisma (with nested `profile` Json).
 * Used as the input type for `toSafeUser`.
 */
export type RawUser = {
  id: string;
  name: string;
  email: string;
  onboardingDone: boolean;
  profile: unknown;
  createdAt: Date;
};

/**
 * Flatten the nested `profile` Json into the top-level fields the
 * frontend expects (user.age, user.macros.protein, user.targetCalories,
 * etc.). This mirrors the original Express API's response shape so the
 * ported React components work unchanged.
 */
export function toSafeUser(user: RawUser): SafeUser {
  const p = (user.profile as Record<string, unknown> | null) ?? null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    onboardingDone: user.onboardingDone,
    age: p?.age as number | undefined,
    sex: p?.sex as string | undefined,
    height: p?.heightCm as number | undefined,
    weight: p?.weightKg as number | undefined,
    activityLevel: (p?.activityLevel as string | undefined) ?? "moderate",
    goal: (p?.goal as string | undefined) ?? "maintain",
    targetCalories: p?.targetCalories as number | undefined,
    macros: p?.macros as { protein: number; carbs: number; fat: number } | undefined,
    stepGoal: p?.stepGoal as number | undefined,
    exerciseType: p?.exerciseType as string | undefined,
    dietPreference: p?.dietPreference as string | undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

export { COOKIE_NAME };
