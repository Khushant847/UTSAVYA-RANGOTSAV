import "server-only";
import { waitUntil } from "@vercel/functions";

export interface BookingRow {
  bookingId: string;
  ticketId: string;
  name: string;
  email: string;
  mobile: string;
  passType: string;
  amount: number;
  currency: string;
  allowedEntries: number;
  usedEntries: number;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: string;
}

async function doPush(data: BookingRow): Promise<void> {
  const url = process.env.SPREADSHEET_WEBHOOK_URL;
  if (!url) {
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    const text = await response.text();

    if (!response.ok || !text.includes('"ok"')) {
      console.error("[Spreadsheet] Sheet push rejected:", response.status, text);
    }
  } catch (error) {
    console.error("[Spreadsheet] Failed to push booking row:", error);
  } finally {
    clearTimeout(timer);
  }
}

export function pushBookingToSheet(data: BookingRow): void {
  waitUntil(doPush(data));
}