"use server";

import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";
import { getAdminSession } from "@/lib/auth/admin";
import type { Query } from "firebase-admin/firestore";

export interface TicketLookup {
  id: string;
  name: string;
  email: string;
  mobile: string;
  bookingId: string;
  ticketId: string;
  passType: string;
  passPrice: number;
  allowedEntries: number;
  usedEntries: number;
  remainingEntries: number;
  qrToken: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentStatus: string;
  ticketStatus: string;
}

export async function getTicketByBookingId(bookingId: string): Promise<TicketLookup | null> {
  const ticketRef = adminDb.collection(COLLECTIONS.tickets).doc(bookingId);
  const ticketDoc = await ticketRef.get();

  if (!ticketDoc.exists) {
    return null;
  }

  const data = ticketDoc.data();
  if (!data) return null;

  // Sanitize Firestore Timestamps for Next.js serialization
  const sanitizedData = { ...data };
  for (const key in sanitizedData) {
    if (sanitizedData[key] && typeof sanitizedData[key] === "object" && "toDate" in sanitizedData[key]) {
      (sanitizedData as any)[key] = (sanitizedData[key] as any).toDate().toISOString();
    }
  }

  return { ...sanitizedData, id: ticketDoc.id } as TicketLookup;
}

export async function getTicketByQRToken(token: string) {
  const ticketsRef = adminDb.collection(COLLECTIONS.tickets);
  const snapshot = await ticketsRef.where("qrToken", "==", token).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  const sanitizedData = { ...data };
  for (const key in sanitizedData) {
    if (sanitizedData[key] && typeof sanitizedData[key] === "object" && "toDate" in sanitizedData[key]) {
      (sanitizedData as any)[key] = (sanitizedData[key] as any).toDate().toISOString();
    }
  }

  return { id: doc.id, ...sanitizedData };
}

export async function getTicketByOrderId(orderId: string) {
  const ticketsRef = adminDb.collection(COLLECTIONS.tickets);
  const snapshot = await ticketsRef.where("razorpayOrderId", "==", orderId).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  const sanitizedData = { ...data };
  for (const key in sanitizedData) {
    if (sanitizedData[key] && typeof sanitizedData[key] === "object" && "toDate" in sanitizedData[key]) {
      (sanitizedData as any)[key] = (sanitizedData[key] as any).toDate().toISOString();
    }
  }

  return { id: doc.id, ...sanitizedData };
}

export async function getTicketByPaymentId(paymentId: string) {
  const ticketsRef = adminDb.collection(COLLECTIONS.tickets);
  const snapshot = await ticketsRef.where("razorpayPaymentId", "==", paymentId).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  const sanitizedData = { ...data };
  for (const key in sanitizedData) {
    if (sanitizedData[key] && typeof sanitizedData[key] === "object" && "toDate" in sanitizedData[key]) {
      (sanitizedData as any)[key] = (sanitizedData[key] as any).toDate().toISOString();
    }
  }

  return { id: doc.id, ...sanitizedData };
}

export async function getAllTickets(search?: string, status?: string) {
  const admin = await getAdminSession();
  if (!admin) {
    throw new Error("Unauthorized: admin session required.");
  }

  let query: Query = adminDb.collection(COLLECTIONS.tickets);

  if (status && status !== "all") {
    if (status === "paid" || status === "pending" || status === "failed") {
      query = query.where("paymentStatus", "==", status);
    } else if (status === "used") {
      query = query.where("ticketStatus", "==", "used");
    } else if (status === "unused") {
      query = query.where("ticketStatus", "==", "active");
    }
  }

  const snapshot = await query.orderBy("createdAt", "desc").limit(100).get();

  let tickets = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Record<string, unknown>[];

  if (search) {
    const term = search.toLowerCase();
    const value = (field: unknown) =>
      typeof field === "string" ? field.toLowerCase() : "";
    tickets = tickets.filter((t) =>
      [t.name, t.email, t.mobile, t.bookingId, t.ticketId, t.razorpayPaymentId].some((field) =>
        value(field).includes(term)
      )
    );
  }

  return tickets.slice(0, 100);
}

export async function getScanLogs(limit = 100) {
  const admin = await getAdminSession();
  if (!admin) {
    throw new Error("Unauthorized: admin session required.");
  }

  const snapshot = await adminDb
    .collection(COLLECTIONS.scanLogs)
    .orderBy("scannedAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Record<string, unknown>[];
}

export async function exportTicketsToCSV() {
  const admin = await getAdminSession();
  if (!admin) {
    throw new Error("Unauthorized: admin session required.");
  }

  const snapshot = await adminDb.collection(COLLECTIONS.tickets).get();

  const headers = [
    "Booking ID",
    "Ticket ID",
    "Name",
    "Email",
    "Mobile",
    "Pass Type",
    "Amount",
    "Payment ID",
    "Payment Status",
    "Allowed Entries",
    "Used Entries",
    "Remaining Entries",
    "Created At",
    "Scanned At",
  ];

  const rows = snapshot.docs.map((doc) => {
    const t = doc.data();
    return [
      t.bookingId,
      t.ticketId,
      t.name,
      t.email,
      t.mobile,
      t.passType,
      (t.passPrice || 0) / 100,
      t.razorpayPaymentId,
      t.paymentStatus,
      t.allowedEntries,
      t.usedEntries,
      t.remainingEntries,
      t.createdAt?.toDate?.()?.toISOString() || "",
      t.scannedAt?.toDate?.()?.toISOString() || "",
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return csvContent;
}