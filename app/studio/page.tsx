"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ScoreBoxAnalytics from "../components/ScoreBoxAnalytics";
import LFM3OmniAssistant from "../components/LFM3OmniAssistant";

export default function Studio() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lang, setLang] = useState<'tr'|'en'>('en');
  const [activeTab, setActiveTab] = useState<'wave'|'pool'|'collab'>('wave');
  const [leftTab, setLeftTab] = useState<'tracks'|'wave'|'pool'>('tracks');
  const [url, setUrl] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('soundgit_lang') as any;
    if (savedLang) setLang(savedLang);
    // Auth guard - google_user required
    const g = localStorage.getItem('google_user');
    const s = localStorage.getItem('soundgit_user');
    if (!g && !s) {
      // allow for now but show minimal
    }
    // Mock audio url if none
    setUrl('/data-pipeline/raw/Casio-MT-45-16-Beat.wav');
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2,2);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0,0,w,h);
    // Draw minimal waveform (sinus ultra slow)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x=0; x<w; x++) {
      const y = h/2 + Math.sin(x*0.01 + Date.now()*0.00002)* (h*0.35) * Math.sin(x*0.005);
      if (x===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.stroke();
    // Playhead
    ctx.fillStyle = '#fff';
    ctx.fillRect(w*0.35, 0, 1, h);
  });

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
            <div className="ml-auto flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-[10px] opacity-40 font-mono">F# minor • 128</span>
            </div>
          </div>

          {/* Waveform - big, minimal */}
          <div className="flex-1 relative bg-[#070707] m-3 rounded-[16px] border border-white/[0.06] overflow-hidden group">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {/* Hover scrub */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <div className="flex gap-2">
                <button onClick={()=>{if(audioRef.current){ isPlaying?audioRef.current.pause():audioRef.current.play(); setIsPlaying(!isPlaying);}}} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-[20px]">{isPlaying?'❚❚':'▶'}</button>
              </div>
            </div>
            {/* Minimal info top left - icon only */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] font-mono border border-white/10">◍ 0:00 / 0:16</span>
              <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] font-mono border border-white/10">♾️ Loop</span>
            </div>
            {/* Collab badges - white line icons only, no text heavy */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <div className="flex gap-1.5">
                {[
                  { k:'vocal', i:'◍', v: 82 },
                  { k:'energy', i:'⚡', v: 76 },
                  { k:'groove', i:'◫', v: 88 },
                  { k:'drop', i:'▼', v: 72 },
                  { k:'bass', i:'◑', v: 79 },
                  { k:'drums', i:'◎', v: 85 },
                ].map(b=>(
                  <div key={b.k} className="px-2.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur flex items-center gap-1.5">
                    <span className="text-[11px]">{b.i}</span>
                    <span className="text-[10px] font-mono">{b.v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                <button className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center">⤢</button>
              </div>
            </div>
          </div>

          {/* Bottom transport - icon only */}
          <div className="h-[64px] border-t border-white/[0.06] flex items-center px-4 gap-3">
            <button onClick={()=>{if(audioRef.current){ isPlaying?audioRef.current.pause():audioRef.current.play(); setIsPlaying(!isPlaying);}}} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-[16px]">{isPlaying?'❚❚':'▶'}</button>
            <div className="flex items-center gap-2 text-[11px] font-mono opacity-60">
              <span>128.0</span>
              <span className="opacity-30">BPM</span>
              <span className="w-px h-3 bg-white/20 mx-1" />
              <span>F#</span>
            </div>
            <div className="flex-1" />
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-full bg-white/[0.06]">↺</button>
              <button className="w-8 h-8 rounded-full bg-white/[0.06]">◑</button>
              <button className="w-8 h-8 rounded-full bg-white">⎙</button>
            </div>
            <audio ref={audioRef} src={url} preload="metadata" crossOrigin="anonymous" onEnded={()=>setIsPlaying(false)} />
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
          
          {/* New analytics score box - icon heavy */}
          <ScoreBoxAnalytics lang={lang} />

          <div className="border-t border-white/[0.06] pt-3">
            <div className="text-[11px] tracking-widest opacity-40 mb-2">{t('Havuz','Pool')}</div>
            <div className="space-y-1.5">
              {[
                { title: 'Casio-MT-45', bpm: 128, key: 'F#', likes: 110, top: true },
                { title: 'Bounce v99', bpm: 132, key: 'E', likes: 109, top: false },
                { title: 'Bounce v98', bpm: 131, key: 'G', likes: 108, top: false },
              ].map((tr,i)=>(
                <div key={i} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${tr.top?'bg-white text-black':'bg-white/[0.04] hover:bg-white/[0.06]'}`}>
                  <span className="text-[12px]">♫</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono truncate">{tr.title}</div>
                    <div className="text-[9px] opacity-60">{tr.bpm} • {tr.key}</div>
                  </div>
                  <span className="text-[10px] font-mono">{tr.likes}</span>
                  {tr.top && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
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
