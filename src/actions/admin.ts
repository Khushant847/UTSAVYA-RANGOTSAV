"use server";

import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";
import { getAdminSession } from "@/lib/auth/admin";
import { lookupAdminIdToken } from "@/lib/auth/session";

export async function getAdminStats() {
  const admin = await getAdminSession();
  if (!admin) {
    throw new Error("Unauthorized: admin session required.");
  }

  const ticketsRef = adminDb.collection(COLLECTIONS.tickets);
  const ticketsSnapshot = await ticketsRef.get();

  let totalBookings = 0;
  let totalPaidEntries = 0;
  let entriesUsed = 0;
  let failedPayments = 0;
  let totalRevenue = 0;
  let entriesRemaining = 0;

  ticketsSnapshot.forEach((doc) => {
    const t = doc.data();
    totalBookings++;

    if (t.paymentStatus === "paid") {
      totalPaidEntries += t.allowedEntries || 0;
      totalRevenue += t.passPrice || 0;
      entriesUsed += t.usedEntries || 0;
      entriesRemaining += t.remainingEntries || 0;
    }

    if (t.paymentStatus === "failed") {
      failedPayments++;
    }
  });

  return {
    totalBookings,
    totalPaidEntries,
    totalRevenue,
    entriesUsed,
    entriesRemaining,
    failedPayments,
  };
}

export interface AdminSession {
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
}

export async function verifyAndCreateAdminSession(token: string) {
  try {
    const user = await lookupAdminIdToken(token);

    if (!user) {
      return { success: false, error: "Invalid authentication token" };
    }

    const adminRef = adminDb.collection(COLLECTIONS.admins).doc(user.uid);
    const adminDoc = await adminRef.get();

    if (!adminDoc.exists) {
      return { success: false, error: "Not authorized as admin" };
    }

    const adminData = adminDoc.data()!;
    if (!adminData.isActive) {
      return { success: false, error: "Admin account is inactive" };
    }

    return {
      success: true,
      admin: {
        email: user.email,
        displayName: adminData.displayName,
        role: adminData.role,
        isActive: adminData.isActive,
      },
    };
  } catch {
    return { success: false, error: "Invalid authentication token" };
  }
}