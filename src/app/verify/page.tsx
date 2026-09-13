import type { Metadata } from "next";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  CalendarDays,
  Users,
} from "lucide-react";
import { getTicketByQRToken } from "@/actions/ticket";
import { EVENT } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

const passLabels: Record<string, string> = {
  single: "Single Pass",
  duo: "Duo Pass",
  family: "Family / Group Pass",
};

const passBadges: Record<string, string | null> = {
  single: null,
  duo: "POPULAR",
  family: "BEST VALUE",
};

function formatEntryLabel(entries: number) {
  return entries === 1 ? "entry" : "entries";
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Pass Verify | ${EVENT.name}`,
    description: `Check your ${EVENT.name} pass details.`,
  };
}

interface VerifyTicket {
  name?: unknown;
  passType?: unknown;
  allowedEntries?: unknown;
  usedEntries?: unknown;
  remainingEntries?: unknown;
  paymentStatus?: unknown;
  ticketStatus?: unknown;
}

interface VerifyState {
  icon: "ok" | "bad" | "warn";
  label: string;
  message: string;
}

function resolveState(
  ticket: VerifyTicket | null
): VerifyState {
  if (!ticket) {
    return {
      icon: "bad",
      label: "Invalid Pass",
      message: "We couldn't find any pass for this QR code.",
    };
  }
  if (ticket.paymentStatus !== "paid") {
    return {
      icon: "warn",
      label: "Payment Pending",
      message: "This pass will activate once the payment is confirmed.",
    };
  }
  if (ticket.ticketStatus === "invalid") {
    return {
      icon: "bad",
      label: "Pass Cancelled",
      message: "This pass has been cancelled and is no longer valid.",
    };
  }
  if (Number(ticket.remainingEntries ?? 0) <= 0) {
    return {
      icon: "warn",
      label: "Fully Used",
      message: "All entries for this pass have been used.",
    };
  }
  return {
    icon: "ok",
    label: "Active",
    message: "This pass is ready to use for entry.",
  };
}

export default async function PassVerifyPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const ticket: VerifyTicket | null = token
    ? ((await getTicketByQRToken(token)) as VerifyTicket | null)
    : null;
  const state = resolveState(ticket);

  const passType = typeof ticket?.passType === "string" ? ticket.passType : "single";
  const allowed = Number(ticket?.allowedEntries ?? 1);
  const used = Math.min(Number(ticket?.usedEntries ?? 0), allowed);
  const remaining = Math.max(Number(ticket?.remainingEntries ?? allowed) , 0);
  const usedPct = Math.min(100, Math.round((used / allowed) * 100));

  const eventDate = new Date(EVENT.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const iconByState = {
    ok: <CheckCircle2 className="h-6 w-6" />,
    bad: <XCircle className="h-6 w-6" />,
    warn: <AlertTriangle className="h-6 w-6" />,
  };

  const stateStyles = {
    ok: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    bad: "bg-red-500/15 text-red-300 border-red-400/30",
    warn: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  };

  return (
    <div className="relative min-h-screen utsavya-gradient overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-1.jpg)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,10,31,0.72) 0%, rgba(11,10,31,0.3) 45%, rgba(11,10,31,0.12) 50%, rgba(11,10,31,0.3) 55%, rgba(11,10,31,0.72) 100%)",
        }}
      />
      <div className="absolute inset-0 mandala-pattern" />

      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-10">
        <div className="text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            {EVENT.tagline}
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-white">
            UTSAVYA <span className="text-amber-400">RANGOTSAV</span>
          </h1>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md">
          <div className={`flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 ${stateStyles[state.icon]}`}>
            <span className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
              {iconByState[state.icon]} {state.label}
            </span>
            <span className="text-[11px] font-medium opacity-80">
              {EVENT.date}
            </span>
          </div>

          <div className="space-y-5 px-5 py-6">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-purple-200/60">
                Guest
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-white">
                {typeof ticket?.name === "string" ? ticket.name : "—"}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/[0.05] px-4 py-3">
              <span className="text-sm text-purple-100/80">Pass</span>
              <span className="text-right">
                <span className="block text-sm font-semibold text-white">
                  {passLabels[passType] || passType}
                </span>
                {passBadges[passType] ? (
                  <span className="mt-0.5 block text-[10px] font-bold tracking-wide text-amber-400">
                    {passBadges[passType]}
                  </span>
                ) : null}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-purple-100/80">
                  <Users className="h-4 w-4" /> Entries
                </span>
                <span className="font-semibold text-white">
                  {remaining} {formatEntryLabel(remaining)} remaining
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-purple-400 transition-all"
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-purple-200/50">
                {used} of {allowed} {formatEntryLabel(allowed)} used
              </p>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="flex items-start gap-2 text-sm text-purple-100/80">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  {eventDate} <span className="text-purple-200/50">at {EVENT.time}</span>
                </span>
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm text-purple-100/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  {EVENT.venue.name}, <span className="text-purple-200/50">{EVENT.venue.address}</span>
                </span>
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm text-purple-100/80">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>{EVENT.time}</span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-purple-200/60">
          {state.message} Present this pass at the entrance on{" "}
          {eventDate}.
        </p>
      </main>
    </div>
  );
}