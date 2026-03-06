"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: unknown;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

export function SubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // 1. Create a subscription on our backend
      const res = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
      });
      
      const { subscriptionId } = await res.json();

      if (!subscriptionId) {
         throw new Error("Could not initialize subscription");
      }

      // 2. Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: "Silence Deep Tier",
        description: "Yearly subscription for deep stillness",
        handler: async function (response: RazorpayResponse) {
          // Send success to our webhook/api manually as a fallback or immediate positive UX
          await fetch("/api/razorpay/verify", {
            method: "POST",
            body: JSON.stringify({
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_subscription_id: response.razorpay_subscription_id,
               razorpay_signature: response.razorpay_signature
            })
          });
          router.refresh(); // Refresh page to reflect new tier
        },
        theme: {
          color: "#8C8078",
        },
      };
      
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Subscription failed to initialize.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="px-8 py-3 rounded-full bg-foreground text-background hover:bg-secondary transition-colors duration-500 font-serif tracking-widest uppercase text-sm disabled:opacity-50"
      >
        {loading ? "Initializing..." : "Unlock Deep Tier"}
      </button>
    </>
  );
}
