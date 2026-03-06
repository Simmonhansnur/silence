import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json();

  const secret = process.env.RAZORPAY_KEY_SECRET;
  
  // Verify Signature
  const generatedSignature = crypto
    .createHmac("sha256", secret!)
    .update(razorpay_payment_id + "|" + razorpay_subscription_id)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
  }

  // Update User in Supabase
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
      // Note: If verifying from a backend webhook, user session isn't available. 
      // This endpoint assumes frontend verification for immediate access.
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("users")
    .update({ 
      is_deep: true,
      deep_since: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    console.error("Supabase error upgrading user:", error);
    return NextResponse.json({ error: "Upgrade failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
