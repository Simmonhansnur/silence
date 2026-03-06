import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID!,
      total_count: 12, // example: yearly plan billed monthly or simply a 1-year subscription
      customer_notify: 1,
    });

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error) {
    console.error("Razorpay Sub Creation Error:", error);
    return NextResponse.json({ error: "Could not create subscription" }, { status: 500 });
  }
}
