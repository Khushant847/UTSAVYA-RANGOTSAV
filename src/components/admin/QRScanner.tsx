"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import {
  ScanLine,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  CameraOff,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { scanTicket, type ScanResult } from "@/actions/scan";
import { cn } from "@/lib/utils";

const passLabels: Record<string, string> = {
  single: "Single Pass",
  duo: "Duo Pass",
  family: "Family / Group Pass",
};

export function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const extractToken = useCallback((scannedText: string): string | null => {
    try {
      if (scannedText.includes("token=")) {
        const url = new URL(scannedText);
        return url.searchParams.get("token");
      }
      if (scannedText.includes("/verify?")) {
        const url = new URL(scannedText);
        return url.searchParams.get("token");
      }
      return scannedText;
    } catch {
      return scannedText;
    }
  }, []);

  const processToken = useCallback(
    async (qrText: string) => {
      const token = extractToken(qrText);
      if (!token || token === lastScanned) return;

      setLastScanned(token);
      setScanning(true);

      try {
        const scanResult = await scanTicket(token);
        setResult(scanResult);

        if (scanResult.success) {
          toast.success(`Valid entry: ${scanResult.ticket?.name}`);
        } else {
          toast.error(scanResult.reason || "Invalid scan");
        }
      } catch {
        toast.error("Scan verification failed");
        setResult({ success: false, reason: "Verification error" });
      } finally {
        setScanning(false);
        // Lock the scanner: show the result dialog and pause decoding until
        // the gate attendant closes it, so no next ticket gets scanned by mistake.
        setResultDialogOpen(true);
        if (scannerRef.current) {
          try {
            scannerRef.current.pause();
          } catch {}
        }
      }
    },
    [extractToken, lastScanned]
  );

  const startScanner = useCallback(async () => {
    if (cameraActive || !containerRef.current) return;

    try {
      const scanner = new Html5Qrcode("qr-scanner-container");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 5,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          processToken(decodedText);
        },
        () => {}
      );

      setCameraActive(true);
      setLastScanned(null);
    } catch {
      toast.error("Could not access camera. Please allow camera permissions.");
    }
  }, [cameraActive, processToken]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && cameraActive) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
      setCameraActive(false);
    }
  }, [cameraActive]);

  const resumeScanner = useCallback(() => {
    setResultDialogOpen(false);
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch {}
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Scan Entry QR</h1>
          <p className="text-sm text-purple-200/60">
            Point your camera at a ticket QR code to validate entry.
          </p>
        </div>
        <div className="flex gap-2">
          {!cameraActive ? (
            <Button onClick={startScanner} className="gap-2">
              <Camera className="h-4 w-4" />
              START SCANNER
            </Button>
          ) : (
            <Button onClick={stopScanner} variant="destructive" className="gap-2">
              <CameraOff className="h-4 w-4" />
              STOP SCANNER
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Camera viewport */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-amber-400" />
              Camera View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <div id="qr-scanner-container" ref={containerRef} className="min-h-[300px] w-full" />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                  <CameraOff className="mb-3 h-10 w-10 text-purple-200/30" />
                  <p className="text-sm text-purple-200/50">
                    Camera inactive. Click START SCANNER to begin.
                  </p>
                </div>
              )}
              {scanning && (
                <div className="absolute right-3 top-3 z-10">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scan result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result ? (
                result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )
              ) : (
                <AlertTriangle className="h-5 w-5 text-purple-200/50" />
              )}
              Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-500/20">
                <ScanLine className="mb-3 h-10 w-10 text-purple-200/20" />
                <p className="text-sm text-purple-200/50">Scan a QR code to see the result</p>
              </div>
            ) : result.success && result.ticket ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-400" />
                  <p className="font-display text-2xl font-bold text-emerald-300">
                    VALID ENTRY
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-purple-500/10 pb-2">
                    <span className="text-purple-200/60">Guest Name</span>
                    <span className="font-semibold text-white">{result.ticket.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-500/10 pb-2">
                    <span className="text-purple-200/60">Pass</span>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      {passLabels[result.ticket.passType] || result.ticket.passType}
                    </Badge>
                  </div>
                  <div className="flex justify-between border-b border-purple-500/10 pb-2">
                    <span className="text-purple-200/60">Allowed Entries</span>
                    <span className="font-semibold text-white">{result.ticket.allowedEntries}</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-500/10 pb-2">
                    <span className="text-purple-200/60">Entries Used</span>
                    <span className="font-semibold text-white">{result.ticket.usedEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200/60">Entries Remaining</span>
                    <span
                      className={cn(
                        "font-semibold",
                        result.ticket.remainingEntries > 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      )}
                    >
                      {result.ticket.remainingEntries}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                  <XCircle className="mx-auto mb-2 h-10 w-10 text-red-400" />
                  <p className="font-display text-2xl font-bold text-red-300">INVALID ENTRY</p>
                </div>
                <p className="text-center text-sm text-purple-200/70">{result.reason}</p>
                {result.ticket && (
                  <div className="rounded-xl border border-purple-500/15 bg-white/[0.04] p-4 text-sm">
                    <p className="text-purple-200/60">Ticket Info:</p>
                    <p className="mt-1 font-semibold text-white">{result.ticket.name}</p>
                    <p className="text-purple-200/60">
                      {passLabels[result.ticket.passType]} • {result.ticket.usedEntries}/
                      {result.ticket.allowedEntries} entries used
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={resultDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resumeScanner();
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center font-display">Scan Result</DialogTitle>
          </DialogHeader>
          {result ? (
            result.success && result.ticket ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-emerald-400" />
                  <p className="font-display text-2xl font-bold text-emerald-300">
                    VALID ENTRY
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-widest text-purple-200/50">
                    Guest
                  </p>
                  <p className="font-display mt-1 text-3xl font-bold text-white">
                    {result.ticket.name}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white/[0.05] p-3">
                    <p className="text-[11px] uppercase tracking-wide text-purple-200/50">Pass</p>
                    <Badge className="mt-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      {passLabels[result.ticket.passType] || result.ticket.passType}
                    </Badge>
                  </div>
                  <div className="rounded-xl bg-white/[0.05] p-3">
                    <p className="text-[11px] uppercase tracking-wide text-purple-200/50">Used</p>
                    <p className="mt-1 font-bold text-white">
                      {result.ticket.usedEntries}/{result.ticket.allowedEntries}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.05] p-3">
                    <p className="text-[11px] uppercase tracking-wide text-purple-200/50">Left</p>
                    <p
                      className={cn(
                        "mt-1 font-bold",
                        result.ticket.remainingEntries > 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {result.ticket.remainingEntries}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center">
                  <XCircle className="mx-auto mb-2 h-12 w-12 text-red-400" />
                  <p className="font-display text-2xl font-bold text-red-300">INVALID ENTRY</p>
                </div>
                <p className="text-center text-sm text-purple-200/70">{result?.reason}</p>
                {result?.ticket && (
                  <div className="rounded-xl border border-purple-500/15 bg-white/[0.04] p-4 text-center text-sm">
                    <p className="font-semibold text-white">{result.ticket.name}</p>
                    <p className="mt-1 text-purple-200/60">
                      {passLabels[result.ticket.passType]} • {result.ticket.usedEntries}/
                      {result.ticket.allowedEntries} entries used
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="py-6 text-center text-sm text-purple-200/70">No scan result.</div>
          )}
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button className="w-full gap-2 sm:w-auto">
                <ScanLine className="h-4 w-4" />
                NEXT SCAN
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="ghost" onClick={() => setResult(null)} className="gap-2" disabled={!result}>
        <RotateCw className="h-4 w-4" />
        Clear Result
      </Button>
    </div>
  );
}