import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Simple security check. 
  // In production, check user.id against an admin whitelist array or a special role table.
  if (!user || user.email !== "admin@silence.app") { 
     // Replace 'admin@silence.app' with your actual admin email
     redirect("/");
  }

  // Fetch DAU metrics
  const today = new Date().toISOString().split('T')[0];
  const { count: dauCount } = await supabase
    .from("users")
    .select("id", { count: 'exact', head: true })
    .eq("last_session_date", today);

  // Fetch Total Users
  const { count: totalUsers } = await supabase
    .from("users")
    .select("id", { count: 'exact', head: true });

  // Fetch Total Sessions
  const { count: totalSessions } = await supabase
    .from("sessions")
    .select("id", { count: 'exact', head: true });

  // Fetch Deep Tier Active
  const { count: deepUsers } = await supabase
    .from("users")
    .select("id", { count: 'exact', head: true })
    .eq("is_deep", true);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <div className="flex flex-col items-center max-w-4xl w-full gap-12">
        <h1 className="text-3xl font-serif text-foreground tracking-wide">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full text-center">
            
          <div className="p-6 border border-secondary/20 rounded-xl">
             <div className="text-4xl font-serif text-foreground mb-2">{dauCount || 0}</div>
             <div className="text-xs text-secondary tracking-widest uppercase">DAU</div>
          </div>

          <div className="p-6 border border-secondary/20 rounded-xl">
             <div className="text-4xl font-serif text-foreground mb-2">{totalUsers || 0}</div>
             <div className="text-xs text-secondary tracking-widest uppercase">Total Users</div>
          </div>

          <div className="p-6 border border-secondary/20 rounded-xl">
             <div className="text-4xl font-serif text-foreground mb-2">{totalSessions || 0}</div>
             <div className="text-xs text-secondary tracking-widest uppercase">Total Sessions</div>
          </div>

          <div className="p-6 border border-secondary/20 rounded-xl">
             <div className="text-4xl font-serif text-foreground mb-2">{deepUsers || 0}</div>
             <div className="text-xs text-secondary tracking-widest uppercase">Deep Tier</div>
          </div>

        </div>
      </div>
    </main>
  );
}
