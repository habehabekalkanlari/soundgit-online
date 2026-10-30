"use client";
import { useRef, useEffect, useState } from "react";
export default function SoundCloudWaveform({ audioUrl, isPlaying, currentTime, duration, onSeek }: any) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<number[]>(() => Array.from({ length: 180 }, () => Math.random()*0.6+0.2));
  const [loadedDuration, setLoadedDuration] = useState(duration);
  // Gerçek waveform üret - Web Audio API ile decode
  useEffect(() => {
    let cancelled = false;
    const loadPeaks = async () => {
      try {
        const res = await fetch(audioUrl);
        const buf = await res.arrayBuffer();
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decoded = await ctx.decodeAudioData(buf);
        const channel = decoded.getChannelData(0);
        const samplesPerBar = Math.floor(channel.length / 180);
        const newPeaks: number[] = [];
        for (let i = 0; i < 180; i++) {
          let sum = 0;
          for (let j = 0; j < samplesPerBar; j++) {
            sum += Math.abs(channel[i * samplesPerBar + j]);
          }
          newPeaks.push(Math.max(0.08, Math.min(1, (sum / samplesPerBar) * 4)));
        }
        if (!cancelled) setPeaks(newPeaks);
        setLoadedDuration(decoded.duration);
        ctx.close();
      } catch (e) {
        console.log("Waveform fallback random", e);
        // fallback random kalsın
      }
    };
    if (audioUrl) loadPeaks();
    return () => { cancelled = true; };
  }, [audioUrl]);
  // Audio src değişince - SADECE yükle, çalma!
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      // loop kapalı
      audioRef.current.loop = false;
    }
  }, [audioUrl]);
  // Play/Pause - sadece kullanıcı basınca
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(()=>{});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setLoadedDuration(audioRef.current.duration);
    }
  };
  const handleEnded = () => {
    // LOOP YOK - dur ve sonda kal
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onSeek(duration); // sonda kal, 0'a dönme
  };
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const t = pct * loadedDuration;
    if (audioRef.current) audioRef.current.currentTime = t;
    onSeek(t);
  };
  const progress = loadedDuration > 0 ? currentTime / loadedDuration : 0;
  return (
    <div className="flex-1 relative group">
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
        className="hidden"
        loop={false}
      />
      {/* Canvas gibi ama div bar - SoundCloud style: ince, sık, yüksek kontrast */}
      <div onClick={handleClick} className="h-[56px] flex items-center gap-[2px] cursor-pointer">
        {peaks.map((h, i) => {
          const isPlayed = i / peaks.length < progress;
          return (
            <div
              key={i}
              className={`w-[3px] rounded-[1px] transition-colors duration-75 ${isPlayed ? 'bg-[#ff5500] group-hover:bg-[#ff7733]' : 'bg-white/[0.22] group-hover:bg-white/[0.35]'}`}
              style={{ height: `${h * 100}%`, minHeight: '3px' }}
            />
          );
        })}
      </div>
      <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white/[0.08] rounded-full overflow-hidden">
        <div className="h-full bg-[#ff5500] transition-none" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
