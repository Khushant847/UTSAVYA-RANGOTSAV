import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";

export const runtime = "nodejs";

interface VerifyResponse {
  valid: boolean;
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

export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, reason: "Missing token" } satisfies VerifyResponse, {
        status: 400,
      });
    }

    const ticketsRef = adminDb.collection(COLLECTIONS.tickets);
    const snapshot = await ticketsRef.where("qrToken", "==", token).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ valid: false, reason: "Invalid ticket" } satisfies VerifyResponse, {
        status: 200,
      });
    }

    const ticket = snapshot.docs[0].data();

    if (ticket.paymentStatus !== "paid") {
      return NextResponse.json({
        valid: false,
        reason: "Payment not completed",
      } satisfies VerifyResponse, { status: 200 });
    }

    if (ticket.ticketStatus === "invalid") {
      return NextResponse.json({ valid: false, reason: "Ticket is invalid" } satisfies VerifyResponse, {
        status: 200,
      });
    }

    if (ticket.remainingEntries <= 0) {
      return NextResponse.json({
        valid: false,
        reason: "No remaining entries",
      } satisfies VerifyResponse, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      ticket: {
        bookingId: ticket.bookingId,
        ticketId: ticket.ticketId,
        name: ticket.name,
        passType: ticket.passType,
        allowedEntries: ticket.allowedEntries,
        usedEntries: ticket.usedEntries,
        remainingEntries: ticket.remainingEntries,
      },
    } satisfies VerifyResponse, { status: 200 });
  } catch (error) {
    console.error("Ticket verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}