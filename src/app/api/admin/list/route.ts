import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";
import { getAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await adminDb.collection(COLLECTIONS.admins).orderBy("createdAt", "desc").get();
  const admins = snapshot.docs.map((doc) => ({
    id: doc.id,
    email: doc.data().email,
    displayName: doc.data().displayName,
    role: doc.data().role,
    isActive: doc.data().isActive,
  }));

  return NextResponse.json({ admins });
}