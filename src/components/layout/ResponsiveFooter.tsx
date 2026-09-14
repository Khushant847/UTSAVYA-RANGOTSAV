"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

export function ResponsiveFooter() {
  const pathname = usePathname();

  // The admin portal has its own layout; the homepage footer is not needed there.
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <Footer />;
}