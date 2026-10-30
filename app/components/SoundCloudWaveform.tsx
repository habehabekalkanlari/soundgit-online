"use client";
import { useRef, useEffect, useState } from "react";
export default function SoundCloudWaveform({ audioUrl, isPlaying, currentTime, duration, onSeek }: any) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [peaks, setPeaks] = useState<number[]>(Array.from({ length: 180 }, () => 0.3));
  const [loadedDuration, setLoadedDuration] = useState(duration);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(audioUrl);
        const buf = await res.arrayBuffer();
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decoded = await ctx.decodeAudioData(buf);
        const ch = decoded.getChannelData(0);
        const spb = Math.floor(ch.length / 180);
        const np: number[] = [];
        for (let i = 0; i < 180; i++) {
          let sum = 0;
          for (let j = 0; j < spb; j++) sum += Math.abs(ch[i * spb + j] || 0);
          np.push(Math.max(0.08, Math.min(1, (sum / spb) * 3.5)));
        }
        if (!cancelled) setPeaks(np);
        setLoadedDuration(decoded.duration);
        ctx.close();
      } catch {}
    };
    if (audioUrl) load();
    return () => { cancelled = true; };
  }, [audioUrl]);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.loop = false;
    }
  }, [audioUrl]);
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(()=>{});
    else audioRef.current.pause();
  }, [isPlaying]);
  const progress = loadedDuration > 0 ? currentTime / loadedDuration : 0;
  return (
    <div className="flex-1 relative group">
      <audio ref={audioRef} src={audioUrl} onLoadedMetadata={()=>{ if(audioRef.current && isFinite(audioRef.current.duration)) setLoadedDuration(audioRef.current.duration); }} onEnded={()=>{ if(audioRef.current) audioRef.current.pause(); onSeek(duration); }} preload="auto" className="hidden" />
      <div onClick={(e:any)=>{ const r=e.currentTarget.getBoundingClientRect(); const t=(e.clientX-r.left)/r.width*loadedDuration; if(audioRef.current) audioRef.current.currentTime=t; onSeek(t); }} className="h-[56px] flex items-center gap-[2px] cursor-pointer">
        {peaks.map((h,i)=>{ const played=i/peaks.length < progress; return <div key={i} className={`w-[3px] rounded-[1px] ${played?'bg-[#ff5500]':'bg-white/[0.22]'}`} style={{ height: `${h*100}%`, minHeight: '3px' }} />; })}
      </div>
      <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white/[0.08] rounded-full overflow-hidden"><div className="h-full bg-[#ff5500]" style={{ width: `${progress*100}%` }} /></div>
    </div>
  );
}
