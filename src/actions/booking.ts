"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getRazorpay } from "@/lib/razorpay/client";
import { generateBookingId, generateTicketId, generateQRToken } from "@/lib/utils/ids";
import { COLLECTIONS, PASS_TYPES, PassTypeId } from "@/lib/constants";
import { sendTicketEmailForBooking } from "@/lib/email";
import { pushBookingToSheet } from "@/lib/spreadsheet";
import { z } from "zod";

const CreateOrderSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  mobile: z.string().regex(/^[0-9]{10}$/, "Invalid mobile number"),
  passType: z.string(),
});

interface CreateOrderInput {
  name: string;
  email: string;
  mobile: string;
  passType: PassTypeId;
}

export async function createRazorpayOrder(input: CreateOrderInput) {
  // 1. Validate Input
  const validation = CreateOrderSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const pass = PASS_TYPES[input.passType];
  if (!pass) {
    throw new Error("Invalid pass type selected.");
  }

  const bookingId = generateBookingId();
  const ticketId = generateTicketId();
  const qrToken = generateQRToken();

  // 2. Check for existing bookings (Removed restriction to allow multiple bookings per mobile number)
  // The previous check that prevented multiple bookings for the same mobile number has been removed.

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Razorpay key not configured. Check your environment variables.");
  }

  // 3. Create Razorpay Order FIRST
  // This ensures we don't create Firestore records if the payment gateway is down
  let order;
  try {
    order = await getRazorpay().orders.create({
      amount: pass.price,
      currency: "INR",
      receipt: bookingId,
      notes: {
        ticketId,
        passType: input.passType,
      },
    });
  } catch (error) {
    console.error("[Razorpay] Order creation failed:", error);
    throw new Error("Failed to initiate payment with Razorpay. Please try again.");
  }

  // 4. Now save to Firestore
  const ticketRef = adminDb.collection(COLLECTIONS.tickets).doc(bookingId);
  await ticketRef.set({
    ticketId,
    bookingId,
    name: input.name,
    email: input.email,
    mobile: input.mobile,
    passType: input.passType,
    passPrice: pass.price,
    allowedEntries: pass.entries,
    usedEntries: 0,
    remainingEntries: pass.entries,
    razorpayOrderId: order.id,
    razorpayPaymentId: "",
    paymentStatus: "pending",
    qrToken,
    ticketStatus: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    scannedAt: null,
  });

  const paymentRef = adminDb.collection(COLLECTIONS.payments).doc(order.id);
  await paymentRef.set({
    bookingId,
    ticketId,
    razorpayOrderId: order.id,
    razorpayPaymentId: null,
    razorpaySignature: null,
    amount: pass.price,
    currency: "INR",
    status: "created",
    method: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    orderId: order.id,
    amount: pass.price,
    currency: "INR",
    keyId,
    bookingId,
    ticketId,
  };
}

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
) {
  try {
    const { verifyRazorpayPayment } = await import("@/lib/razorpay/client");
    const isValid = verifyRazorpayPayment(orderId, paymentId, signature);

    if (!isValid) {
      return { success: false, error: "Invalid payment signature" };
    }

    const paymentRef = adminDb.collection(COLLECTIONS.payments).doc(orderId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return { success: false, error: "Payment record not found" };
    }

    const paymentData = paymentDoc.data()!;
    const ticketRef = adminDb.collection(COLLECTIONS.tickets).doc(paymentData.bookingId);

    const finalTicketData = await adminDb.runTransaction(async (transaction) => {
      const ticketDoc = await transaction.get(ticketRef);
      if (!ticketDoc.exists) throw new Error("Ticket not found");

      transaction.update(ticketRef, {
        paymentStatus: "paid",
        razorpayPaymentId: paymentId,
        updatedAt: new Date(),
      });

      transaction.update(paymentRef, {
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        status: "captured",
        updatedAt: new Date(),
      });

      return ticketDoc.data();
    });

    if (!finalTicketData) {
      return { success: false, error: "Failed to update ticket" };
    }

    // Send confirmation email (idempotent - webhook may also trigger this)
    sendTicketEmailForBooking(finalTicketData.bookingId).catch((err) =>
      console.error(`[Email] Failed to send confirmation for ${finalTicketData.bookingId}:`, err)
    );

    // Log booking to Google Sheet (fire-and-forget via waitUntil)
    pushBookingToSheet({
      bookingId: finalTicketData.bookingId,
      ticketId: finalTicketData.ticketId,
      name: finalTicketData.name,
      email: finalTicketData.email,
      mobile: finalTicketData.mobile,
      passType: finalTicketData.passType,
      amount: finalTicketData.passPrice,
      currency: "INR",
      allowedEntries: finalTicketData.allowedEntries,
      usedEntries: finalTicketData.usedEntries,
      status: "paid",
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      bookingId: finalTicketData.bookingId,
      ticketId: finalTicketData.ticketId,
      qrToken: finalTicketData.qrToken,
    };
  } catch (error) {
    console.error("[Payment] Verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An internal error occurred during payment verification"
    };
  }
}

export async function markPaymentFailed(orderId: string) {
  const paymentRef = adminDb.collection(COLLECTIONS.payments).doc(orderId);
  const paymentDoc = await paymentRef.get();

  if (paymentDoc.exists) {
    const paymentData = paymentDoc.data()!;
    const ticketRef = adminDb.collection(COLLECTIONS.tickets).doc(paymentData.bookingId);

    await ticketRef.update({
      paymentStatus: "failed",
      ticketStatus: "invalid",
      updatedAt: new Date(),
    });

    await paymentRef.update({
      status: "failed",
      updatedAt: new Date(),
    });

    const ticketDoc = await ticketRef.get();
    const td = ticketDoc.exists ? ticketDoc.data() : null;
    if (td) {
      pushBookingToSheet({
        bookingId: td.bookingId,
        ticketId: td.ticketId,
        name: td.name,
        email: td.email,
        mobile: td.mobile,
        passType: td.passType,
        amount: td.passPrice,
        currency: "INR",
        allowedEntries: td.allowedEntries,
        usedEntries: td.usedEntries,
        status: "failed",
        razorpayOrderId: orderId,
        razorpayPaymentId: "",
        createdAt: new Date().toISOString(),
      });
    }
  }

  return { success: true };
}
