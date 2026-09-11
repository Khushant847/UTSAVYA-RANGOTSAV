"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, Crosshair, Navigation } from "lucide-react";
import { EVENT } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const eventDate = new Date(EVENT.date);

export function EventDetailsSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${EVENT.venue.name}, ${EVENT.venue.address}`
  )}`;

  return (
    <section id="event-details" className="relative py-20 utsavya-gradient-light overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-2.jpg)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,18,51,0.92) 0%, rgba(20,18,51,0.6) 40%, rgba(20,18,51,0.92) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 mb-3">
            Event Details
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            A Night to Remember
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-purple-200/70">
            {EVENT.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-purple-500/20 bg-white/[0.04] p-8 text-center backdrop-blur-sm transition-transform hover:-translate-y-1">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <CalendarDays className="h-7 w-7 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-200/70">Date</h3>
            <p className="mt-2 font-display text-xl font-semibold text-white">
              {mounted
                ? eventDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : "October 17, 2026"}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-white/[0.04] p-8 text-center backdrop-blur-sm transition-transform hover:-translate-y-1">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Clock className="h-7 w-7 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-200/70">Time</h3>
            <p className="mt-2 font-display text-xl font-semibold text-white">{EVENT.time}</p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-white/[0.04] p-8 text-center backdrop-blur-sm transition-transform hover:-translate-y-1">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <MapPin className="h-7 w-7 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-200/70">Venue</h3>
            <p className="mt-2 font-display text-xl font-semibold text-white">{EVENT.venue.name}</p>
            <p className="mt-1 text-sm text-purple-200/70">{EVENT.venue.address}</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <Navigation className="h-4 w-4" />
              Get Directions
            </Button>
          </a>
        </div>

        <div className="mt-12 flex justify-center">
          <Crosshair className="h-8 w-8 text-amber-500/40 sparkle" />
        </div>
      </div>
    </section>
  );
}