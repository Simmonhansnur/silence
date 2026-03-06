"use client";

import { useUserStatus } from "@/components/user-provider";
import { useEffect, useState } from "react";

export function AmbientSound() {
  const { isDeep, isLoading } = useUserStatus();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Intentionally using a gentle, continuous tone via Web Audio API or 
    // HTMLAudioElement if we had a specific track. We'll use a mocked UI for now.
    if (typeof window !== "undefined") {
      const a = new Audio("/brown-noise.mp3");
      a.loop = true;
      setAudio(a);
    }
  }, []);

  const toggleSound = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      // Brown noise provides a deep, rumbling ambient sound conducive to meditation. 
      // For this step, we assume the file will exist or we handle the catch gracefully
      audio.play().catch(e => console.log("Audio playback requires interaction or file missing.", e));
    }
    setIsPlaying(!isPlaying);
  };

  if (isLoading || !isDeep) return null;

  return (
    <button 
      onClick={toggleSound}
      className="absolute top-8 right-8 text-xs tracking-widest uppercase opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2"
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-accent' : 'bg-secondary'}`} />
      Ambient Sound
    </button>
  );
}
