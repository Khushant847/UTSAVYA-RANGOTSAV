"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#event-details", label: "Event" },
  { href: "#what-to-expect", label: "Experiences" },
  { href: "#book", label: "Passes" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const showNavLinks =
    !pathname.startsWith("/booking") &&
    !pathname.startsWith("/ticket") &&
    !pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-[#0b0a1f]/90 backdrop-blur-xl shadow-lg shadow-purple-900/20 border-b border-purple-500/15"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <span className="font-display text-lg font-bold tracking-wide">
            <span className="text-gold-gradient">UTSAVYA</span>
            <span className="text-white"> RANGOTSAV</span>
          </span>
        </Link>

        {showNavLinks && (
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-purple-100/80 transition-colors hover:text-amber-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden md:block">
          <Link href="/booking">
            <Button size="sm" className="glow-pulse">
              GET YOUR PASS
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-purple-500/15 bg-[#0b0a1f]/95 backdrop-blur-xl px-4 py-4">
          <nav className="flex flex-col gap-4">
            {showNavLinks &&
              NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-purple-100/80 transition-colors hover:text-amber-300"
                >
                  {link.label}
                </Link>
              ))}
            <Link href="/booking" onClick={() => setMenuOpen(false)}>
              <Button className="w-full">
                GET YOUR PASS
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}