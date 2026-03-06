"use client";

import { useState } from "react";
import Link from "next/link";
import { CollectiveCounter } from "@/components/collective-counter";
import { AuthNavigation } from "@/components/auth-navigation";

const SESSION_LENGTHS = [5, 10, 15, 20];

export default function Home() {
  const [selectedLength, setSelectedLength] = useState(5);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 animate-breath">
      <AuthNavigation />
      <div className="flex flex-col items-center max-w-md w-full gap-12 text-center">
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-serif text-foreground tracking-wide">Silence</h1>
          <p className="text-secondary text-sm sm:text-base font-light tracking-widest uppercase">
            A daily stillness practice
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <p className="text-secondary text-sm opacity-60">Select duration (minutes)</p>
          <div className="flex gap-4">
            {SESSION_LENGTHS.map((len) => (
              <button
                key={len}
                onClick={() => setSelectedLength(len)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                  selectedLength === len
                    ? "bg-accent text-white scale-110 shadow-lg"
                    : "text-secondary hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        <Link
          href={`/session?length=${selectedLength}`}
          className="mt-8 px-8 py-3 rounded-full border border-secondary/30 text-foreground hover:bg-foreground hover:text-background transition-colors duration-500 font-serif tracking-widest uppercase text-sm"
        >
          Begin
        </Link>
        
      </div>
      <CollectiveCounter />
    </main>
  );
}
