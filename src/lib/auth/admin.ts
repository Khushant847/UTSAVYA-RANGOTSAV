import "server-only";

import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";

export interface AdminSessionUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const { getAuth } = await import("firebase-admin/auth");
    const auth = getAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    if (!decoded.uid) {
      return null;
    }

    const token = decoded as DecodedIdToken & { role?: string };
    return {
      uid: token.uid,
      email: token.email || "",
      displayName: token.name || token.email?.split("@")[0] || "Admin",
      role: token.role || "admin",
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