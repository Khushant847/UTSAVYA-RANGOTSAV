"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingStore } from "@/stores/booking-store";
import { markPaymentFailed } from "@/actions/booking";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetBooking = useBookingStore((s) => s.resetBooking);
  const orderId = searchParams.get("orderId");
  const markedRef = useRef(false);

  useEffect(() => {
    if (orderId && !markedRef.current) {
      markedRef.current = true;
      markPaymentFailed(orderId).catch(() => {});
    }
  }, [orderId]);

  const retry = () => {
    resetBooking();
    router.push("/booking/step-3");
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="font-display text-2xl">Payment Unsuccessful</CardTitle>
          <CardDescription>
            Payment unsuccessful. Your pass has not been generated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && <p className="text-xs text-purple-200/50">Order ID: {orderId}</p>}
          <Button className="w-full" size="lg" onClick={retry}>
            <RefreshCw className="h-4 w-4" />
            TRY AGAIN
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}