import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();
  
  // PostgREST doesn't inherently support ORDER BY RANDOM() easily without an RPC function,
  // but we can query recent or a sample limit and randomize in memory since the content is small.
  // For production at scale, an RPC function fetching exactly 1 random row is better.
  const { data: drops, error } = await supabase
    .from("gratitude_drops")
    .select("content")
    .order("created_at", { ascending: false })
    .limit(50);
    
  if (error || !drops || drops.length === 0) {
    // Graceful fallback if no community gratitude exists
    return NextResponse.json({ content: "I am grateful for this brief moment of quiet." });
  }

  const randomDrop = drops[Math.floor(Math.random() * drops.length)];
  return NextResponse.json(randomDrop);
}

export async function POST(req: Request) {
  const { content } = await req.json();

  if (!content || content.length > 50) {
     return NextResponse.json({ error: "Invalid content length" }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("gratitude_drops")
    .insert({ content });

  if (error) {
    return NextResponse.json({ error: "Failed to save drop" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
