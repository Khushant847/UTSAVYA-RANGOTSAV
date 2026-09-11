import Link from "next/link";
import { Users, Check, Crown, Star, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PASS_TYPES, PassTypeId } from "@/lib/constants";

const passMeta: Record<
  PassTypeId,
  { icon: typeof Users; highlight: string; copy: string; features: string[] }
> = {
  single: {
    icon: Users,
    highlight: "",
    copy: "Perfect for solo attendees who want to experience the full festive night.",
    features: ["Full event access", "Garba, Dandiya & music", "Games & entertainment", "Food & refreshments"],
  },
  duo: {
    icon: Users,
    highlight: "MOST POPULAR",
    copy: "Ideal for couples and pairs sharing a memorable festive evening together.",
    features: ["2 people entry", "Full event access", "Garba, Dandiya & music", "Games & entertainment"],
  },
  family: {
    icon: Users,
    highlight: "BEST VALUE",
    copy: "Great for family and friends groups looking to celebrate together.",
    features: ["5 people entry", "Full event access", "Garba, Dandiya & music", "All activities & games"],
  },
};

export function PricingSection() {
  return (
    <section id="book" className="relative py-20 utsavya-gradient-light overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-4.jpg)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,18,51,0.55) 0%, rgba(20,18,51,0.15) 45%, rgba(20,18,51,0.05) 50%, rgba(20,18,51,0.15) 55%, rgba(20,18,51,0.55) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 mb-3">
            Grab Your Pass
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Choose Your <span className="text-gold-gradient">Pass</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-purple-200/70">
            Secure your entry for a night of Garba, Dandiya and celebration. Each pass includes
            full access to all experiences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(PASS_TYPES) as PassTypeId[]).map((key) => {
            const pass = PASS_TYPES[key];
            const meta = passMeta[key];
            const isPopular = key === "duo";

            return (
              <div
                key={key}
                className={`relative flex flex-col rounded-3xl border p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 ${
                  isPopular
                    ? "border-amber-400/50 bg-gradient-to-b from-amber-500/[0.12] to-transparent shadow-2xl shadow-amber-500/10"
                    : "border-purple-500/25 bg-white/[0.04] hover:border-purple-400/40"
                }`}
              >
                {meta.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                      {isPopular ? <Crown className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
                      {meta.highlight}
                    </span>
                  </div>
                )}

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20">
                    <meta.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{pass.name}</h3>
                </div>

                <div className="mb-6">
                  <span className="text-sm text-purple-200/70">From</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-black text-gold-gradient">
                      {mounted
                        ? `₹${(pass.price / 100).toLocaleString("en-IN")}`
                        : `₹${pass.price / 100}`}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-purple-200/70">{pass.label}</p>
                </div>

                <p className="mb-6 text-sm text-purple-200/60">{meta.copy}</p>

                <ul className="mb-8 space-y-2.5">
                  {meta.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-purple-100/80">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link href="/booking" className="block">
                    <Button className="w-full" variant={isPopular ? "gold" : "default"}>
                      <Star className="h-4 w-4" />
                      SELECT PASS
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-purple-200/50">
          Payment gateway charges, if applicable, will be shown at checkout. Passes are
          non-refundable and valid only for the event date.
        </p>
      </div>
    </section>
  );
}