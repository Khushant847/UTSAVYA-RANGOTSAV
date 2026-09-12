"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getRazorpay } from "@/lib/razorpay/client";
import { generateBookingId, generateTicketId, generateQRToken } from "@/lib/utils/ids";
import { COLLECTIONS, PASS_TYPES, PassTypeId } from "@/lib/constants";
import { sendTicketEmailForBooking } from "@/lib/email";

interface CreateOrderInput {
  name: string;
  email: string;
  mobile: string;
  passType: PassTypeId;
}

export async function createRazorpayOrder(input: CreateOrderInput) {
  const pass = PASS_TYPES[input.passType];
  const bookingId = generateBookingId();
  const ticketId = generateTicketId();
  const qrToken = generateQRToken();

  // Check if this phone number has already been used for a booking
  const existingTickets = await adminDb
    .collection(COLLECTIONS.tickets)
    .where("mobile", "==", input.mobile)
    .get();

  if (!existingTickets.empty) {
    const ticket = existingTickets.docs[0].data();
    if (ticket.paymentStatus === "paid") {
      throw new Error("This phone number has already been used for a confirmed booking.");
    }
    if (ticket.paymentStatus === "pending") {
      const createdAt = ticket.createdAt.toDate ? ticket.createdAt.toDate() : new Date(ticket.createdAt);
      const diffInMinutes = (new Date().getTime() - createdAt.getTime()) / (1000 * 60);

      if (diffInMinutes < 2) {
        throw new Error("A booking is already in progress for this phone number. Please complete it or try again later.");
      }
      // If the pending booking is older than 2 minutes, we allow a new attempt
    }
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Razorpay key not configured. Check your environment variables.");
  }

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
    razorpayOrderId: "",
    razorpayPaymentId: "",
    paymentStatus: "pending",
    qrToken,
    ticketStatus: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    scannedAt: null,
  });

  const order = await getRazorpay().orders.create({
    amount: pass.price,
    currency: "INR",
    receipt: bookingId,
    notes: {
      ticketId,
      passType: input.passType,
    },
  });

  await ticketRef.update({ razorpayOrderId: order.id });

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

  await adminDb.runTransaction(async (transaction) => {
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
  });

  const ticketDoc = await ticketRef.get();
  const ticketData = ticketDoc.data()!;

  // Send confirmation email (idempotent - webhook may also trigger this)
  sendTicketEmailForBooking(ticketData.bookingId).catch(() => {});

  return {
    success: true,
    bookingId: ticketData.bookingId,
    ticketId: ticketData.ticketId,
    qrToken: ticketData.qrToken,
  };
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
  }

  return { success: true };
}
