import { Timestamp } from "firebase-admin/firestore";

export interface Ticket {
  ticketId: string;
  bookingId: string;
  name: string;
  email: string;
  mobile: string;
  passType: "single" | "duo" | "family";
  passPrice: number;
  allowedEntries: number;
  usedEntries: number;
  remainingEntries: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  qrToken: string;
  ticketStatus: "active" | "used" | "invalid";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  scannedAt: Timestamp | null;
}

export interface Payment {
  bookingId: string;
  ticketId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  amount: number;
  currency: string;
  status: "created" | "captured" | "failed" | "refunded";
  method: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ScanLog {
  ticketId: string;
  bookingId: string;
  name: string;
  passType: string;
  scanResult: "success" | "already_used" | "invalid_ticket" | "no_remaining_entries";
  entriesUsed: string;
  scannedBy: string;
  scannedAt: Timestamp;
}

export interface Admin {
  email: string;
  displayName: string;
  role: "super_admin" | "scanner" | "viewer";
  isActive: boolean;
  createdAt: Timestamp;
}
