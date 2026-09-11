import {
  Music,
  Mic,
  Gamepad2,
  PartyPopper,
  UtensilsCrossed,
  Camera,
  Sparkles,
  Heart,
} from "lucide-react";

const EXPERIENCES = [
  {
    icon: Music,
    title: "Garba & Dandiya",
    description: "Traditional Garba and high-intensity Dandiya with live dhol rhythms.",
  },
  {
    icon: Mic,
    title: "Music & Dance",
    description: "Live DJ, festive playlists and dance performances that keep the energy high.",
  },
  {
    icon: Gamepad2,
    title: "Games & Activities",
    description: "Fun-filled games and activities with exciting prizes for everyone.",
  },
  {
    icon: PartyPopper,
    title: "Entertainment",
    description: "Live hosts, performances and engaging entertainment all evening long.",
  },
  {
    icon: UtensilsCrossed,
    title: "Food & Refreshments",
    description: "Delicious festive food and refreshments to keep you energized.",
  },
  {
    icon: Camera,
    title: "Festive Photo Moments",
    description: "Insta-worthy photo corners and props to capture your best festive avatars.",
  },
  {
    icon: Sparkles,
    title: "Celebrations & Surprises",
    description: "Special surprises and celebratory moments crafted throughout the night.",
  },
];

export function WhatToExpectSection() {
  return (
    <section id="what-to-expect" className="relative py-20 utsavya-gradient overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-3.jpg)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,10,31,0.94) 0%, rgba(11,10,31,0.6) 40%, rgba(11,10,31,0.94) 100%)",
        }}
      />
      <div className="absolute inset-0 mandala-pattern" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 mb-3">
            What to Expect
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            An Evening Full of <span className="text-gold-gradient">Festive Magic</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-purple-200/70">
            Come dressed in your favourite festive outfit and get ready to dance, celebrate and
            make memories!
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCES.map((item, index) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-purple-500/20 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/40 hover:bg-white/[0.07]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 transition-transform group-hover:scale-110">
                <item.icon className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-purple-200/70">{item.description}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-dashed border-amber-400/40 bg-amber-500/[0.05] p-6 backdrop-blur-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30">
              <Heart className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-white">Unforgettable Moments</h3>
            <p className="text-sm text-amber-100/80">
              Every corner of the evening is designed to create beautiful memories you will
              cherish forever.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}