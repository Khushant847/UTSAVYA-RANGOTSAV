import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken = body.idToken;

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const { getAuth } = await import("firebase-admin/auth");
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    const adminRef = adminDb.collection(COLLECTIONS.admins).doc(decodedToken.uid);
    const adminDoc = await adminRef.get();

    if (!adminDoc.exists) {
      return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
    }

    const adminData = adminDoc.data()!;
    if (!adminData.isActive) {
      return NextResponse.json({ error: "Admin account is inactive" }, { status: 403 });
    }

    // Verify admin identity via Firebase Auth
    const adminUser = await auth.getUser(decodedToken.uid);

    // Set HTTP-only session cookie (5 days)
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: 60 * 60 * 24 * 5 * 1000 });

    const response = NextResponse.json({
      success: true,
      admin: {
        email: adminUser.email,
        displayName: adminData.displayName || adminUser.displayName || "Admin",
        role: adminData.role,
      },
    });

    response.cookies.set("admin_session", sessionCookie, {
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