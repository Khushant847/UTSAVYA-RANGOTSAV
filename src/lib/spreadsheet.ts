import "server-only";

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

export async function pushBookingToSheet(data: BookingRow): Promise<void> {
  const url = process.env.SPREADSHEET_WEBHOOK_URL;
  if (!url) {
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (error) {
    console.error("[Spreadsheet] Failed to push booking row:", error);
  }
}