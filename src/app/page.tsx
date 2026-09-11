import { HeroSection } from "@/components/landing/HeroSection";
import { EventDetailsSection } from "@/components/landing/EventDetailsSection";
import { WhatToExpectSection } from "@/components/landing/WhatToExpectSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { ContactSection } from "@/components/landing/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <EventDetailsSection />
      <WhatToExpectSection />
      <PricingSection />
      <ContactSection />
    </>
  );
}