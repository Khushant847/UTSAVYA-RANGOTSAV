"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmailVerificationCode(email: string) {
  if (!resend) {
    throw new Error("Email service not configured.");
  }

  // Generate a 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Store code in Firestore with an expiration (5 minutes)
    await adminDb.collection("email_verifications").doc(email).set({
      code,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send the email
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "UTSAVYA RANGOTSAV <onboarding@resend.dev>",
      to: email,
      subject: "Your Verification Code - UTSAVYA RANGOTSAV",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0b0a1f; color: white; border-radius: 10px; text-align: center;">
          <h2 style="color: #fbbf24;">Verification Code</h2>
          <p>Thank you for booking with UTSAVYA RANGOTSAV!</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #fcd34d; margin: 20px 0;">${code}</p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email. Please try again.");
  }
}

export async function verifyEmailCode(email: string, code: string) {
  try {
    const doc = await adminDb.collection("email_verifications").doc(email).get();

    if (!doc.exists) {
      throw new Error("No verification code requested for this email.");
    }

    const data = doc.data();
    if (!data || data.code !== code) {
      throw new Error("Invalid verification code.");
    }

    if (data.expiresAt.toDate() < new Date()) {
      throw new Error("Verification code has expired.");
    }

    // Clean up code after successful verification
    await adminDb.collection("email_verifications").doc(email).delete();

    return { success: true };
  } catch (error: unknown) {
    console.error("Error verifying email code:", error);
    const message = error instanceof Error ? error.message : "Verification failed.";
    throw new Error(message);
  }
}
