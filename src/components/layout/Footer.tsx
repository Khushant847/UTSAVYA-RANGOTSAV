import Link from "next/link";
import { Mail, MapPin, CalendarDays, Clock, Sparkles } from "lucide-react";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { EVENT } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-purple-500/15 bg-[#0b0a1f] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h3 className="font-display text-xl font-bold">
                <span className="text-gold-gradient">UTSAVYA</span>{" "}
                <span className="text-white">RANGOTSAV</span>
              </h3>
            </div>
            <p className="text-sm text-purple-200/70 italic">&quot;{EVENT.tagline}&quot;</p>
            <p className="mt-4 text-sm text-purple-200/60">
              A vibrant evening of Garba, Dandiya, music, entertainment, games, food, celebration
              and unforgettable festive moments.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber-300">
              Event Details
            </h4>
            <ul className="space-y-3 text-sm text-purple-200/70">
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-400" />
                17 October 2026
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                {EVENT.time}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-amber-400 mt-0.5" />
                <span>
                  {EVENT.venue.name}
                  <br />
                  {EVENT.venue.address}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber-300">
              Connect With Us
            </h4>
            <ul className="space-y-3 text-sm text-purple-200/70">
              <li>
                <a
                  href="https://www.instagram.com/utsavya.celebration"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-amber-300"
                >
                  <InstagramIcon className="h-4 w-4 text-amber-400" />
                  {EVENT.instagram}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EVENT.email}`}
                  className="flex items-center gap-2 transition-colors hover:text-amber-300"
                >
                  <Mail className="h-4 w-4 text-amber-400" />
                  {EVENT.email}
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/booking" className="text-sm font-semibold text-amber-300 underline-offset-4 hover:underline">
                Book Your Pass →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-purple-500/10 pt-6 text-center">
          <p className="text-xs text-purple-200/50">
            © 2026 {EVENT.organizer}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}