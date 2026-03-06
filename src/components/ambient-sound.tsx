"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface AmbientSoundProps {
  autoPlay?: boolean;
}

export function AmbientSound({ autoPlay = false }: AmbientSoundProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const hasInitRef = useRef(false);

  const initAudio = useCallback(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;
    
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
        output[i] *= 3.5;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Low-pass filter for the deep rumble effect
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200;
    
    // Master gain for fade in/out
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNodeRef.current = gainNode;

    // Connect graph
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();

    // Fade in
    gainNode.gain.setTargetAtTime(0.15, ctx.currentTime, 2);
    setIsPlaying(true);
  }, []);

  // Auto-play when component mounts if requested
  useEffect(() => {
    if (autoPlay) {
      // Small delay to ensure we're in a user-gesture context
      const timer = setTimeout(() => {
        initAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, initAudio]);

  const toggleSound = () => {
    if (!hasInitRef.current) {
      initAudio();
      return;
    }
    
    const ctx = audioCtxRef.current;
    const gainNode = gainNodeRef.current;
    if (!ctx || !gainNode) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (isPlaying) {
      gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      setIsPlaying(false);
    } else {
      gainNode.gain.setTargetAtTime(0.15, ctx.currentTime, 2);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <button 
      onClick={toggleSound}
      className="absolute top-8 right-8 text-xs tracking-widest uppercase opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2 z-50"
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-accent animate-pulse' : 'bg-secondary'}`} />
      {isPlaying ? "Mute" : "Sound"}
    </button>
  );
}
