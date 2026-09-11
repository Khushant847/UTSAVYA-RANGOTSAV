"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PartyPopper,
  Download,
  Share2,
  Save,
  Loader2,
  CheckCircle2,
  Home,
} from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TicketCard, TicketData } from "@/components/ticket/TicketCard";
import { Confetti } from "@/components/shared/Confetti";
import { getTicketByBookingId } from "@/actions/ticket";
import { useBookingStore } from "@/stores/booking-store";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");
  const [ticket, setTicket] = useState<(TicketData & { qrToken: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const { email } = useBookingStore();

  useEffect(() => {
    if (!bookingId) {
      router.replace("/booking/step-1");
      return;
    }

    let active = true;
    getTicketByBookingId(bookingId)
      .then((data) => {
        if (!active) return;
        if (!data || data.paymentStatus !== "paid") {
          toast.error("Ticket not found or payment incomplete.");
          router.replace("/booking/step-1");
          return;
        }
        setTicket(data);
      })
      .catch(() => {
        if (active) toast.error("Could not load your ticket.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [bookingId, router]);

  const qrUrl = ticket
    ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ticket/verify?token=${ticket.qrToken}`
    : "";

  const handleDownload = async () => {
    if (!ticketRef.current || !ticket) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `${ticket.bookingId}-pass.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Pass downloaded!");
    } catch {
      toast.error("Could not download the pass. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async () => {
    await handleDownload();
  };

  const handleShare = async () => {
    if (!ticket) return;
    const shareData = {
      title: "My UTSAVYA RANGOTSAV Pass",
      text: `I'm attending UTSAVYA RANGOTSAV on 17 October 2026! Booking ID: ${ticket.bookingId}`,
      url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/ticket/${ticket.bookingId}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Ticket link copied to clipboard!");
      }
    } catch {
      // user cancelled share
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <Confetti count={25} />

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="font-display text-3xl font-black text-white">
          PAYMENT SUCCESSFUL <span className="inline-block">🎉</span>
        </h2>
        <p className="mt-2 text-purple-200/70">
          Your UTSAVYA RANGOTSAV pass has been generated.
        </p>
        {email && (
          <p className="mt-1 text-xs text-purple-200/50">
            A confirmation email has been sent to {email}.
          </p>
        )}
      </div>

      <div ref={ticketRef} className="mb-6">
        <TicketCard ticket={ticket} qrUrl={qrUrl} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Button onClick={handleDownload} disabled={downloading} variant="outline" className="gap-2">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              DOWNLOAD PASS
            </Button>
            <Button onClick={handleSave} variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              SAVE PASS
            </Button>
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              SHARE PASS
            </Button>
          </div>

          <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] p-4 text-center">
            <p className="text-sm text-purple-200/80 flex items-center justify-center gap-2">
              <PartyPopper className="h-4 w-4 text-amber-400" />
              See you at the celebration on 17 October 2026, 5:30 PM onwards!
            </p>
          </div>

          <Button variant="ghost" className="mt-4 w-full gap-2" onClick={() => router.push("/")}>
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}