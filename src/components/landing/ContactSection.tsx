import Image from "next/image";
import { Mail, ShieldCheck } from "lucide-react";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { EVENT } from "@/lib/constants";

const TERMS = [
  "Passes are valid only for UTSAVYA RANGOTSAV on 17 October 2026.",
  "Each pass/QR is subject to the number of entries purchased.",
  "QR codes are verified at entry.",
  "Once all allocated entries are used, the ticket cannot be reused.",
  "Screenshots/duplicate copies of an already-used QR will not permit additional entry.",
  "Entry is subject to event rules and organizer verification.",
  "Keep the QR pass available on your phone for faster entry.",
];

export function ContactSection() {
  return (
    <section id="contact" className="relative overflow-hidden py-20 utsavya-gradient">
      <div className="absolute inset-0 mandala-pattern" />
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/ornament.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-contain opacity-20"
        />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 mb-3">
              Terms & Conditions
            </p>
            <h2 className="font-display text-3xl font-bold text-white mb-6">Good to Know</h2>
            <ul className="space-y-3">
              {TERMS.map((term, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-purple-200/70">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  {term}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 mb-3">
              Contact
            </p>
            <h2 className="font-display text-3xl font-bold text-white mb-6">Get in Touch</h2>
            <p className="mb-8 text-purple-200/70">
              Questions about your booking or the event? Reach out to us and we will be happy to
              help.
            </p>

            <div className="space-y-4">
              <a
                href="https://www.instagram.com/utsavya.celebration"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-purple-500/20 bg-white/[0.04] p-5 transition-colors hover:border-amber-400/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <InstagramIcon className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-xs text-purple-200/60">Instagram</p>
                  <p className="font-semibold text-white">{EVENT.instagram}</p>
                </div>
              </a>

              <a
                href={`mailto:${EVENT.email}`}
                className="flex items-center gap-4 rounded-2xl border border-purple-500/20 bg-white/[0.04] p-5 transition-colors hover:border-amber-400/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-purple-200/60">Email</p>
                  <p className="font-semibold text-white">{EVENT.email}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}