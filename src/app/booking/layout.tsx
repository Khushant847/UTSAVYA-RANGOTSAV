const STEPS = [
  { number: 1, label: "Your Details" },
  { number: 2, label: "Select Pass" },
  { number: 3, label: "Payment" },
  { number: 4, label: "Your Ticket" },
];

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen utsavya-gradient pt-24 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-4.jpg)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,10,31,0.6) 0%, rgba(11,10,31,0.2) 45%, rgba(11,10,31,0.06) 50%, rgba(11,10,31,0.2) 55%, rgba(11,10,31,0.6) 100%)",
        }}
      />
      <div className="absolute inset-0 mandala-pattern" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-center font-display text-2xl font-bold text-white sm:text-3xl">
            <span className="text-gold-gradient">UTSAVYA</span> RANGOTSAV
          </h1>
          <p className="mt-1 text-center italic text-purple-200/70">&quot;Har Pal, Ek Utsav&quot;</p>

          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4">
            {STEPS.map((step) => (
              <div key={step.number} className="flex items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-purple-400/30 bg-white/[0.04] text-sm font-semibold text-purple-200">
                    {step.number}
                  </div>
                  <span className="mt-1.5 hidden text-[10px] font-medium uppercase tracking-wide text-purple-200/60 sm:block">
                    {step.label}
                  </span>
                </div>
                {step.number < 4 && (
                  <div className="mb-5 hidden h-px w-8 bg-purple-400/20 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}