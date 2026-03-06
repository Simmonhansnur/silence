"use client";

import { useEffect, useState } from "react";

export function GratitudeDisplay({ onFinish }: { onFinish: () => void }) {
  const [content, setContent] = useState<string | null>(null);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    async function fetchDrop() {
      try {
        const res = await fetch("/api/gratitude");
        const data = await res.json();
        setContent(data.content || "I am grateful for this brief moment of quiet.");
      } catch {
        setContent("I am grateful for this brief moment of quiet.");
      }
    }
    fetchDrop();
  }, []);

  useEffect(() => {
    if (!content) return;
    
    // Hold the message for a few seconds, then fade out
    const holdTimer = setTimeout(() => {
      setFadingOut(true);
    }, 4000);

    // After fade out completes, trigger the timer
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 6000);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(finishTimer);
    };
  }, [content, onFinish]);

  if (!content) return null;

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center bg-foreground text-background z-50 transition-opacity duration-[2000ms] ${fadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-md text-center px-4 space-y-6">
        <p className="text-sm font-light tracking-widest uppercase opacity-50">Someone is grateful for:</p>
        <h2 className="text-2xl md:text-3xl font-serif leading-relaxed px-4">&quot;{content}&quot;</h2>
      </div>
    </div>
  );
}
