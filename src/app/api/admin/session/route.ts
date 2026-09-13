import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";
import { createAdminSessionToken, lookupAdminIdToken } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken = body.idToken;

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const user = await lookupAdminIdToken(idToken);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const adminRef = adminDb.collection(COLLECTIONS.admins).doc(user.uid);
    const adminDoc = await adminRef.get();

    if (!adminDoc.exists) {
      return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
    }

    const adminData = adminDoc.data()!;
    if (!adminData.isActive) {
      return NextResponse.json({ error: "Admin account is inactive" }, { status: 403 });
    }

    const sessionToken = createAdminSessionToken({
      uid: user.uid,
      email: user.email,
      displayName: adminData.displayName || user.displayName,
      role: adminData.role,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        email: user.email,
        displayName: adminData.displayName || user.displayName,
        role: adminData.role,
      },
    });

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 5,
    });

    return response;
  } catch (error) {
    console.error("Admin session error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}