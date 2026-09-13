"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { personalDetailsSchema, type PersonalDetails } from "@/lib/utils/validation";
import { useBookingStore } from "@/stores/booking-store";

export default function BookingStep1() {
  const router = useRouter();
  const setPersonalDetails = useBookingStore((s) => s.setPersonalDetails);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      name: useBookingStore.getState().name,
      email: useBookingStore.getState().email,
      mobile: useBookingStore.getState().mobile,
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log("Form submitted successfully with data:", data);
    setSubmitting(true);
    try {
      setPersonalDetails(data);
      router.push("/booking/step-2");
    } catch (error) {
      console.error("Error during form submission:", error);
      setSubmitting(false);
    }
  }, (errors) => {
    console.log("Form validation failed:", errors);
  });

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">ENTER YOUR DETAILS</CardTitle>
          <CardDescription>
            Tell us who is coming to the celebration. Your pass will be sent to this email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200/40" />
                <Input
                  id="name"
                  placeholder="e.g. Priya Sharma"
                  className="pl-10"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
              </div>
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200/40" />
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="pl-10"
                  aria-invalid={!!errors.mobile}
                  {...register("mobile")}
                />
              </div>
              {errors.mobile && <p className="text-xs text-red-400">{errors.mobile.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Please wait..." : "CONTINUE"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}