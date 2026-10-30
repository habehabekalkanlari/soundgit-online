"use client";
import { useRef, useEffect, useState } from "react";
interface Props {
  audioUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}
export default function SoundCloudWaveform({ audioUrl, isPlaying, currentTime, duration, onSeek }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [bars] = useState(() => Array.from({ length: 180 }, () => Math.random() * 0.7 + 0.3));
  const [loadedDuration, setLoadedDuration] = useState(duration);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(()=>{});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);
  const handleLoadedMetadata = () => {
    if (audioRef.current) setLoadedDuration(audioRef.current.duration || duration);
  };
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const seekTime = pct * loadedDuration;
    if (audioRef.current) audioRef.current.currentTime = seekTime;
    onSeek(seekTime);
  };
  const progress = loadedDuration > 0 ? currentTime / loadedDuration : 0;
  return (
    <div className="flex-1 relative group">
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => onSeek(0)}
        preload="auto"
        className="hidden"
      />
      <div onClick={handleClick} className="h-[48px] flex items-end gap-[2px] cursor-pointer">
        {bars.map((h, i) => {
          const isPlayed = i / bars.length < progress;
          return <div key={i} className={`w-[3px] rounded-full ${isPlayed ? 'bg-white' : 'bg-white/[0.18] group-hover:bg-white/[0.28]'}`} style={{ height: `${h * 100}%`, minHeight: '4px' }} />;
        })}
      </div>
      <div className="absolute -bottom-4 left-0 right-0 h-[1px] bg-white/[0.06]">
        <div className="h-full bg-white transition-all" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
