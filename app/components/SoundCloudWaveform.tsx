"use client";
import { useEffect, useRef, useState } from "react";

interface WaveformProps {
  audioUrl: string;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  currentTime: number;
  duration: number;
}

export default function SoundCloudWaveform({ audioUrl, isPlaying, onSeek, currentTime, duration }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Generate fake peaks like SoundCloud (bars)
  useEffect(() => {
    const fakePeaks = Array.from({ length: 180 }, (_, i) => {
      // SoundCloud style: varied heights, more dynamic in middle
      const base = 0.15 + Math.sin(i * 0.1) * 0.3 + Math.random() * 0.4;
      // Casio MT-45 has 16 beats - accent every 16th
      const accent = i % 11 === 0 ? 0.3 : 0;
      return Math.min(1, Math.max(0.05, base + accent));
    });
    setPeaks(fakePeaks);
  }, [audioUrl]);

  // Draw
  useEffect(() => {
    if (!canvasRef.current || peaks.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const barWidth = w / peaks.length;
    const gap = 1.5;
    
    ctx.clearRect(0, 0, w, h);
    
    const progressRatio = duration > 0 ? currentTime / duration : 0;
    const progressIndex = Math.floor(progressRatio * peaks.length);
    
    peaks.forEach((peak, i) => {
      const barHeight = peak * h * 0.85;
      const x = i * barWidth;
      const y = (h - barHeight) / 2;
      
      // Played vs unplayed - SoundCloud orange/gray logic, we keep white/black
      const isPlayed = i <= progressIndex;
      
      if (isPlayed) {
        // Played: white
        ctx.fillStyle = '#ffffff';
      } else {
        // Unplayed: white 18%
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
      }
      
      // Hover highlight
      if (hoverX !== null) {
        const hoverIndex = Math.floor((hoverX / w) * peaks.length);
        if (i === hoverIndex) {
          ctx.fillStyle = isPlayed ? '#ffffff' : 'rgba(255,255,255,0.5)';
        }
      }
      
      // Rounded bar
      const radius = 1;
      ctx.beginPath();
      // @ts-ignore
      if (ctx.roundRect) {
        ctx.roundRect(x, y, Math.max(1, barWidth - gap), barHeight, radius);
      } else {
        ctx.rect(x, y, Math.max(1, barWidth - gap), barHeight);
      }
      ctx.fill();
    });
    
    // Progress line
    if (progressRatio > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(progressRatio * w - 1, 0, 1, h);
    }
  }, [peaks, currentTime, duration, hoverX]);

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || duration === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    onSeek(ratio * duration);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  };

  const handleMouseLeave = () => setHoverX(null);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[80px] cursor-pointer group"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }} />
      
      {/* Hover time tooltip - SoundCloud style */}
      {hoverX !== null && duration > 0 && (
        <div 
          className="absolute top-0 bottom-0 w-px bg-white/50 pointer-events-none"
          style={{ left: hoverX }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-black text-white text-[10px] font-mono rounded">
            {Math.floor((hoverX / (containerRef.current?.offsetWidth||1)) * duration)}s
          </div>
        </div>
      )}
      
      {/* Played overlay gradient - like SoundCloud */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-gradient-to-b from-white to-transparent" />
    </div>
  );
}
