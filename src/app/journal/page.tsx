import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// Mock decryption mirroring our API route. In production use AES-GCM Web Crypto
async function decrypt(base64Text: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Text, 'base64');
    return buffer.toString('utf8');
  } catch {
    return "Error decrypting entry";
  }
}

export default async function JournalPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("is_deep")
    .eq("id", user.id)
    .single();

  const isDeep = userData?.is_deep || false;

  let query = supabase
    .from("journal_entries")
    .select("created_at, content, session_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!isDeep) {
    // Only fetch last 7 days of entries for free tier
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.gte("created_at", sevenDaysAgo.toISOString());
  }

  const { data: entries } = await query;

  // Decrypt the entries
  const decryptedEntries = await Promise.all(
    (entries || []).map(async (entry) => {
      const decrypted = await decrypt(entry.content);
      return {
        ...entry,
        content: decrypted
      };
    })
  );

  return (
    <main className="flex flex-col items-center min-h-screen p-8 animate-breath bg-background">
      <div className="flex flex-col max-w-2xl w-full gap-12 mt-12">
        
        <div className="flex justify-between items-center border-b border-secondary/20 pb-4">
          <h1 className="text-3xl font-serif text-foreground tracking-wide">Journal Archive</h1>
          <Link
            href="/"
            className="text-xs text-secondary hover:text-foreground tracking-widest uppercase transition-colors"
          >
            Home
          </Link>
        </div>

        {decryptedEntries.length === 0 ? (
          <div className="text-center text-secondary py-20 font-light italic">
            No whispers recorded yet. Let your first session guide you.
          </div>
        ) : (
          <div className="space-y-8">
            {decryptedEntries.map((entry, idx) => {
              const date = new Date(entry.session_date).toLocaleDateString("en-US", {
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
              
              return (
                <div key={idx} className="group relative">
                  <div className="text-xs text-secondary/60 tracking-widest uppercase mb-2">
                    {date}
                  </div>
                  <p className="text-foreground leading-relaxed font-serif text-lg">
                    {entry.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!isDeep && decryptedEntries.length > 0 && (
          <div className="mt-12 py-8 border-t border-secondary/20 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-secondary text-sm">
              Free accounts preserve whispers for 7 days.
            </p>
            <Link href="/profile" className="text-foreground text-xs uppercase tracking-widest hover:text-accent transition-colors">
              Unlock Deep Tier
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
