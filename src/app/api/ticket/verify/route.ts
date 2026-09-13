import { NextRequest, NextResponse } from "next/server";

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
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, reason: "Missing token" } satisfies VerifyResponse, {
      status: 400,
    });
  }

  // Old QR codes pointed here; forward them to the public pass-verify page
  // so scanning never leads to a dead end.
  return NextResponse.redirect(new URL(`/verify?token=${encodeURIComponent(token)}`, request.url), 307);
}