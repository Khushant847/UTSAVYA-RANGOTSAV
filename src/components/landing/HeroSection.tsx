import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/constants";

const eventDate = new Date(EVENT.date);

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden utsavya-gradient">
      {/* Decorative background elements */}
      <div className="absolute inset-0 mandala-pattern" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl float" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/3 left-[10%] h-3 w-3 rounded-full bg-amber-400 sparkle" />
      <div className="absolute top-1/4 right-[15%] h-2 w-2 rounded-full bg-purple-300 sparkle" style={{ animationDelay: "0.6s" }} />
      <div className="absolute bottom-1/3 left-[20%] h-2 w-2 rounded-full bg-amber-200 sparkle" style={{ animationDelay: "1.2s" }} />
      <div className="absolute bottom-1/4 right-[25%] h-3 w-3 rounded-full bg-fuchsia-400 sparkle" style={{ animationDelay: "1.8s" }} />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center pt-24 pb-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/10 px-4 py-1.5 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200">
            Presented by {EVENT.organizer}
          </span>
        </div>

        <h1 className="font-display text-5xl font-black leading-tight sm:text-6xl md:text-8xl">
          <span className="text-gold-gradient glow-gold">UTSAVYA</span>
          <br />
          <span className="text-white drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]">RANGOTSAV</span>
        </h1>

        <p className="mt-5 font-display text-lg italic text-amber-200/90 sm:text-xl md:text-2xl">
          &quot;{EVENT.tagline}&quot;
        </p>

        <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-purple-200/80 sm:text-base">
          Dandiya Night • Garba • Music • Games • Entertainment
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <div className="flex items-center gap-3 rounded-xl border border-purple-400/20 bg-white/[0.05] px-6 py-3 backdrop-blur-sm">
            <CalendarDays className="h-5 w-5 text-amber-400" />
            <div className="text-left">
              <p className="text-sm text-purple-200/70">Date</p>
              <p className="font-semibold text-white">
                {mounted
                  ? eventDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                  : "October 17, 2026"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-purple-400/20 bg-white/[0.05] px-6 py-3 backdrop-blur-sm">
            <Clock className="h-5 w-5 text-amber-400" />
            <div className="text-left">
              <p className="text-sm text-purple-200/70">Time</p>
              <p className="font-semibold text-white">{EVENT.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-purple-400/20 bg-white/[0.05] px-6 py-3 backdrop-blur-sm">
            <MapPin className="h-5 w-5 text-amber-400" />
            <div className="text-left">
              <p className="text-sm text-purple-200/70">Venue</p>
              <p className="font-semibold text-white">
                {EVENT.venue.name}, {EVENT.venue.address}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/booking">
            <Button size="lg" className="glow-pulse w-full sm:w-auto text-base">
              GET YOUR PASS
            </Button>
          </Link>
          <a href="#event-details">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
              VIEW EVENT DETAILS
            </Button>
          </a>
        </div>
      </div>

      <a
        href="#event-details"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-purple-200/60 hover:text-amber-300 transition-colors"
        aria-label="Scroll to event details"
      >
        <ChevronDown className="h-6 w-6 float" />
      </a>
    </section>
  );
}