"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  Ticket,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  admin: {
    email: string;
    displayName: string;
    role: string;
  };
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/scanner", label: "Scan Entry QR", icon: ScanLine },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/logs", label: "Scan Logs", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-purple-500/15 px-6 py-5">
        <Sparkles className="h-5 w-5 text-amber-400" />
        <div>
          <p className="font-display text-sm font-bold text-white">
            <span className="text-gold-gradient">UTSAVYA</span> RANGOTSAV
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-purple-200/50">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gradient-to-r from-purple-500/20 to-amber-500/10 text-amber-300"
                  : "text-purple-200/70 hover:bg-purple-500/10 hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-amber-400" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-purple-500/15 px-6 py-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white">
            {admin.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{admin.displayName}</p>
            <p className="text-[10px] uppercase tracking-wide text-amber-300/80">{admin.role}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#0b0a1f] overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-top"
        style={{ backgroundImage: "url(/images/bg-2.jpg)" }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,10,31,0.94) 0%, rgba(11,10,31,0.82) 45%, rgba(11,10,31,0.96) 100%)",
        }}
      />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-purple-500/15 bg-[#0b0a1f] lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#0b0a1f] shadow-2xl">
            <button
              className="absolute right-3 top-3 p-1 text-purple-200/60"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-purple-500/15 bg-[#0b0a1f]/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="h-6 w-6 text-white" />
          </button>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            Admin
          </div>
        </header>

        <main className="relative z-10 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}