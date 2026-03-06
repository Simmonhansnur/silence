"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AmbientSound } from "@/components/ambient-sound";
import { GratitudeDisplay } from "@/components/gratitude-display";

function TimerParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lengthParam = searchParams.get("length");
  const lengthInMinutes = lengthParam ? parseInt(lengthParam, 10) : 5;
  const totalSeconds = lengthInMinutes * 60;

  const [sessionStarted, setSessionStarted] = useState(false);
  const [secondsPassed, setSecondsPassed] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && sessionStarted && secondsPassed < totalSeconds) {
      interval = setInterval(() => {
        setSecondsPassed((prev) => prev + 1);
      }, 1000);
    } else if (secondsPassed >= totalSeconds && isActive) {
      setIsActive(false);
      
      // Log session
      fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_minutes: lengthInMinutes })
      }).finally(() => {
        // Navigate to end screen with completion status
        router.push(`/end?completed=${lengthInMinutes}`);
      });
    }
    return () => clearInterval(interval);
  }, [isActive, secondsPassed, totalSeconds, router, lengthInMinutes, sessionStarted]);

  const progress = (secondsPassed / totalSeconds) * 100;
  const remaining = totalSeconds - secondsPassed;
  const displayMin = Math.floor(remaining / 60);
  const displaySec = remaining % 60;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-foreground text-background transition-colors duration-[2000ms] overflow-hidden">
      {!sessionStarted && (
        <GratitudeDisplay onFinish={() => {
          setSessionStarted(true);
          setIsActive(true);
        }} />
      )}
      
      {sessionStarted && <AmbientSound autoPlay />}
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <div className="w-64 h-64 rounded-full bg-background blur-3xl animate-breath"></div>
      </div>
      
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="opacity-10"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            className="transition-all duration-1000 ease-linear opacity-30"
          />
        </svg>
        
        {/* Reverse Countdown Display */}
        {sessionStarted && (
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-5xl font-serif tabular-nums tracking-wider opacity-60">
              {String(displayMin).padStart(2, '0')}:{String(displaySec).padStart(2, '0')}
            </span>
            <span className="text-xs tracking-widest uppercase opacity-20 mt-2">remaining</span>
          </div>
        )}
      </div>

      <button 
        onClick={() => router.push("/")}
        className="absolute bottom-8 text-xs tracking-widest uppercase opacity-30 hover:opacity-100 transition-opacity"
      >
        End Early
      </button>
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-foreground"></div>}>
      <TimerParams />
    </Suspense>
  );
}
