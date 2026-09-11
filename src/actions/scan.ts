"use server";

import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";
import { getAdminSession } from "@/lib/auth/admin";

export interface ScanResult {
  success: boolean;
  reason?: string;
  ticket?: {
    bookingId: string;
    ticketId: string;
    name: string;
    passType: string;
    allowedEntries: number;
    usedEntries: number;
    remainingEntries: number;
  };
}

export async function scanTicket(qrToken: string): Promise<ScanResult> {
  const admin = await getAdminSession();
  if (!admin) {
    return { success: false, reason: "Unauthorized: admin session required." };
  }
  const scannedBy = admin.email;

  if (!qrToken) {
    return { success: false, reason: "Missing QR token" };
  }

  const ticketsRef = adminDb.collection(COLLECTIONS.tickets);
  const snapshot = await ticketsRef.where("qrToken", "==", qrToken).limit(1).get();

  if (snapshot.empty) {
    return { success: false, reason: "Invalid ticket" };
  }

  const ticketDoc = snapshot.docs[0];
  const ticket = ticketDoc.data();

  if (ticket.paymentStatus !== "paid") {
    return { success: false, reason: "Payment not completed" };
  }

  if (ticket.ticketStatus === "invalid") {
    return { success: false, reason: "Ticket is invalid" };
  }

  if (ticket.remainingEntries <= 0) {
    return { success: false, reason: "Ticket already used" };
  }

  // Atomic transaction to consume entry
  const result = await adminDb.runTransaction(async (transaction) => {
    const freshDoc = await transaction.get(ticketDoc.ref);
    if (!freshDoc.exists) {
      return { success: false, reason: "Ticket not found" } as ScanResult;
    }

    const freshTicket = freshDoc.data()!;

    if (freshTicket.remainingEntries <= 0) {
      return {
        success: false,
        reason: `Ticket already used (${freshTicket.usedEntries}/${freshTicket.allowedEntries})`,
        ticket: {
          bookingId: freshTicket.bookingId,
          ticketId: freshTicket.ticketId,
          name: freshTicket.name,
          passType: freshTicket.passType,
          allowedEntries: freshTicket.allowedEntries,
          usedEntries: freshTicket.usedEntries,
          remainingEntries: freshTicket.remainingEntries,
        },
      } as ScanResult;
    }

    const newUsed = freshTicket.usedEntries + 1;
    const newRemaining = freshTicket.remainingEntries - 1;

    transaction.update(freshDoc.ref, {
      usedEntries: newUsed,
      remainingEntries: newRemaining,
      ticketStatus: newRemaining === 0 ? "used" : "active",
      scannedAt: new Date(),
      updatedAt: new Date(),
    });

    // Log scan
    const scanLogRef = adminDb.collection(COLLECTIONS.scanLogs).doc();
    transaction.set(scanLogRef, {
      ticketId: freshTicket.ticketId,
      bookingId: freshTicket.bookingId,
      name: freshTicket.name,
      passType: freshTicket.passType,
      scanResult: "success",
      entriesUsed: `${newUsed}/${freshTicket.allowedEntries}`,
      scannedBy,
      scannedAt: new Date(),
    });

    return {
      success: true,
      ticket: {
        bookingId: freshTicket.bookingId,
        ticketId: freshTicket.ticketId,
        name: freshTicket.name,
        passType: freshTicket.passType,
        allowedEntries: freshTicket.allowedEntries,
        usedEntries: newUsed,
        remainingEntries: newRemaining,
      },
    } as ScanResult;
  });

  return result;
}