"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Users, Crown, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PASS_TYPES, PassTypeId } from "@/lib/constants";
import { useBookingStore } from "@/stores/booking-store";
import { cn } from "@/lib/utils";

const passMeta: Record<PassTypeId, { icon: typeof Users; badge: string | null; popular?: boolean }> = {
  single: { icon: Users, badge: null },
  duo: { icon: Users, badge: "POPULAR", popular: true },
  family: { icon: Users, badge: "BEST VALUE" },
};

export default function BookingStep2() {
  const router = useRouter();
  const { name, setPassSelection } = useBookingStore();
  const [selected, setSelected] = useState<PassTypeId | null>(
    useBookingStore.getState().passType
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Guard: require personal details and email verification
  useEffect(() => {
    const state = useBookingStore.getState();
    if (!state.name) {
      router.replace("/booking/step-1");
    } else if (!state.isEmailVerified) {
      router.replace("/booking/verify-email");
    }
  }, [router]);

  const handleContinue = () => {
    if (!selected) return;
    const pass = PASS_TYPES[selected];
    setPassSelection({
      passType: selected,
      passPrice: pass.price,
      allowedEntries: pass.entries,
    });
    router.push("/booking/step-3");
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">CHOOSE YOUR PASS</h2>
        <p className="mt-2 text-purple-200/70">
          Welcome,{" "}
          <span className="font-semibold text-amber-300">{name.split(" ")[0]}</span>! Select the
          perfect pass for your group.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(PASS_TYPES) as PassTypeId[]).map((key) => {
          const pass = PASS_TYPES[key];
          const meta = passMeta[key];
          const isSelected = selected === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={cn(
                "relative flex flex-col rounded-3xl border p-6 text-left transition-all duration-300",
                isSelected
                  ? "border-amber-400 bg-gradient-to-b from-amber-500/[0.15] to-transparent shadow-2xl shadow-amber-500/20 scale-[1.02]"
                  : "border-purple-500/25 bg-white/[0.04] hover:border-purple-400/50"
              )}
            >
              {meta.badge && (
                <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-400 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {meta.popular ? <Crown className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
                  {meta.badge}
                </span>
              )}

              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20">
                  <meta.icon className="h-5 w-5 text-amber-400" />
                </div>
                {isSelected && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400">
                    <Check className="h-4 w-4 text-[#0b0a1f]" />
                  </span>
                )}
              </div>

              <h3 className="font-display text-lg font-bold text-white">{pass.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl font-black text-gold-gradient">
                  {mounted
                    ? `₹${(pass.price / 100).toLocaleString("en-IN")}`
                    : `₹${pass.price / 100}`}
                </span>
              </div>
              <p className="mt-1 text-sm text-purple-200/70">{pass.label}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/booking/step-1")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Details
        </Button>
        <Button size="lg" onClick={handleContinue} disabled={!selected} className="glow-pulse">
          {selected ? "CONTINUE TO PAYMENT" : "SELECT A PASS FIRST"}
        </Button>
      </div>
    </div>
  );
}