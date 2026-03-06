import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/app/profile/logout-button";
import { SubscriptionButton } from "@/components/subscription-button";
import { ReminderToggle } from "@/components/reminder-toggle";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("current_streak, longest_streak, created_at, is_deep, reminder_enabled")
    .eq("id", user.id)
    .single();

  // Get total sessions count
  const { count: totalSessions } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: 'long', year: 'numeric' })
    : "Unknown";

  // Extract display name from email 
  const displayName = user.user_metadata?.full_name 
    || user.email?.split("@")[0] 
    || "Friend";

  // Motivational message based on streak
  const streak = profile?.current_streak || 0;
  let motivation = "Begin your journey today.";
  if (streak >= 30) motivation = "A month of stillness. You are transforming.";
  else if (streak >= 14) motivation = "Two weeks in. The quiet is becoming you.";
  else if (streak >= 7) motivation = "One week strong. The noise is fading.";
  else if (streak >= 3) motivation = "A rhythm is forming. Keep going.";
  else if (streak >= 1) motivation = "You showed up. That matters.";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 animate-breath bg-background">
      <div className="flex flex-col items-center max-w-md w-full gap-10 text-center">
        
        {/* Personalized Greeting */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground tracking-wide">
            Hello, {displayName}
          </h1>
          <p className="text-secondary text-sm font-light italic">{motivation}</p>
          {profile?.is_deep && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-accent text-xs tracking-widest uppercase">Deep Tier</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-foreground/5">
            <span className="text-3xl font-serif text-foreground">{profile?.current_streak || 0}</span>
            <span className="text-[10px] text-secondary tracking-widest uppercase mt-1">Current</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-foreground/5">
            <span className="text-3xl font-serif text-foreground">{profile?.longest_streak || 0}</span>
            <span className="text-[10px] text-secondary tracking-widest uppercase mt-1">Longest</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-foreground/5">
            <span className="text-3xl font-serif text-foreground">{totalSessions || 0}</span>
            <span className="text-[10px] text-secondary tracking-widest uppercase mt-1">Sessions</span>
          </div>
        </div>

        <div className="text-xs text-secondary/50">
          Practicing since {memberSince}
        </div>
        
        <ReminderToggle initialEnabled={!!profile?.reminder_enabled} />

        {/* Deep Tier CTA or Benefits */}
        <div className="flex flex-col gap-4 w-full items-center">
          {!profile?.is_deep ? (
            <div className="w-full p-6 rounded-2xl border border-accent/20 bg-accent/5 space-y-3">
              <h3 className="font-serif text-foreground text-lg">Unlock Deep Tier</h3>
              <ul className="text-xs text-secondary space-y-1.5 text-left pl-4">
                <li>✦ Unlimited journal archive (free: 7 days)</li>
                <li>✦ Premium soundscapes coming soon</li>
                <li>✦ Support the Silence mission</li>
              </ul>
              <SubscriptionButton />
            </div>
          ) : (
            <div className="w-full p-4 rounded-2xl border border-accent/20 bg-accent/5 text-center space-y-2">
              <p className="text-sm text-foreground font-serif">Thank you for going deep.</p>
              <p className="text-xs text-secondary">Your journal archive is unlimited. You sustain Silence.</p>
            </div>
          )}

          <div className="flex w-full max-w-xs gap-4 mt-2">
            <Link
              href="/"
              className="flex-1 py-3 rounded-full border border-secondary/30 text-foreground hover:bg-foreground hover:text-background transition-colors duration-500 font-serif tracking-widest uppercase text-sm text-center"
            >
              Home
            </Link>
            <Link
              href="/journal"
              className="flex-1 py-3 rounded-full border border-secondary/30 text-foreground hover:bg-foreground hover:text-background transition-colors duration-500 font-serif tracking-widest uppercase text-sm text-center"
            >
              Journal
            </Link>
          </div>
          <Link
            href={`/share?streak=${profile?.current_streak || 0}`}
            className="text-xs text-secondary hover:text-foreground tracking-widest uppercase transition-colors"
          >
            Share My Streak
          </Link>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
