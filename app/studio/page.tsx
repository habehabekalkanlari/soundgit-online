"use client";
import { useState, useEffect } from "react";
import UploadZone from "@/app/components/UploadZone";
import SoundCloudWaveform from "@/app/components/SoundCloudWaveform";
import ScoreBoxAnalytics from "@/app/components/ScoreBoxAnalytics";
import LFM3OmniAssistant from "@/app/components/LFM3OmniAssistant";
import MixTimeline from "@/app/components/MixTimeline";
export default function StudioPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedResults, setParsedResults] = useState<any[]>([]);
  const [collabScores, setCollabScores] = useState<any>({ vocal: 53, energy: 74, groove: 96, drop: 63, bass: 73, drums: 78, overall: 73 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(1.1);
  const [duration, setDuration] = useState(16);
  const [audioUrl, setAudioUrl] = useState("/audio/Casio-MT-45-16-Beat.wav");
  const [activeTab, setActiveTab] = useState<'upload'|'pool'|'mix'>('upload');
  const handleUpload = (files: File[], parsed: any[] = []) => {
    setUploadedFiles(prev => [...prev, ...files]);
    if (parsed.length > 0) {
      setParsedResults(prev => [...prev, ...parsed]);
      const latest = parsed[parsed.length - 1];
      if (latest?.collab) setCollabScores(latest.collab);
      if (latest?.duration) setDuration(latest.duration);
    }
    const audioFile = files.find(f => /\.(wav|mp3|aiff|flac|ogg|m4a)$/i.test(f.name));
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      setCurrentTime(0);
      setIsPlaying(false); 
      const a = new Audio(url);
      a.onloadedmetadata = () => { if (a.duration && isFinite(a.duration)) setDuration(a.duration); };
    }
  };
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) { setIsPlaying(false); return duration; }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);
  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-black text-white flex flex-col font-mono">
      <div className="h-[44px] shrink-0 border-b border-white/[0.08] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-[11px]">S</div>
          <span className="font-bold text-[11px]">SoundGit Studio</span>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[8px]">v45 • MIX + Fit</span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[9px]">EN</span>
      </div>
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-r border-white/[0.06]">
          <div className="shrink-0 p-2.5 border-b border-white/[0.06] space-y-2 bg-[#0a0a0a]">
            <div className="flex items-center gap-2.5">
              <button onClick={()=>setIsPlaying(!isPlaying)} className="w-7 h-7 shrink-0 rounded-full bg-white text-black flex items-center justify-center text-[10px]">{isPlaying?'■':'▶'}</button>
              <SoundCloudWaveform audioUrl={audioUrl} isPlaying={isPlaying} currentTime={currentTime} duration={duration} onSeek={setCurrentTime} />
              <span className="text-[9px] opacity-50 shrink-0 tabular-nums">{currentTime.toFixed(1)}s / {duration.toFixed(2)}s</span>
            </div>
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {Object.entries(collabScores).map(([k,v]:any)=>(<div key={k} className={`px-2 py-1 rounded-full border text-[8px] shrink-0 flex items-center gap-1 ${k==='overall'?'bg-white text-black font-bold':'bg-white/[0.06] border-white/[0.08]'}`}><span className="capitalize">{k}</span><span className="font-bold">{v as any}</span></div>))}
            </div>
          </div>
          <div className="shrink-0 p-2 flex gap-1.5 border-b border-white/[0.06]">
            <button onClick={()=>setActiveTab('upload')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${activeTab==='upload'?'bg-white text-black':'bg-white/[0.06] opacity-60'}`}>UPLOAD</button>
            <button onClick={()=>setActiveTab('pool')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${activeTab==='pool'?'bg-white text-black':'bg-white/[0.06] opacity-60'}`}>POOL</button>
            <button onClick={()=>setActiveTab('mix')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${activeTab==='mix'?'bg-white text-black ring-2 ring-[#00ff88]':'bg-white/[0.06] opacity-60'}`}>MIX ★</button>
            <div className="ml-auto flex gap-1">
              <span className="w-5 h-5 rounded-full bg-white text-black text-[9px] flex items-center justify-center">A</span>
              <span className="w-5 h-5 rounded-full bg-white/[0.06] text-[9px] flex items-center justify-center">◍</span>
              <span className="w-5 h-5 rounded-full bg-white/[0.06] text-[9px] flex items-center justify-center">C</span>
              <span className="w-5 h-5 rounded-full bg-white/[0.06] text-[9px] flex items-center justify-center">F</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-2.5 bg-black">
            {activeTab==='upload' && (
              <div className="h-full flex flex-col gap-2.5 overflow-hidden">
                <UploadZone onFiles={handleUpload} />
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                  {uploadedFiles.map((f,i)=>{
                    const r = parsedResults[i];
                    return (
                      <div key={`${f.name}-${i}`} className="p-2.5 rounded-xl bg-[#121212] border border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[9px]">♫</div><div><div className="text-[11px]">{f.name} • {(f.size/1024/1024).toFixed(2)} MB</div><div className="text-[8px] opacity-40">Audio • {r?.bpm || 128} BPM • {r?.key || 'F# minor'} • Overall {r?.collab?.overall || collabScores.overall}</div></div></div>
                          <span className="w-6 h-6 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold">{r?.collab?.overall || collabScores.overall}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {r?.collab && Object.entries(r.collab).filter(([k])=>k!=='overall').map(([k,v]:any)=>(<div key={k} className="px-2 py-1 rounded-lg bg-black border border-white/[0.06] flex justify-between"><span className="text-[8px] opacity-60 capitalize">{k}</span><div className="flex items-center gap-1.5"><div className="w-[40px] h-[2px] bg-white/[0.1] rounded-full"><div className="h-full bg-white" style={{ width: `${v}%` }} /></div><span className="text-[8px] font-bold">{v}</span></div></div>))}
                        </div>
                      </div>
                    );
                  })}
                  {uploadedFiles.length===0 && <div className="text-[10px] opacity-20 text-center mt-4">Dosya sürükle, collab scoring otomatik</div>}
                </div>
              </div>
            )}
            {activeTab==='pool' && (
              <div className="text-[10px] opacity-60 space-y-2"><div>POOL • {uploadedFiles.length} files • DuckDB: Top %80</div>{uploadedFiles.map((f,i)=><div key={i} className="p-2 rounded-lg bg-white/[0.04] flex justify-between"><span>{f.name}</span><span className="font-bold">{parsedResults[i]?.collab?.overall || 70}</span></div>)}</div>
            )}
            {activeTab==='mix' && (
              <MixTimeline files={uploadedFiles} parsed={parsedResults} currentTime={currentTime} duration={duration} onSeek={setCurrentTime} />
            )}
          </div>
        </div>
        <div className="w-[300px] shrink-0 flex flex-col overflow-hidden bg-[#0a0a0a]">
          <div className="p-2.5 border-b border-white/[0.06]"><ScoreBoxAnalytics collab={collabScores} /></div>
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5"><LFM3OmniAssistant /></div>
        </div>
      </div>
    </div>
  );
}
