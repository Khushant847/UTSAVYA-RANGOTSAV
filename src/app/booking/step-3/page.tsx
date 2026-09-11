"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBookingStore } from "@/stores/booking-store";

const PaymentForm = dynamic(
  () => import("@/components/booking/PaymentForm").then((mod) => mod.PaymentForm),
  { ssr: false }
);

export default function BookingStep3() {
  const router = useRouter();

  useEffect(() => {
    const state = useBookingStore.getState();
    if (!state.name || !state.passType) {
      router.replace("/booking/step-2");
    }
  }, [router]);

  return <PaymentForm />;
}
