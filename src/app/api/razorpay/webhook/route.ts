import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";
import { sendTicketEmailForBooking } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (!payment) {
      return NextResponse.json({ ok: true });
    }

    const orderId = payment.order_id;

    // Idempotency check: find payment record by order id
    const paymentRef = adminDb.collection(COLLECTIONS.payments).doc(orderId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const paymentData = paymentDoc.data()!;
    const ticketsRef = adminDb.collection(COLLECTIONS.tickets);
    const ticketQuery = await ticketsRef.where("bookingId", "==", paymentData.bookingId).limit(1).get();

    if (ticketQuery.empty) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticketRef = ticketQuery.docs[0].ref;
    const ticketData = ticketQuery.docs[0].data();

    switch (event) {
      case "payment.captured": {
        // Avoid duplicate processing: if already captured, just acknowledge
        if (paymentData.status === "captured") {
          return NextResponse.json({ ok: true, duplicate: true });
        }

        await adminDb.runTransaction(async (transaction) => {
          transaction.update(ticketRef, {
            paymentStatus: "paid",
            razorpayPaymentId: payment.id,
            ticketStatus: "active",
            updatedAt: new Date(),
          });
          transaction.update(paymentRef, {
            razorpayPaymentId: payment.id,
            status: "captured",
            method: payment.method,
            updatedAt: new Date(),
          });
        });

        // Fire-and-forget email (non-blocking, idempotent)
        sendTicketEmailForBooking(ticketData.bookingId).catch(() => {});

        return NextResponse.json({ ok: true });
      }

      case "payment.failed": {
        console.log(`[Webhook] Payment failed for Order: ${orderId}`, {
          paymentId: payment.id,
          failureReason: payload.payload?.payment?.entity?.error || "Unknown reason",
          timestamp: new Date().toISOString(),
        });
        await adminDb.runTransaction(async (transaction) => {
          transaction.update(ticketRef, {
            paymentStatus: "failed",
            ticketStatus: "invalid",
            updatedAt: new Date(),
          });
          transaction.update(paymentRef, {
            status: "failed",
            updatedAt: new Date(),
          });
        });
        return NextResponse.json({ ok: true });
      }

      case "refund.processed":
      case "refund.created": {
        await adminDb.runTransaction(async (transaction) => {
          transaction.update(ticketRef, {
            paymentStatus: "refunded",
            ticketStatus: "invalid",
            updatedAt: new Date(),
          });
          transaction.update(paymentRef, {
            status: "refunded",
            updatedAt: new Date(),
          });
        });
        return NextResponse.json({ ok: true });
      }

      default:
        // Acknowledge all other events (payment.authorized etc.)
        return NextResponse.json({ ok: true });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}