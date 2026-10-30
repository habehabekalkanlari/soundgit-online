"use client";
import { useState, useEffect } from "react";
import UploadZone from "@/app/components/UploadZone";
import SoundCloudWaveform from "@/app/components/SoundCloudWaveform";
import ScoreBoxAnalytics from "@/app/components/ScoreBoxAnalytics";
import LFM3OmniAssistant from "@/app/components/LFM3OmniAssistant";
export default function StudioPage() {
  const [lang, setLang] = useState<'tr'|'en'>('en');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedResults, setParsedResults] = useState<any[]>([]);
  const [collabScores, setCollabScores] = useState<any>({ vocal: 82, energy: 76, groove: 88, drop: 72, bass: 79, drums: 85, overall: 80 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(16);
  const [audioUrl, setAudioUrl] = useState("/audio/Casio-MT-45-16-Beat.wav");
  const [activeTab, setActiveTab] = useState<'upload'|'pool'|'mix'>('upload');
  const [filter, setFilter] = useState<'havuz'|'tum'>('havuz');
  const t = (tr: string, en: string) => lang==='tr'?tr:en;
  const handleUpload = (files: File[], parsed: any[] = []) => {
    setUploadedFiles(prev => [...prev, ...files]);
    const audioFile = files.find(f => /\.(wav|mp3|aiff|flac|ogg|m4a)$/i.test(f.name));
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      setCurrentTime(0);
      setIsPlaying(true);
      const a = new Audio(url);
      a.onloadedmetadata = () => {
        if (a.duration && isFinite(a.duration)) setDuration(a.duration);
      };
    }
    if (parsed.length > 0) {
      setParsedResults(prev => [...prev, ...parsed]);
      const latest = parsed[parsed.length - 1];
      if (latest?.collab) {
        setCollabScores(latest.collab);
      }
    }
  };
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono">
      <div className="h-[56px] border-b border-white/[0.08] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">S</div>
          <span className="font-bold text-[13px]">SoundGit Studio</span>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[9px]">v44 • Collab Auto Scoring</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setLang(lang==='tr'?'en':'tr')} className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px]">{lang.toUpperCase()}</button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-white/[0.06] overflow-y-auto">
          <div className="p-4 border-b border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2">
              <button onClick={()=>setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-[14px]">{isPlaying?'■':'▶'}</button>
              <div className="flex-1">
                <SoundCloudWaveform audioUrl={audioUrl} isPlaying={isPlaying} currentTime={currentTime} duration={duration} onSeek={setCurrentTime} />
              </div>
              <span className="text-[11px] opacity-60">{currentTime.toFixed(1)}s / {duration}s</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { k:'vocal', i:'◍', v: collabScores.vocal, l:'Vocal' },
                { k:'energy', i:'⚡', v: collabScores.energy, l:'Energy' },
                { k:'groove', i:'◫', v: collabScores.groove, l:'Groove' },
                { k:'drop', i:'▼', v: collabScores.drop, l:'Drop' },
                { k:'bass', i:'◑', v: collabScores.bass, l:'Bass' },
                { k:'drums', i:'◎', v: collabScores.drums, l:'Drums' },
              ].map(b=>(
                <div key={b.k} className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px]">{b.i}</span>
                  <span className="text-[10px] opacity-70">{b.l}</span>
                  <span className="text-[10px] font-bold">{b.v}</span>
                </div>
              ))}
              <div className="px-3 py-1.5 rounded-full bg-white text-black text-[10px] font-bold">Overall {collabScores.overall}</div>
            </div>
          </div>
          <div className="p-2 flex gap-1 border-b border-white/[0.06]">
            {[
              { id:'upload', label:'UPLOAD' },
              { id:'pool', label:'POOL' },
              { id:'mix', label:'MIX' },
            ].map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-full text-[11px] font-bold ${activeTab===tab.id?'bg-white text-black':'bg-white/[0.06] opacity-60'}`}>{tab.label}</button>
            ))}
          </div>
          <div className="p-4 flex-1">
            {activeTab==='upload' && <UploadZone onFiles={handleUpload} />}
            {activeTab==='pool' && <div className="text-[11px] opacity-50">Pool • {uploadedFiles.length} files</div>}
            {activeTab==='mix' && <div className="text-[11px] opacity-50">Mix view</div>}
          </div>
        </div>
        <div className="w-[340px] flex flex-col bg-[#0a0a0a]">
          <div className="p-3 border-b border-white/[0.06]">
            <ScoreBoxAnalytics />
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            <LFM3OmniAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}
