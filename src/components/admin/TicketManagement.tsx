"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Download, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getAllTickets, exportTicketsToCSV } from "@/actions/ticket";
import { formatPrice } from "@/lib/utils";

const FILTERS = ["all", "paid", "pending", "failed", "used", "unused"] as const;

const passLabels: Record<string, string> = {
  single: "Single Pass",
  duo: "Duo Pass",
  family: "Family Pass",
};

interface AdminTicket {
  bookingId: string;
  ticketId: string;
  name: string;
  email: string;
  passType: string;
  passPrice: number;
  usedEntries: number;
  allowedEntries: number;
  paymentStatus: string;
  ticketStatus: string;
}

export function TicketManagement() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      try {
        const data = await getAllTickets(search, filter);
        if (active) setTickets(data as unknown as AdminTicket[]);
      } catch {
        if (active) toast.error("Failed to load tickets");
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, filter]);

  const handleExport = async () => {
    try {
      const csv = await exportTicketsToCSV();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `utsavya-tickets-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Ticket Management</h1>
          <p className="text-sm text-purple-200/60">
            {tickets.length} tickets found • Search by name, email, mobile, booking ID or ticket ID
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          EXPORT BOOKINGS
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200/40" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                filter === f
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  : "text-purple-200/60 border border-transparent hover:text-purple-100 hover:bg-purple-500/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Pass Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-purple-200/50">
                      Loading tickets...
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-purple-200/50">
                      <Ticket className="mx-auto mb-2 h-8 w-8" />
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.bookingId} className="hover:bg-purple-500/5">
                      <TableCell className="font-mono text-xs">{ticket.bookingId}</TableCell>
                      <TableCell className="font-mono text-xs">{ticket.ticketId}</TableCell>
                      <TableCell className="font-medium">{ticket.name}</TableCell>
                      <TableCell className="text-xs">{ticket.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {passLabels[ticket.passType] || ticket.passType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(ticket.passPrice || 0)}
                      </TableCell>
                      <TableCell>
                        {ticket.paymentStatus === "paid" ? (
                          <Badge variant="success" className="text-[10px]">PAID</Badge>
                        ) : ticket.paymentStatus === "failed" ? (
                          <Badge variant="error" className="text-[10px]">FAILED</Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px]">PENDING</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">
                          {ticket.usedEntries || 0}/{ticket.allowedEntries || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        {ticket.ticketStatus === "used" ? (
                          <Badge variant="error" className="text-[10px]">USED</Badge>
                        ) : ticket.paymentStatus === "paid" ? (
                          <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">INACTIVE</Badge>
                        )}
                      </TableCell>
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