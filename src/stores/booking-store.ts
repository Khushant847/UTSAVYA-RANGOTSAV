import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PassTypeId } from "@/lib/constants";

interface BookingState {
  name: string;
  email: string;
  mobile: string;
  isEmailVerified: boolean;
  passType: PassTypeId | null;
  passPrice: number;
  allowedEntries: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  bookingId: string | null;
  ticketId: string | null;
  currentStep: 1 | 2 | 3 | 4;
  setPersonalDetails: (data: { name: string; email: string; mobile: string }) => void;
  setIsEmailVerified: (verified: boolean) => void;
  setPassSelection: (data: { passType: PassTypeId; passPrice: number; allowedEntries: number }) => void;
  setPaymentInfo: (data: { razorpayOrderId: string }) => void;
  markPaymentComplete: (data: { razorpayPaymentId: string; bookingId: string; ticketId: string }) => void;
  setCurrentStep: (step: 1 | 2 | 3 | 4) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      name: "",
      email: "",
      mobile: "",
      isEmailVerified: false,
      passType: null,
      passPrice: 0,
      allowedEntries: 0,
      razorpayOrderId: null,
      razorpayPaymentId: null,
      bookingId: null,
      ticketId: null,
      currentStep: 1,
      setPersonalDetails: (data) => set({ ...data, currentStep: 2 }),
      setIsEmailVerified: (verified) => set({ isEmailVerified: verified }),
      setPassSelection: (data) => set({ ...data, currentStep: 3 }),
      setPaymentInfo: (data) => set(data),
      markPaymentComplete: (data) => set({ ...data, currentStep: 4 }),
      setCurrentStep: (step) => set({ currentStep: step }),
      resetBooking: () =>
        set({
          name: "",
          email: "",
          mobile: "",
          isEmailVerified: false,
          passType: null,
          passPrice: 0,
          allowedEntries: 0,
          razorpayOrderId: null,
          razorpayPaymentId: null,
          bookingId: null,
          ticketId: null,
          currentStep: 1,
        }),
    }),
    {
      name: "utsavya-booking",
    }
  )
);
