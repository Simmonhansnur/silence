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

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: 'long', year: 'numeric' })
    : "Unknown";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 animate-breath bg-background">
      <div className="flex flex-col items-center max-w-md w-full gap-12 text-center">
        
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground tracking-wide">Your Progress</h1>
          {profile?.is_deep && (
            <p className="text-accent text-sm tracking-widest uppercase">Deep Tier Access Active</p>
          )}
        </div>

        <div className="flex gap-8 justify-center w-full">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-serif text-foreground">{profile?.current_streak || 0}</span>
            <span className="text-xs text-secondary tracking-widest uppercase mt-2">Current Streak</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-serif text-foreground">{profile?.longest_streak || 0}</span>
            <span className="text-xs text-secondary tracking-widest uppercase mt-2">Longest Streak</span>
          </div>
        </div>

        <div className="text-sm text-secondary">
          Member since {memberSince}
        </div>
        
        <ReminderToggle initialEnabled={!!profile?.reminder_enabled} />

        <div className="flex flex-col gap-4 mt-8 w-full items-center">
          {!profile?.is_deep && (
             <SubscriptionButton />
          )}

          <div className="flex w-full max-w-xs gap-4 mt-4">
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
