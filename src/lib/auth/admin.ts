import "server-only";

import { cookies } from "next/headers";
import type { AdminSessionUser } from "@/lib/auth/session";
import { verifySessionToken } from "@/lib/auth/session";

export type { AdminSessionUser };

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const decoded = verifySessionToken<AdminSessionUser>(sessionCookie);

    if (!decoded?.uid) {
      return null;
    }

    return {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.displayName,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) {
    return null;
  }
  return admin;
}