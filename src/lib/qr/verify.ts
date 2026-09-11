import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";

export async function verifyQRToken(token: string) {
  const ticketsRef = adminDb.collection(COLLECTIONS.tickets);
  const snapshot = await ticketsRef.where("qrToken", "==", token).limit(1).get();

  if (snapshot.empty) {
    return { valid: false, reason: "Invalid ticket" };
  }

  const ticketDoc = snapshot.docs[0];
  const ticket = ticketDoc.data();

  if (ticket.paymentStatus !== "paid") {
    return { valid: false, reason: "Payment not completed" };
  }

  if (ticket.ticketStatus === "invalid") {
    return { valid: false, reason: "Ticket is invalid" };
  }

  if (ticket.remainingEntries <= 0) {
    return { valid: false, reason: "No remaining entries" };
  }

  return {
    valid: true,
    ticket: {
      id: ticketDoc.id,
      ticketId: ticket.ticketId,
      bookingId: ticket.bookingId,
      name: ticket.name,
      passType: ticket.passType,
      allowedEntries: ticket.allowedEntries,
      usedEntries: ticket.usedEntries,
      remainingEntries: ticket.remainingEntries,
    },
  };
}

export async function consumeEntry(ticketId: string, scannedBy: string) {
  const ticketRef = adminDb.collection(COLLECTIONS.tickets).doc(ticketId);

  const result = await adminDb.runTransaction(async (transaction) => {
    const ticketDoc = await transaction.get(ticketRef);

    if (!ticketDoc.exists) {
      return { success: false, reason: "Ticket not found" };
    }

    const ticket = ticketDoc.data()!;

    if (ticket.remainingEntries <= 0) {
      return { success: false, reason: "No remaining entries" };
    }

    const newUsedEntries = ticket.usedEntries + 1;
    const newRemainingEntries = ticket.remainingEntries - 1;
    const newTicketStatus = newRemainingEntries === 0 ? "used" : "active";

    transaction.update(ticketRef, {
      usedEntries: newUsedEntries,
      remainingEntries: newRemainingEntries,
      ticketStatus: newTicketStatus,
      scannedAt: new Date(),
      updatedAt: new Date(),
    });

    const scanLogRef = adminDb.collection(COLLECTIONS.scanLogs).doc();
    transaction.set(scanLogRef, {
      ticketId: ticket.ticketId,
      bookingId: ticket.bookingId,
      name: ticket.name,
      passType: ticket.passType,
      scanResult: "success",
      entriesUsed: `${newUsedEntries}/${ticket.allowedEntries}`,
      scannedBy,
      scannedAt: new Date(),
    });

    return {
      success: true,
      name: ticket.name,
      passType: ticket.passType,
      allowedEntries: ticket.allowedEntries,
      usedEntries: newUsedEntries,
      remainingEntries: newRemainingEntries,
    };
  });

  return result;
}
