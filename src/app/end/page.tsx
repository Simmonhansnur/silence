"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EndPageContent() {
  const [journal, setJournal] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const completed = searchParams.get("completed");

  const saveJournal = async () => {
    if (!journal.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: journal })
      });
      if (res.ok) {
        setSaved(true);
        setJournal("");
      } else {
        const data = await res.json();
        if (res.status === 401) {
          setError("Sign in to save your whispers.");
        } else {
          setError(data.error || "Could not save. Try again.");
        }
      }
    } catch {
      setError("Connection lost. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 animate-breath bg-background">
      <div className="flex flex-col items-center max-w-md w-full gap-12 text-center">
        
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground tracking-wide">Stillness Achieved</h1>
          <p className="text-secondary text-sm font-light tracking-widest uppercase">
            Your {completed ? `${completed} minute ` : ""}session is complete.
          </p>
        </div>

        <div className="w-full space-y-4 opacity-0 animate-fadeIn" style={{ animationDelay: '1s' }}>
          {saved ? (
            <p className="text-secondary tracking-widest uppercase text-sm">Whisper recorded.</p>
          ) : (
            <div className="flex flex-col gap-4">
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="Whisper to your journal..."
                className="w-full bg-transparent border-b border-secondary/30 focus:border-accent outline-none py-2 text-center text-foreground placeholder:text-secondary/50 transition-colors resize-none overflow-hidden"
                rows={1}
                disabled={saving}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveJournal();
                  }
                }}
              />
              {journal && (
                <button 
                  onClick={saveJournal}
                  disabled={saving}
                  className="text-xs text-secondary hover:text-foreground tracking-widest uppercase transition-colors"
                >
                  {saving ? "Saving..." : "Save Whisper"}
                </button>
              )}
              {error && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-red-400">{error}</p>
                  <Link href="/auth" className="text-xs text-accent hover:text-foreground tracking-widest uppercase transition-colors">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 opacity-0 animate-fadeIn" style={{ animationDelay: '2s' }}>
          <Link
            href="/"
            className="px-8 py-3 rounded-full border border-secondary/30 text-foreground hover:bg-foreground hover:text-background transition-colors duration-500 font-serif tracking-widest uppercase text-sm inline-block"
          >
            Return
          </Link>
          <div className="text-xs text-secondary mt-4 flex flex-col gap-2">
            <Link href="/profile" className="hover:text-foreground transition-colors inline-block">Profile</Link>
            <Link href="/auth" className="hover:text-foreground transition-colors inline-block">Sign In</Link>
          </div>
        </div>
        
      </div>
    </main>
  );
}

export default function EndPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background"></div>}>
      <EndPageContent />
    </Suspense>
  );
}
