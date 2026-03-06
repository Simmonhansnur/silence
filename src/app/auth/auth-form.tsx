"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.push("/");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Check your email to verify your account.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAuth} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-transparent border-b border-secondary/30 focus:border-accent outline-none py-2 text-center text-foreground placeholder:text-secondary/50 transition-colors"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-transparent border-b border-secondary/30 focus:border-accent outline-none py-2 text-center text-foreground placeholder:text-secondary/50 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-8 py-3 rounded-full border border-secondary/30 text-foreground hover:bg-foreground hover:text-background transition-colors duration-500 font-serif tracking-widest uppercase text-sm disabled:opacity-50"
        >
          {loading ? "..." : isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      {message && <p className="text-accent text-sm">{message}</p>}

      <div className="flex flex-col gap-4 mt-4">
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="text-xs text-secondary tracking-widest uppercase hover:text-foreground transition-colors"
        >
          Continue with Google
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          type="button"
          className="text-xs text-secondary mt-2 hover:text-foreground transition-colors"
        >
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}
