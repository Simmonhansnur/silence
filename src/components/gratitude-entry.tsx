"use client";

import { useState } from "react";

export function GratitudeEntry() {
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || content.length > 50) return;
    setLoading(true);

    try {
      await fetch("/api/gratitude", {
        method: "POST",
        body: JSON.stringify({ content: content.slice(0, 50) }),
        headers: { "Content-Type": "application/json" }
      });
      setSubmitted(true);
    } catch {
       // Silent swallow for aesthetic preservation
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-secondary text-sm font-light mt-8 tracking-widest uppercase transition-opacity">
        Released.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
      <p className="text-sm text-secondary font-light text-center px-4">
        Leave an anonymous drop of gratitude for the next wanderer.
      </p>
      <div className="relative">
        <input
          type="text"
          maxLength={50}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="I am grateful for..."
          className="w-full bg-transparent border-b border-secondary/30 p-2 text-center text-foreground font-serif placeholder:text-secondary/30 focus:outline-none focus:border-secondary transition-colors"
        />
        <button 
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          className="absolute right-0 top-2 text-xs tracking-widest uppercase text-secondary hover:text-foreground disabled:opacity-30 transition-colors"
        >
          Drop
        </button>
      </div>
    </div>
  );
}
