"use client";

import { useEffect, useState } from "react";
import {
  Ticket as TicketIcon,
  Users,
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { getAdminStats } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Stats {
  totalBookings: number;
  totalPaidEntries: number;
  totalRevenue: number;
  entriesUsed: number;
  entriesRemaining: number;
  failedPayments: number;
}

const STAT_CARDS: {
  key: keyof Stats;
  label: string;
  icon: typeof TicketIcon;
  format?: (value: number) => string;
  accent: string;
}[] = [
  {
    key: "totalBookings",
    label: "TOTAL PASSES SOLD",
    icon: TicketIcon,
    accent: "text-amber-400",
  },
  {
    key: "totalPaidEntries",
    label: "TOTAL ENTRIES SOLD",
    icon: Users,
    accent: "text-purple-300",
  },
  {
    key: "totalRevenue",
    label: "TOTAL REVENUE",
    icon: IndianRupee,
    format: (v) => formatPrice(v),
    accent: "text-emerald-400",
  },
  {
    key: "entriesUsed",
    label: "ENTRIES USED",
    icon: CheckCircle2,
    accent: "text-blue-300",
  },
  {
    key: "entriesRemaining",
    label: "ENTRIES REMAINING",
    icon: Clock,
    accent: "text-orange-300",
  },
  {
    key: "failedPayments",
    label: "FAILED PAYMENTS",
    icon: XCircle,
    accent: "text-red-400",
  },
];

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await getAdminStats();
        if (active) {
          setStats(data);
          setLastUpdated(new Date());
        }
      } catch {
        // keep previous stats on error
      }
    };

    load();
    const interval = setInterval(load, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const peopleStillExpected = stats
    ? stats.totalPaidEntries - stats.entriesUsed
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-purple-200/60">
            Live event statistics • Updated{" "}
            {mounted && stats ? lastUpdated.toLocaleTimeString("en-IN") : "..."}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          LIVE
        </div>
      </div>

      {/* Live event counters */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-purple-500/20 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
              <TicketIcon className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-purple-200/60">TOTAL BOOKINGS</p>
              <p className="font-display text-2xl font-bold text-white transition-all">
                {stats?.totalBookings ?? "..."}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15">
              <Users className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <p className="text-xs text-purple-200/60">TOTAL PEOPLE EXPECTED</p>
              <p className="font-display text-2xl font-bold text-white">
                {stats?.totalPaidEntries ?? "..."}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-purple-200/60">TOTAL PEOPLE ENTERED</p>
              <p className="font-display text-2xl font-bold text-white">
                {stats?.entriesUsed ?? "..."}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15">
              <Clock className="h-5 w-5 text-orange-300" />
            </div>
            <div>
              <p className="text-xs text-purple-200/60">PEOPLE STILL EXPECTED</p>
              <p className="font-display text-2xl font-bold text-white">{peopleStillExpected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const value = stats ? stats[card.key] : null;
          return (
            <div
              key={card.key}
              className={cn(
                "rounded-2xl border border-purple-500/20 bg-white/[0.04] p-5 transition-all",
                value !== null && "hover:border-purple-400/40 hover:bg-white/[0.06]"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-200/50">
                  {card.label}
                </p>
                <card.icon className={cn("h-5 w-5", card.accent)} />
              </div>
              <p className="mt-2 font-display text-3xl font-black text-white">
                {mounted && (value === null ? "..." : card.format ? card.format(value) : value.toLocaleString("en-IN"))}
                {!mounted && (value === null ? "..." : card.format ? card.format(value) : value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-purple-500/15 bg-purple-500/[0.05] p-4 text-sm text-purple-200/70">
        <TrendingUp className="h-4 w-4 text-emerald-400" />
        Dashboard updates every 8 seconds with the latest event statistics.
      </div>
    </div>
  );
}
