"use client";

import { useCallback, useEffect, useState } from "react";

interface RazorpayCheckout {
  on(event: string, handler: (response: RazorpayErrorResponse) => void): void;
  open(): void;
}

interface RazorpayErrorResponse {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    source?: string;
    step?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
  code?: string;
  description?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: unknown) => RazorpayCheckout;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve();
  }
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        razorpayScriptPromise = null;
        reject(new Error("Failed to load Razorpay checkout"));
      };
      document.head.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  const openCheckout = useCallback(
    (options: {
      key: string;
      orderId: string;
      amount: number;
      currency: string;
      name?: string;
      email?: string;
      contact?: string;
      description?: string;
      onSuccess: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      onFailure?: (error: RazorpayErrorResponse) => void;
      onDismiss?: () => void;
    }) => {
      setLoading(true);
      loadRazorpayScript()
        .then(() => {
          const rzp = new window.Razorpay({
            key: options.key,
            order_id: options.orderId,
            amount: options.amount,
            currency: options.currency,
            name: "UTSAVYA RANGOTSAV",
            description: options.description || "Event Pass",
            prefill: {
              name: options.name,
              email: options.email,
              contact: options.contact,
            },
            theme: {
              color: "#8b5cf6",
            },
            handler: (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) => {
              options.onSuccess(response);
            },
            modal: {
              ondismiss: () => {
                setLoading(false);
                options.onDismiss?.();
              },
              escape: true,
              backdropclose: true,
            },
          });

          rzp.on("payment.failed", (response) => {
            setLoading(false);
            options.onFailure?.(response);
          });

          rzp.open();
        })
        .catch((err) => {
          setLoading(false);
          options.onFailure?.(err);
        });
    },
    []
  );

  return { openCheckout, loading };
}