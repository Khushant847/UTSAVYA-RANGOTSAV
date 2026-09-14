"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Ticket,
  Users,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBookingStore } from "@/stores/booking-store";
import { useRazorpay } from "@/hooks/useRazorpay";
import { formatPrice } from "@/lib/utils";
import { createRazorpayOrder, verifyPayment } from "@/actions/booking";
import { PASS_TYPES } from "@/lib/constants";

export function PaymentForm() {
  const router = useRouter();
  const {
    name,
    email,
    mobile,
    passType,
    passPrice,
    allowedEntries,
    setPaymentInfo,
    markPaymentComplete,
  } = useBookingStore();
  const { openCheckout, loading: checkoutLoading } = useRazorpay();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const passLabel = PASS_TYPES[passType as keyof typeof PASS_TYPES]?.name ?? "PASS";

  const handleProceedToPayment = async () => {
    if (!name || !email || !mobile || !passType) {
      toast.error("Please complete your details first.");
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const result = await createRazorpayOrder({
        name,
        email,
        mobile,
        passType: passType!,
      });

      setPaymentInfo({ razorpayOrderId: result.orderId });

      openCheckout({
        key: result.keyId,
        orderId: result.orderId,
        amount: result.amount,
        currency: result.currency,
        name,
        email,
        contact: mobile,
        description: `${passLabel} - ${allowedEntries} ${allowedEntries === 1 ? "entry" : "entries"}`,
        onSuccess: async (response) => {
          try {
            setProcessing(true);
            const verification = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verification.success) {
              markPaymentComplete({
                razorpayPaymentId: response.razorpay_payment_id,
                bookingId: verification.bookingId,
                ticketId: verification.ticketId,
              });
              toast.success("Payment successful! Your pass has been generated.");
              router.push(`/booking/confirmation?bookingId=${verification.bookingId}`);
            } else {
              setError(verification.error || "Payment verification failed. Please try again.");
              router.push(`/booking/payment-failed?orderId=${response.razorpay_order_id}`);
            }
          } catch {
            setProcessing(false);
            setError("Something went wrong while verifying your payment.");
            toast.error("Payment could not be verified. Please contact support.");
          }
        },
        onFailure: (err) => {
          setProcessing(false);
          setError("Payment unsuccessful. Your pass has not been generated.");
          const orderId = err?.error?.metadata?.order_id;
          router.push(`/booking/payment-failed${orderId ? `?orderId=${orderId}` : ""}`);
        },
        onDismiss: () => {
          setProcessing(false);
        },
      });
    } catch (err) {
      setProcessing(false);
      const message =
        err instanceof Error ? err.message : "Could not start payment. Please try again.";
      setError(message);
      toast.error(message);
    }
  };

  if (!isMounted) {
    return (
      <div className="mx-auto max-w-xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">ORDER SUMMARY</CardTitle>
          <CardDescription>Review your booking before making the payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15">
                <User className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-purple-200/60">Name</p>
                <p className="font-medium text-white">{name || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15">
                <Mail className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-purple-200/60">Email</p>
                <p className="font-medium text-white">{email || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15">
                <Phone className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-purple-200/60">Mobile</p>
                <p className="font-medium text-white">{mobile || "Not provided"}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
                <Ticket className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-purple-200/60">Selected Pass</p>
                <p className="font-medium text-white">{passLabel}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
                <Users className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-purple-200/60">Number of Entries</p>
                <p className="font-medium text-white">
                  {allowedEntries} {allowedEntries === 1 ? "person" : "people"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-200/70">Ticket Price</span>
              <span className="font-medium text-white">{formatPrice(passPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-200/70">Payment Gateway Charges</span>
              <span className="text-emerald-300">Included</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span className="text-white">Total Amount</span>
              <span className="text-gold-gradient">{formatPrice(passPrice)}</span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-center text-xs text-purple-200/50">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Payments are securely processed by Razorpay.
          </div>

          <Button
            onClick={handleProceedToPayment}
            disabled={processing || checkoutLoading}
            className="w-full"
            size="lg"
          >
            {processing || checkoutLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Payment in progress...
              </>
            ) : (
              <>
                <IndianRupee className="h-4 w-4" />
                PROCEED TO PAYMENT
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/booking/step-2")}
            disabled={processing}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pass Selection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
