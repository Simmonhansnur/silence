"use client";

import { useUserStatus } from "@/components/user-provider";
import { useEffect, useState, useRef } from "react";

export function AmbientSound() {
  const { isDeep, isLoading } = useUserStatus();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    
    const ctx = new window.AudioContext();
    audioCtxRef.current = ctx;

    // Create Brown Noise
    const bufferSize = ctx.sampleRate * 2; 
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate for gain loss
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Low-pass filter for the deep rumble effect
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 150; // Deep rumble
    
    // Master gain for fade in/out
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNodeRef.current = gainNode;

    // Connect graph
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();
  };

  const toggleSound = () => {
    if (!audioCtxRef.current) {
        initAudio();
    }
    
    const ctx = audioCtxRef.current!;
    const gainNode = gainNodeRef.current!;

    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    if (isPlaying) {
      // Fade out
      gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    } else {
      // Fade in to gentle volume
      gainNode.gain.setTargetAtTime(0.3, ctx.currentTime, 2);
    }

    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  if (isLoading || !isDeep) return null;

  return (
    <button 
      onClick={toggleSound}
      className="absolute top-8 right-8 text-xs tracking-widest uppercase opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2 z-50"
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-accent' : 'bg-secondary'}`} />
      Brown Noise
    </button>
  );
}
