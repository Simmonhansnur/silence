"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface AmbientSoundProps {
  autoPlay?: boolean;
}

export function AmbientSound({ autoPlay = false }: AmbientSoundProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const startSound = useCallback(() => {
    // Clean up any previous context
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
    }

    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioCtxRef.current = ctx;

    // Resume immediately (required by Chrome autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Generate Brown Noise buffer
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    sourceRef.current = source;

    // Warm low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 250;
    filter.Q.value = 0.7;

    // Gentle gain with slow fade-in
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 3);
    gainNodeRef.current = gainNode;

    // Connect: source → filter → gain → speakers
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(0);
    setIsPlaying(true);
  }, []);

  const stopSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    const gainNode = gainNodeRef.current;
    if (ctx && gainNode) {
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        ctx.close().catch(() => {});
        audioCtxRef.current = null;
      }, 1200);
    }
    setIsPlaying(false);
  }, []);

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        startSound();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, startSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const toggleSound = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSound();
    }
  };

  return (
    <button 
      onClick={toggleSound}
      className="absolute top-8 right-8 text-xs tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 z-50"
    >
      <div className={`w-2 h-2 rounded-full transition-colors ${isPlaying ? 'bg-accent animate-pulse' : 'bg-secondary'}`} />
      {isPlaying ? "Mute" : "Sound"}
    </button>
  );
}
