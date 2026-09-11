"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getScanLogs } from "@/actions/ticket";

const passLabels: Record<string, string> = {
  single: "Single Pass",
  duo: "Duo Pass",
  family: "Family Pass",
};

interface ScanLog {
  id: string;
  scannedAt?: unknown;
  name: string;
  ticketId: string;
  passType: string;
  scanResult: string;
  entriesUsed: number;
  scannedBy: string;
}

function formatScanTime(value: unknown, mounted: boolean): string {
  let date: Date | null = null;
  if (value instanceof Date) {
    date = value;
  } else if (
    value &&
    typeof value === "object" &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    date = (value as { toDate: () => Date }).toDate();
  }
  if (!date) return "N/A";
  if (!mounted) return date.toString();
  return date.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function ScanLogViewer() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    const loadLogs = async () => {
      try {
        const data = await getScanLogs(200);
        if (active) setLogs(data as unknown as ScanLog[]);
      } catch {
        if (active) toast.error("Failed to load scan logs");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLogs();
    const interval = setInterval(loadLogs, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Scan Logs</h1>
          <p className="text-sm text-purple-200/60">
            {logs.length} scan entries • Updates every 10 seconds
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          LIVE
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Pass Type</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Entries Used</TableHead>
                  <TableHead>Scanned By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-purple-200/50">
                      Loading scan logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-purple-200/50">
                      <ClipboardList className="mx-auto mb-2 h-8 w-8" />
                      No scan logs yet. Start scanning QR codes at the entrance.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-purple-500/5">
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatScanTime(log.scannedAt, mounted)}
                      </TableCell>
                      <TableCell className="font-medium">{log.name}</TableCell>
                      <TableCell className="font-mono text-xs">{log.ticketId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {passLabels[log.passType] || log.passType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.scanResult === "success" ? (
                          <Badge variant="success" className="text-[10px]">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            VALID
                          </Badge>
                        ) : (
                          <Badge variant="error" className="text-[10px]">
                            <XCircle className="mr-1 h-3 w-3" />
                            {log.scanResult.toUpperCase()}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{log.entriesUsed}</TableCell>
                      <TableCell className="text-xs text-purple-200/60">{log.scannedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}