"use client";
import { useState, useEffect } from "react";
import UploadZone from "@/app/components/UploadZone";
import SoundCloudWaveform from "@/app/components/SoundCloudWaveform";
import MixTimeline from "@/app/components/MixTimeline";
import ScoreBoxAnalytics from "@/app/components/ScoreBoxAnalytics";
import LFM3OmniAssistant from "@/app/components/LFM3OmniAssistant";
export default function StudioPage() {
  const [lang, setLang] = useState<'tr'|'en'>('en');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedResults, setParsedResults] = useState<any[]>([]);
  const [collabScores, setCollabScores] = useState<any>({ vocal: 53, energy: 64, groove: 86, drop: 83, bass: 63, drums: 68, overall: 70 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(1.5);
  const [duration, setDuration] = useState(3.56);
  const [audioUrl, setAudioUrl] = useState("/audio/Casio-MT-45-16-Beat.wav");
  const [activeTab, setActiveTab] = useState<'upload'|'pool'|'mix'>('upload');
  const [filter, setFilter] = useState<'havuz'|'tum'>('havuz');
  const handleUpload = (files: File[], parsed: any[] = []) => {
    setUploadedFiles(prev => [...prev, ...files]);
    if (parsed.length > 0) {
      setParsedResults(prev => [...prev, ...parsed]);
      const latest = parsed[parsed.length - 1];
      if (latest?.collab) setCollabScores(latest.collab);
      if (latest?.bpm) setDuration(parsed[0].duration || 16);
    }
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
    <div className="h-[100dvh] w-screen overflow-hidden bg-black text-white flex flex-col font-mono">
      {/* Header - fixed */}
      <div className="h-[48px] shrink-0 border-b border-white/[0.08] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-[12px]">S</div>
          <span className="font-bold text-[12px]">SoundGit Studio</span>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[9px]">v44 • Collab Auto Scoring</span>
        </div>
        <button onClick={()=>setLang(lang==='tr'?'en':'tr')} className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px]">{lang.toUpperCase()}</button>
      </div>
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left - flex col, no extra bottom space */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-r border-white/[0.06]">
          {/* Waveform - fixed height */}
          <div className="shrink-0 p-3 border-b border-white/[0.06] space-y-2 bg-[#0a0a0a]">
            <div className="flex items-center gap-3">
              <button onClick={()=>setIsPlaying(!isPlaying)} className="w-8 h-8 shrink-0 rounded-full bg-white text-black flex items-center justify-center text-[12px]">{isPlaying?'■':'▶'}</button>
              <SoundCloudWaveform audioUrl={audioUrl} isPlaying={isPlaying} currentTime={currentTime} duration={duration} onSeek={setCurrentTime} />
              <span className="text-[10px] opacity-50 shrink-0 tabular-nums">{currentTime.toFixed(1)}s / {duration.toFixed(2)}s</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { k:'vocal', i:'◎', v: collabScores.vocal, l:'Vocal' },
                { k:'energy', i:'⚡', v: collabScores.energy, l:'Energy' },
                { k:'groove', i:'◫', v: collabScores.groove, l:'Groove' },
                { k:'drop', i:'▼', v: collabScores.drop, l:'Drop' },
                { k:'bass', i:'◑', v: collabScores.bass, l:'Bass' },
                { k:'drums', i:'◎', v: collabScores.drums, l:'Drums' },
              ].map(b=>(
                <div key={b.k} className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center gap-1 shrink-0">
                  <span className="text-[10px]">{b.i}</span>
                  <span className="text-[9px] opacity-60">{b.l}</span>
                  <span className="text-[9px] font-bold">{b.v}</span>
                </div>
              ))}
              <div className="px-2.5 py-1 rounded-full bg-white text-black text-[9px] font-bold shrink-0">Overall {collabScores.overall}</div>
            </div>
          </div>
          {/* Tabs - fixed */}
          <div className="shrink-0 p-2 flex gap-1 border-b border-white/[0.06]">
            {[
              { id:'upload', label:'UPLOAD' },
              { id:'pool', label:'POOL' },
              { id:'mix', label:'MIX' },
            ].map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)} className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold ${activeTab===tab.id?'bg-white text-black':'bg-white/[0.06] opacity-60'}`}>{tab.label}</button>
            ))}
            <div className="ml-auto flex gap-1">
              <button className="w-6 h-6 rounded-full bg-white text-black text-[10px] flex items-center justify-center">A</button>
              <button className="w-6 h-6 rounded-full bg-white/[0.06] text-[10px]">◍</button>
              <button className="w-6 h-6 rounded-full bg-white/[0.06] text-[10px]">C</button>
              <button className="w-6 h-6 rounded-full bg-white/[0.06] text-[10px]">F</button>
            </div>
          </div>
          {/* Content - flex-1 scroll, NO extra black bottom */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-black">
            {activeTab==='upload' && (
              <>
                <UploadZone onFiles={handleUpload} />
                {parsedResults.length===0 && uploadedFiles.length===0 ? null : (
                  <div className="space-y-2">
                    {uploadedFiles.slice(-2).map((f,i)=> {
                      const r = parsedResults[parsedResults.length-1-i] || parsedResults[0];
                      return (
                        <div key={i} className="p-3 rounded-xl bg-[#121212] border border-white/[0.06] space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px]">♫</div>
                              <div>
                                <div className="text-[11px]">{f.name} • {(f.size/1024/1024).toFixed(2)} MB</div>
                                <div className="text-[9px] opacity-40">Audio • {r?.bpm || 128} BPM • {r?.key || 'F# minor'} • {r?.stem_count || 1} stems • Overall {r?.collab?.overall || collabScores.overall}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-6 h-6 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold">{r?.collab?.overall || 70}</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-bold">BPM {r?.bpm || 128}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.1] text-[9px]">Key {r?.key || 'F# minor'}</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-[9px]">Overall {r?.collab?.overall || 70}</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#00D9FF]/20 text-[9px]">LFM3 ✓</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { l:'Vocal', v: r?.collab?.vocal || collabScores.vocal },
                              { l:'Energy', v: r?.collab?.energy || collabScores.energy },
                              { l:'Groove', v: r?.collab?.groove || collabScores.groove },
                              { l:'Drop', v: r?.collab?.drop || collabScores.drop },
                              { l:'Bass', v: r?.collab?.bass || collabScores.bass },
                              { l:'Drums', v: r?.collab?.drums || collabScores.drums },
                            ].map(s=>(
                              <div key={s.l} className="px-2 py-1.5 rounded-lg bg-black border border-white/[0.06] flex items-center justify-between">
                                <span className="text-[9px] opacity-60">{s.l}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-[50px] h-[2px] bg-white/[0.1] rounded-full overflow-hidden"><div className="h-full bg-white" style={{ width: `${s.v}%` }} /></div>
                                  <span className="text-[9px] font-bold">{s.v}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            {activeTab==='pool' && <div className="text-[11px] opacity-40">Pool • {uploadedFiles.length} files</div>}
            {activeTab==='mix' && <MixTimeline files={uploadedFiles} parsed={parsedResults} bpm={parsedResults[0]?.bpm || 128} currentTime={currentTime} duration={duration} onSeek={setCurrentTime} />}
          </div>
        </div>
        {/* Right - fixed width, flex col, no extra space */}
        <div className="w-[320px] shrink-0 flex flex-col overflow-hidden bg-[#0a0a0a] border-l border-white/[0.06]">
          <div className="shrink-0 p-3">
            <ScoreBoxAnalytics collab={collabScores} />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-3 border-t border-white/[0.06]">
            <LFM3OmniAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}
