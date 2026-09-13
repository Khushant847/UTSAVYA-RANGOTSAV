import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTicketByBookingId, TicketLookup } from "@/actions/ticket";
import { TicketCard, TicketData } from "@/components/ticket/TicketCard";
import { EVENT } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

function toTicketData(ticket: TicketLookup): TicketData {
  return ticket;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bookingId } = await params;
  const ticket = await getTicketByBookingId(bookingId);
  if (!ticket) {
    return { title: "Ticket Not Found" };
  }
  return {
    title: `Your ${EVENT.name} Pass | ${ticket.name}`,
    description: "View your digital pass for UTSAVYA RANGOTSAV.",
  };
}

export default async function TicketPage({ params }: PageProps) {
  const { bookingId } = await params;
  const ticket = await getTicketByBookingId(bookingId);

  if (!ticket) notFound();

  if (ticket.paymentStatus !== "paid") {
    return (
      <div className="relative min-h-screen utsavya-gradient pt-24 pb-16">
        <div className="absolute inset-0 mandala-pattern" />
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <h1 className="font-display text-2xl font-bold text-white">Payment Pending</h1>
          <p className="mt-4 text-purple-200/70">
            Your payment for this booking is not yet confirmed. Please complete the payment to access your digital pass.
          </p>
        </div>
      </div>
    );
  }

  const qrUrl = ticket.qrToken
    ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ticket/verify?token=${ticket.qrToken}`
    : "";

  return (
    <div className="relative min-h-screen utsavya-gradient pt-24 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-1.jpg)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,10,31,0.65) 0%, rgba(11,10,31,0.25) 42%, rgba(11,10,31,0.1) 50%, rgba(11,10,31,0.25) 58%, rgba(11,10,31,0.65) 100%)",
        }}
      />
      <div className="absolute inset-0 mandala-pattern" />
      <div className="relative z-10 mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-white">Your Digital Pass</h1>
          <p className="mt-1 text-sm text-purple-200/70">
            Present this pass at the {EVENT.name} entrance on{" "}
            October 17, 2026.
          </p>
        </div>
        <TicketCard ticket={toTicketData(ticket)} qrUrl={qrUrl} />
      </div>
    </div>
  );
}