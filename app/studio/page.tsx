"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ScoreBoxAnalytics from "../components/ScoreBoxAnalytics";
import LFM3OmniAssistant from "../components/LFM3OmniAssistant";
import SoundCloudWaveform from "../components/SoundCloudWaveform";

export default function Studio() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lang, setLang] = useState<'tr'|'en'>('en');
  const [activeTab, setActiveTab] = useState<'wave'|'pool'|'collab'>('wave');
  const [leftTab, setLeftTab] = useState<'tracks'|'wave'|'pool'>('tracks');
  const [url, setUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(16);
  const [mounted, setMounted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('soundgit_lang') as any;
    if (savedLang) setLang(savedLang);
    
    // Fixed audio URL - public folder
    const audioUrl = '/audio/Casio-MT-45-16-Beat.wav';
    setUrl(audioUrl);
    
    // Check if file exists
    fetch(audioUrl, { method: 'HEAD' }).then(r => {
      if (!r.ok) {
        console.log('Audio not found, using fallback');
        setAudioError('Audio file not found - using placeholder');
      }
    }).catch(() => setAudioError('Audio check failed'));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 16);
    const onEnded = () => setIsPlaying(false);
    const onError = (e: any) => {
      console.error('Audio error:', e);
      setAudioError('Ses yüklenemedi - tarayıcı audio policy');
      // Try fallback: Web Audio API beep
    };
    
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [url]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Must be triggered by user gesture
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
      }
    } catch (err: any) {
      console.error('Play failed:', err);
      setAudioError('▶️ Tıkla - tarayıcı sesi engelledi, tekrar dene');
      // Fallback: try muted then unmuted
      try {
        audio.muted = true;
        await audio.play();
        audio.muted = false;
        setIsPlaying(true);
      } catch {}
    }
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const t = (tr: string, en: string) => lang==='tr'?tr:en;

  if (!mounted) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-[11px]">...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col select-none overflow-hidden">
      {/* TOP BAR - minimal */}
      <div className="h-[56px] border-b border-white/[0.06] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rotate-45 bg-gradient-to-br from-white to-white/40" />
          <span className="text-[13px] font-black tracking-[0.2em]">SOUNDGIT</span>
          <span className="text-[10px] opacity-30 font-mono">STUDIO</span>
          {audioError && <span className="ml-4 text-[10px] px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-200">{audioError}</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={()=>{const nl=lang==='tr'?'en':'tr'; setLang(nl); localStorage.setItem('soundgit_lang',nl);}} className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-[11px]">🌐</button>
          <button className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center">💾</button>
          <button onClick={()=>router.push('/')} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">↗</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT RAIL - icon only */}
        <div className="w-[64px] border-r border-white/[0.06] flex flex-col items-center py-4 gap-3">
          <button onClick={()=>setLeftTab('tracks')} className={`w-10 h-10 rounded-xl flex items-center justify-center text-[18px] ${leftTab==='tracks'?'bg-white text-black':'bg-white/[0.06] hover:bg-white/[0.1]'}`}>🎵</button>
          <button onClick={()=>setLeftTab('wave')} className={`w-10 h-10 rounded-xl flex items-center justify-center text-[18px] ${leftTab==='wave'?'bg-white text-black':'bg-white/[0.06] hover:bg-white/[0.1]'}`}>〰️</button>
          <button onClick={()=>setLeftTab('pool')} className={`w-10 h-10 rounded-xl flex items-center justify-center text-[18px] ${leftTab==='pool'?'bg-white text-black':'bg-white/[0.06] hover:bg-white/[0.1]'}`}>◫</button>
          <div className="flex-1" />
          <button className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-[12px]">?</button>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs - icon */}
          <div className="h-[44px] border-b border-white/[0.06] flex items-center px-4 gap-2">
            <button onClick={()=>setActiveTab('wave')} className={`px-3 h-7 rounded-full text-[11px] font-mono ${activeTab==='wave'?'bg-white text-black':'bg-white/[0.06]'}`}>WAVE • 128</button>
            <button onClick={()=>setActiveTab('pool')} className={`px-3 h-7 rounded-full text-[11px] font-mono ${activeTab==='pool'?'bg-white text-black':'bg-white/[0.06]'}`}>POOL • 101</button>
            <button onClick={()=>setActiveTab('collab')} className={`px-3 h-7 rounded-full text-[11px] font-mono ${activeTab==='collab'?'bg-white text-black':'bg-white/[0.06]'}`}>COLLAB</button>
            <div className="ml-auto flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-[10px] opacity-40 font-mono">F# minor • 128 • {Math.floor(currentTime)}s / {Math.floor(duration)}s</span>
            </div>
          </div>

          {/* SoundCloud-like waveform */}
          <div className="flex-1 flex flex-col bg-[#070707] m-3 rounded-[16px] border border-white/[0.06] overflow-hidden">
            {/* Main waveform area */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
              <div className="w-full max-w-[900px]">
                {/* Title row - minimal */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-[8px] bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[20px]">◍</div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold">Casio-MT-45-16-Beat.wav</div>
                    <div className="text-[10px] opacity-40 font-mono">habehabe • 0.60MB • 128 BPM • F# minor</div>
                  </div>
                  <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-[22px] hover:scale-105 transition">
                    {isPlaying ? '❚❚' : '▶'}
                  </button>
                </div>
                
                {/* SoundCloud waveform */}
                <SoundCloudWaveform 
                  audioUrl={url}
                  isPlaying={isPlaying}
                  onSeek={handleSeek}
                  currentTime={currentTime}
                  duration={duration}
                />
                
                {/* Time + actions row - SoundCloud style */}
                <div className="flex items-center justify-between mt-3 text-[11px] font-mono">
                  <div className="flex items-center gap-3 opacity-60">
                    <span>{Math.floor(currentTime/60)}:{String(Math.floor(currentTime%60)).padStart(2,'0')}</span>
                    <span className="opacity-30">/</span>
                    <span>{Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1]">♡ 110</button>
                    <button className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1]">↻</button>
                    <button className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1]">↗</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Collab badges - icon only, bottom */}
            <div className="h-[56px] border-t border-white/[0.06] flex items-center px-4 gap-1.5 overflow-x-auto">
              {[
                { k:'vocal', i:'◍', v: 82, l:'Vocal' },
                { k:'energy', i:'⚡', v: 76, l:'Energy' },
                { k:'groove', i:'◫', v: 88, l:'Groove' },
                { k:'drop', i:'▼', v: 72, l:'Drop' },
                { k:'bass', i:'◑', v: 79, l:'Bass' },
                { k:'drums', i:'◎', v: 85, l:'Drums' },
              ].map(b=>(
                <div key={b.k} className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px]">{b.i}</span>
                  <span className="text-[10px] font-mono opacity-70">{b.l}</span>
                  <span className="text-[10px] font-mono font-bold">{b.v}</span>
                </div>
              ))}
              <div className="ml-auto flex gap-1">
                <button className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[12px]">⤢</button>
              </div>
            </div>
          </div>

          {/* Bottom transport - icon only, SoundCloud style */}
          <div className="h-[64px] border-t border-white/[0.06] flex items-center px-4 gap-3">
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-[16px] hover:scale-105">{isPlaying?'❚❚':'▶'}</button>
            <div className="flex items-center gap-2 text-[11px] font-mono opacity-60">
              <span>128.0</span>
              <span className="opacity-30">BPM</span>
              <span className="w-px h-3 bg-white/20 mx-1" />
              <span>F#</span>
              <span className="opacity-30">•</span>
              <span className="text-[#00ff88]">● REC</span>
            </div>
            <div className="flex-1 h-[2px] bg-white/[0.06] rounded-full overflow-hidden mx-4">
              <div className="h-full bg-white transition-all" style={{ width: `${duration>0? (currentTime/duration)*100:0}%` }} />
            </div>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1]">↺</button>
              <button className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1]">◑</button>
              <button className="w-8 h-8 rounded-full bg-white text-black">⎙</button>
            </div>
            {/* Hidden audio element - fixed */}
            <audio 
              ref={audioRef} 
              src={url} 
              preload="metadata" 
              crossOrigin="anonymous"
              playsInline
            />
          </div>
        </div>

        {/* RIGHT RAIL - score box minimal icon */}
        <div className="w-[340px] border-l border-white/[0.06] bg-[#080808] p-3 flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-widest opacity-40">SCORE</span>
            <div className="flex gap-1">
              <button className="w-6 h-6 rounded-full bg-white/[0.06] text-[10px]">◩</button>
              <button className="w-6 h-6 rounded-full bg-white/[0.06] text-[10px]">✕</button>
            </div>
          </div>
          
          <ScoreBoxAnalytics lang={lang} />

          <div className="border-t border-white/[0.06] pt-3">
            <div className="text-[11px] tracking-widest opacity-40 mb-2">{t('Havuz','Pool')}</div>
            <div className="space-y-1.5">
              {[
                { title: 'Casio-MT-45', bpm: 128, key: 'F#', likes: 110, top: true, playing: true },
                { title: 'Bounce v99', bpm: 132, key: 'E', likes: 109, top: false, playing: false },
                { title: 'Bounce v98', bpm: 131, key: 'G', likes: 108, top: false, playing: false },
              ].map((tr,i)=>(
                <div key={i} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer ${tr.top?'bg-white text-black':'bg-white/[0.04] hover:bg-white/[0.06]'}`} onClick={()=> tr.playing && togglePlay()}>
                  <span className="text-[12px]">{tr.playing && isPlaying ? '🔊' : '♫'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono truncate">{tr.title}</div>
                    <div className="text-[9px] opacity-60">{tr.bpm} • {tr.key} • {tr.playing? `${Math.floor(currentTime)}s`:''}</div>
                  </div>
                  <span className="text-[10px] font-mono">{tr.likes}</span>
                  {tr.top && <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-white/[0.06] flex gap-1.5">
            <button className="flex-1 h-9 rounded-full bg-white text-black text-[11px] font-bold">Export</button>
            <button className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center">↗</button>
          </div>
        </div>
      </div>

      <LFM3OmniAssistant />
    </div>
  );
}
