"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendEmailVerificationCode, verifyEmailCode } from "@/actions/verification";
import { useBookingStore } from "@/stores/booking-store";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { email, setIsEmailVerified } = useBookingStore();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<"send" | "verify">("send");

  useEffect(() => {
    // Ensure the user has an email before landing here
    if (!useBookingStore.getState().email) {
      router.replace("/booking/step-1");
    }
  }, [router]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      await sendEmailVerificationCode(email);
      setStep("verify");
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code.");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyEmailCode(email, otp);
      setIsEmailVerified(true);
      toast.success("Email verified successfully!");
      router.push("/booking/step-2");
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">VERIFY YOUR EMAIL</CardTitle>
          <CardDescription>
            We need to verify your email address to prevent fake bookings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "send" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200/40" />
                  <Input
                    id="email"
                    value={email}
                    readOnly
                    className="pl-10 bg-white/5"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <Button
                onClick={handleSendOtp}
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  "SEND VERIFICATION CODE"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-Digit Code</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleVerifyOtp}
                  className="w-full"
                  size="lg"
                  disabled={isVerifying || otp.length !== 6}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "VERIFY & CONTINUE"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep("send")}
                  disabled={isVerifying}
                >
                  Resend Code
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-center text-xs text-purple-200/50">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Securely verified via email.
          </div>

          <Button
            variant="ghost"
            onClick={() => router.push("/booking/step-1")}
            className="w-full gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
