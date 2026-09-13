import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

export interface AdminSessionUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

export function signSessionToken(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken<T = { exp?: number }>(token: string): (T & { exp?: number }) | null {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }
  const [body, sig] = parts;

  let expected: Buffer;
  try {
    expected = createHmac("sha256", getSecret()).update(body).digest();
  } catch {
    return null;
  }

  let actual: Buffer;
  try {
    actual = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { exp?: number };
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function createAdminSessionToken(admin: {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}): string {
  return signSessionToken({ ...admin, exp: Date.now() + FIVE_DAYS_MS });
}

export async function lookupAdminIdToken(idToken: string): Promise<{
  uid: string;
  email: string;
  displayName: string;
} | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set");
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = (await res.json().catch(() => ({}))) as {
    users?: { localId?: string; email?: string; displayName?: string }[];
  };

  if (!res.ok || !data.users?.length || !data.users[0].localId) {
    return null;
  }

  const u = data.users[0];
  return {
    uid: u.localId!,
    email: u.email ?? "",
    displayName: u.displayName ?? u.email?.split("@")[0] ?? "Admin",
  };
}