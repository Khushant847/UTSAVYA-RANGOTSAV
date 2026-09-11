"use client";

import { formatPrice } from "@/lib/utils";
import { EVENT } from "@/lib/constants";
import { QRCodeDisplay } from "@/components/ticket/QRCodeDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TicketData {
  bookingId: string;
  ticketId: string;
  name: string;
  email: string;
  passType: string;
  passPrice: number;
  allowedEntries: number;
  usedEntries: number;
  remainingEntries: number;
  qrToken: string;
  paymentStatus: string;
  ticketStatus: string;
}

interface TicketCardProps {
  ticket: TicketData;
  qrUrl: string;
  showStatus?: boolean;
  className?: string;
}

const passLabels: Record<string, string> = {
  single: "SINGLE PASS",
  duo: "DUO PASS",
  family: "FAMILY / GROUP PASS",
};

export function TicketCard({ ticket, qrUrl, showStatus = true, className }: TicketCardProps) {
  const issuerIsValid = ticket.paymentStatus === "paid";

  return (
    <div className={cn("mx-auto max-w-md overflow-hidden rounded-3xl bg-white text-[#0b0a1f]", className)}>
      {/* Ticket header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#3b2470] to-[#1e1b4b] px-6 py-6 text-center">
        <div className="absolute inset-0 mandala-pattern opacity-30" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">
            {EVENT.organizer}
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-white">
            UTSAVYA <span className="text-amber-400">RANGOTSAV</span>
          </h2>
          <p className="mt-1 text-xs italic text-purple-200">&quot;Har Pal, Ek Utsav&quot;</p>
        </div>
      </div>

      {/* Perforated divider */}
      <div className="relative h-0">
        <div className="absolute left-0 right-0 -top-px flex items-center">
          <div className="h-px flex-1 border-t-2 border-dashed border-purple-200" />
        </div>
      </div>

      {/* Ticket body */}
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 space-y-3 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Guest Name</p>
            <p className="font-display text-lg font-bold">{ticket.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Pass</p>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {passLabels[ticket.passType] || ticket.passType.toUpperCase()}
            </Badge>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Entries</p>
            <p className="font-semibold">
              {ticket.allowedEntries} {ticket.allowedEntries === 1 ? "person" : "people"}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Booking ID</p>
              <p className="text-sm font-semibold">{ticket.bookingId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Ticket ID</p>
              <p className="text-sm font-semibold">{ticket.ticketId}</p>
            </div>
          </div>
          <div className="pt-1 text-[12px] text-slate-500">
            <p>
              <span className="font-semibold text-slate-700">
                {new Date(EVENT.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                • {EVENT.time}
              </span>
            </p>
            <p className="mt-0.5">
              {EVENT.venue.name}, {EVENT.venue.address}
            </p>
          </div>
        </div>

        {/* QR section */}
        <div className="flex flex-col items-center justify-center border-t-2 border-dashed border-purple-200 bg-purple-50/50 px-6 py-5 sm:border-l-2 sm:border-t-0">
          <QRCodeDisplay value={qrUrl} size={160} />
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-purple-600">
            Scan at entrance
          </p>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-purple-100 px-6 py-3 text-center">
        {showStatus && (
          <div className="mb-1 flex items-center justify-center gap-2">
            {issuerIsValid ? (
              <Badge variant="success">VALID</Badge>
            ) : (
              <Badge variant="error">NOT PAID</Badge>
            )}
            {ticket.remainingEntries !== undefined && ticket.remainingEntries < ticket.allowedEntries && (
              <Badge variant="warning">
                {ticket.usedEntries}/{ticket.allowedEntries} used
              </Badge>
            )}
          </div>
        )}
        <p className="text-[11px] text-slate-500">
          Present this QR code at the entrance. Each QR code can be used only once for entry.
        </p>
        <p className="mt-0.5 text-[10px] text-slate-400">
          Amount paid: {formatPrice(ticket.passPrice)}
        </p>
      </div>
    </div>
  );
}