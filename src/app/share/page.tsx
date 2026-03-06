"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ShareContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchParams = useSearchParams();
  const streak = searchParams.get("streak") || "1";
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas size matching an IG story or vertical share size
    canvas.width = 1080;
    canvas.height = 1920;

    // Background
    ctx.fillStyle = "#F5F0E8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Typography setup
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Subtitle
    ctx.font = "300 40px Inter, sans-serif";
    ctx.fillStyle = "#8C8078";
    ctx.fillText("DAY", canvas.width / 2, canvas.height / 2 - 150);

    // Big Streak Number
    ctx.font = "400 300px 'Playfair Display', serif";
    ctx.fillStyle = "#2C2825";
    ctx.fillText(streak, canvas.width / 2, canvas.height / 2 + 50);

    // App Title
    ctx.font = "400 60px 'Playfair Display', serif";
    ctx.fillStyle = "#2C2825";
    ctx.fillText("Silence", canvas.width / 2, canvas.height - 300);

    // Minor text
    ctx.font = "300 30px Inter, sans-serif";
    ctx.fillStyle = "#8C8078";
    ctx.fillText("A daily stillness practice", canvas.width / 2, canvas.height - 220);
    ctx.fillText("silence.app", canvas.width / 2, canvas.height - 150);

    setDownloadUrl(canvas.toDataURL("image/png"));
  }, [streak]);

  return (
    <>
      <div className="w-full max-w-[250px] aspect-[9/16] relative rounded-xl shadow-2xl overflow-hidden border border-secondary/20">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col gap-4 w-full">
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`silence-streak-${streak}.png`}
            className="px-8 py-3 rounded-full bg-foreground text-background hover:bg-secondary transition-colors duration-500 font-serif tracking-widest uppercase text-sm text-center"
          >
            Download Image
          </a>
        )}
        <Link
          href="/profile"
          className="px-8 py-3 rounded-full border border-secondary/30 text-foreground hover:bg-foreground hover:text-background transition-colors duration-500 font-serif tracking-widest uppercase text-sm text-center"
        >
          Back to Profile
        </Link>
      </div>
    </>
  );
}

export default function SharePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 animate-breath bg-background">
      <div className="flex flex-col items-center max-w-md w-full gap-8 text-center">
        <h1 className="text-3xl font-serif text-foreground tracking-wide">Share Your Peace</h1>
        <Suspense fallback={<div className="text-secondary animate-pulse">Brewing canvas...</div>}>
          <ShareContent />
        </Suspense>
      </div>
    </main>
  );
}
