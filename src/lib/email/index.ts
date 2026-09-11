import "server-only";

import { Resend } from "resend";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, EVENT } from "@/lib/constants";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface TicketEmailData {
  name: string;
  email: string;
  bookingId: string;
  ticketId: string;
  passType: string;
  passPrice: number;
  allowedEntries: number;
  qrToken: string;
}

const passLabels: Record<string, string> = {
  single: "Single Pass",
  duo: "Duo Pass",
  family: "Family / Group Pass",
};

/**
 * Sends the confirmation email for a paid booking exactly once.
 * Guards against duplicate emails from the client-callback path and the
 * webhook path by tracking the `emailSent` flag on the ticket document.
 */
export async function sendTicketEmailForBooking(bookingId: string) {
  const ticketRef = adminDb.collection(COLLECTIONS.tickets).doc(bookingId);
  const ticketDoc = await ticketRef.get();

  if (!ticketDoc.exists) return;

  const ticket = ticketDoc.data()!;

  if (ticket.emailSent === true) return;
  if (ticket.paymentStatus !== "paid") return;

  await sendTicketConfirmation({
    name: ticket.name,
    email: ticket.email,
    bookingId: ticket.bookingId,
    ticketId: ticket.ticketId,
    passType: ticket.passType,
    passPrice: ticket.passPrice,
    allowedEntries: ticket.allowedEntries,
    qrToken: ticket.qrToken,
  });

  await ticketRef.update({ emailSent: true, updatedAt: new Date() });
}

export async function sendTicketConfirmation(data: TicketEmailData) {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured. Skipping email.");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const passLabel = passLabels[data.passType] || data.passType;
  const eventDate = new Date(EVENT.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0b0a1f;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0a1f;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b,#3b2470);padding:32px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:3px;color:#fcd34d;font-weight:bold;">UTSAVYA CELEBRATION</p>
              <h1 style="margin:8px 0 0;font-size:26px;color:#ffffff;letter-spacing:1px;">UTSAVYA <span style="color:#fbbf24;">RANGOTSAV</span></h1>
              <p style="margin:6px 0 0;font-size:13px;color:#c4b5fd;font-style:italic;">"Har Pal, Ek Utsav"</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#1e1b4b;">Your pass is confirmed! 🎉</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#4c4a6e;line-height:1.6;">
                Thank you for booking, ${data.name}! Your pass for <strong>UTSAVYA RANGOTSAV</strong> has been generated successfully.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;padding:8px;">
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:#4c4a6e;">Event</td>
                  <td style="padding:8px 16px;font-size:13px;font-weight:bold;color:#1e1b4b;text-align:right;">UTSAVYA RANGOTSAV</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:#4c4a6e;">Date</td>
                  <td style="padding:8px 16px;font-size:13px;font-weight:bold;color:#1e1b4b;text-align:right;">${eventDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:#4c4a6e;">Time</td>
                  <td style="padding:8px 16px;font-size:13px;font-weight:bold;color:#1e1b4b;text-align:right;">${EVENT.time}</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:#4c4a6e;">Venue</td>
                  <td style="padding:8px 16px;font-size:13px;font-weight:bold;color:#1e1b4b;text-align:right;">${EVENT.venue.name}, ${EVENT.venue.address}</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:#4c4a6e;">Guest Name</td>
                  <td style="padding:8px 16px;font-size:13px;font-weight:bold;color:#1e1b4b;text-align:right;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:#4c4a6e;">Pass Type</td>
                  <td style="padding:8px 16px;font-size:13px;font-weight:bold;color:#1e1b4b;text-align:right;">${passLabel}</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:#4c4a6e;">Entries</td>
                  <td style="padding:8px 16px;font-size:13px;font-weight:bold;color:#1e1b4b;text-align:right;">${data.allowedEntries}</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:#4c4a6e;">Booking ID</td>
                  <td style="padding:8px 16px;font-size:13px;font-weight:bold;color:#1e1b4b;text-align:right;">${data.bookingId}</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:#4c4a6e;">Ticket ID</td>
                  <td style="padding:8px 16px;font-size:13px;font-weight:bold;color:#1e1b4b;text-align:right;">${data.ticketId}</td>
                </tr>
              </table>

              <p style="margin:24px 0;font-size:13px;color:#4c4a6e;">Present your digital QR pass at the entrance for entry.</p>

              <a href="${appUrl}/ticket/${data.bookingId}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#0b0a1f;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:10px;">VIEW YOUR DIGITAL PASS</a>

              <p style="margin:24px 0 0;font-size:12px;color:#8a87aa;line-height:1.6;">
                Present this QR at the entrance. Each QR code can be used only once for entry.<br/>
                Keep this pass easily accessible on your phone for faster entry.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f3ff;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#4c4a6e;">© 2026 UTSAVYA CELEBRATION. All Rights Reserved.</p>
              <p style="margin:4px 0 0;font-size:11px;color:#8a87aa;">
                Instagram: @utsavya.celebration &nbsp;•&nbsp; ${EVENT.email}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "UTSAVYA RANGOTSAV <onboarding@resend.dev>",
      to: data.email,
      subject: "Your UTSAVYA RANGOTSAV Pass is Confirmed 🎉",
      html,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}