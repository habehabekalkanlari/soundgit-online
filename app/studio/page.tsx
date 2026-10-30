"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ScoreBoxAnalytics from "../components/ScoreBoxAnalytics";
import LFM3OmniAssistant from "../components/LFM3OmniAssistant";
import SoundCloudWaveform from "../components/SoundCloudWaveform";
import UploadZone from "../components/UploadZone";

export default function Studio() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lang, setLang] = useState<'tr'|'en'>('en');
  const [activeTab, setActiveTab] = useState<'wave'|'pool'|'upload'>('wave');
  const [leftTab, setLeftTab] = useState<'tracks'|'wave'|'upload'>('tracks');
  const [url, setUrl] = useState('/audio/Casio-MT-45-16-Beat.wav');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(16);
  const [mounted, setMounted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedResults, setParsedResults] = useState<any[]>([]);
  const [collabScores, setCollabScores] = useState<any>({ vocal: 82, energy: 76, groove: 88, drop: 72, bass: 79, drums: 85, overall: 80 });
  const handleUpload = (files: File[], parsed: any[] = []) => {
    setUploadedFiles(prev => [...prev, ...files]);
    if (parsed.length > 0) {
      setParsedResults(prev => [...prev, ...parsed]);
      const latest = parsed[parsed.length-1];
      if (latest?.collab) setCollabScores(latest.collab);
    }
  };
  const [parsedResults, setParsedResults] = useState<any[]>([]);
  const [collabScores, setCollabScores] = useState<any>({ vocal: 82, energy: 76, groove: 88, drop: 72, bass: 79, drums: 85, overall: 80 });

  useEffect(() => {
    setMounted(true);
    try {
      const savedLang = localStorage.getItem('soundgit_lang') as any;
      if (savedLang) setLang(savedLang);
    } catch {}
    
    // Preload check real audio
    fetch('/audio/Casio-MT-45-16-Beat.wav', { method: 'HEAD' })
      .then(r => {
        if (!r.ok) setAudioError(`Audio ${r.status} - /audio/Casio-MT-45-16-Beat.wav not found`);
        else setAudioError(null);
      })
      .catch(() => setAudioError('Audio check failed - offline?'));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 16);
      console.log('Audio loaded:', audio.duration, 'src:', audio.src);
    };
    const onEnded = () => setIsPlaying(false);
    const onError = (e: any) => {
      console.error('Audio error:', audio.error, e);
      setAudioError(`Ses yüklenemedi: ${audio.error?.message || 'unknown'} - ${audio.src}`);
    };
    const onCanPlay = () => {
      console.log('Audio can play');
      setAudioError(null);
    };
    
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('canplay', onCanPlay);
    
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [url, customAudioUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // STOP any Web Audio sinus oscillator if exists (cleanup)
    try {
      // @ts-ignore
      if ((window as any).__sinusOsc) {
        // @ts-ignore
        (window as any).__sinusOsc.stop();
        // @ts-ignore
        (window as any).__sinusOsc = null;
      }
    } catch {}
    
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log('Playing:', audio.src);
        audio.volume = 1.0;
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
      }
    } catch (err: any) {
      console.error('Play failed:', err);
      setAudioError(`▶️ Tıkla - tarayıcı engelledi: ${err.message} - tekrar dene`);
      // Fallback muted
      try {
        audio.muted = true;
        await audio.play();
        setTimeout(()=> { audio.muted = false; }, 100);
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

  const [parsedResults, setParsedResults] = useState<any[]>([]);
  const handleUpload = (files: File[], parsed: any[] = []) => {
    setUploadedFiles(prev => [...prev, ...files]);
      }
    }
    // If audio file, create object URL and play
    const audioFile = files.find(f => /\.(wav|mp3|aiff|flac|ogg|m4a)$/i.test(f.name));
    if (audioFile) {
      const objUrl = URL.createObjectURL(audioFile);
      setCustomAudioUrl(objUrl);
      setUrl(objUrl);
      setTimeout(()=> {
        if (audioRef.current) {
          audioRef.current.load();
        }
      }, 100);
    }
  };

  const t = (tr: string, en: string) => lang==='tr'?tr:en;

  if (!mounted) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono text-[11px]">◍ Loading studio...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col select-none overflow-hidden">
      {/* TOP BAR */}
      <div className="h-[56px] border-b border-white/[0.06] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rotate-45 bg-gradient-to-br from-white to-white/40" />
          <span className="text-[13px] font-black tracking-[0.2em]">SOUNDGIT</span>
          <span className="text-[10px] opacity-30 font-mono">STUDIO</span>
          {audioError && <span className="ml-4 text-[10px] px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-200 max-w-[400px] truncate">{audioError}</span>}
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
          <button onClick={()=>setLeftTab('upload')} className={`w-10 h-10 rounded-xl flex items-center justify-center text-[18px] ${leftTab==='upload'?'bg-white text-black':'bg-white/[0.06] hover:bg-white/[0.1]'}`}>↑</button>
          <div className="flex-1" />
          <button className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-[12px]">?</button>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="h-[44px] border-b border-white/[0.06] flex items-center px-4 gap-2">
            <button onClick={()=>setActiveTab('wave')} className={`px-3 h-7 rounded-full text-[11px] font-mono ${activeTab==='wave'?'bg-white text-black':'bg-white/[0.06]'}`}>WAVE • 128</button>
            <button onClick={()=>setActiveTab('pool')} className={`px-3 h-7 rounded-full text-[11px] font-mono ${activeTab==='pool'?'bg-white text-black':'bg-white/[0.06]'}`}>POOL • 101</button>
            <button onClick={()=>setActiveTab('upload')} className={`px-3 h-7 rounded-full text-[11px] font-mono ${activeTab==='upload'?'bg-white text-black':'bg-white/[0.06]'}`}>↑ UPLOAD</button>
            <div className="ml-auto flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-[10px] opacity-40 font-mono">F# minor • 128 • {Math.floor(currentTime)}s / {Math.floor(duration)}s • {customAudioUrl ? 'CUSTOM' : 'CASIO'}</span>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'upload' || leftTab === 'upload' ? (
            <div className="flex-1 overflow-y-auto p-6 bg-[#070707] m-3 rounded-[16px] border border-white/[0.06]">
              <div className="max-w-[700px] mx-auto space-y-6">
                <div>
                  <h2 className="text-[18px] font-bold mb-1">{t('DAW Projesi Yükle','Upload DAW Project')}</h2>
                  <p className="text-[11px] opacity-40 font-mono">{t('Ableton, Logic, Cubase, FL Studio projelerini sürükle','Drag Ableton, Logic, Cubase, FL Studio projects')}</p>
                </div>
                <UploadZone onFiles={handleUpload} />
                {uploadedFiles.length>0 && (
                  <div className="pt-4 border-t border-white/[0.06]">
                    <div className="text-[11px] opacity-40 mb-2 font-mono">{uploadedFiles.length} {t('dosya yüklendi','files uploaded')}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-[#070707] m-3 rounded-[16px] border border-white/[0.06] overflow-hidden">
              <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="w-full max-w-[900px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-[8px] bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[20px]">◍</div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold">{customAudioUrl ? 'Custom Upload' : 'Casio-MT-45-16-Beat.wav'}</div>
                      <div className="text-[10px] opacity-40 font-mono">habehabe • {customAudioUrl ? 'Uploaded' : '0.60MB • 128 BPM • F# minor'} • Real audio, no sinus</div>
                    </div>
                    <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-[22px] hover:scale-105 transition">
                      {isPlaying ? '❚❚' : '▶'}
                    </button>
                  </div>
                  
                  <SoundCloudWaveform 
                    audioUrl={customAudioUrl || url}
                    isPlaying={isPlaying}
                    onSeek={handleSeek}
                    currentTime={currentTime}
                    duration={duration}
                  />
                  
                  <div className="flex items-center justify-between mt-3 text-[11px] font-mono">
                    <div className="flex items-center gap-3 opacity-60">
                      <span>{Math.floor(currentTime/60)}:{String(Math.floor(currentTime%60)).padStart(2,'0')}</span>
                      <span className="opacity-30">/</span>
                      <span>{Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}</span>
                      <span className="ml-3 px-2 py-0.5 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-[9px]">REAL WAV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1]">♡ 110</button>
                      <button onClick={()=>setActiveTab('upload')} className="px-2.5 py-1 rounded-full bg-white hover:bg-white/90 text-black">↑ Upload</button>
                    </div>
                  </div>
                </div>
              </div>

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
          )}

          <div className="h-[64px] border-t border-white/[0.06] flex items-center px-4 gap-3">
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-[16px] hover:scale-105">{isPlaying?'❚❚':'▶'}</button>
            <div className="flex items-center gap-2 text-[11px] font-mono opacity-60">
              <span>128.0</span>
              <span className="opacity-30">BPM</span>
              <span className="w-px h-3 bg-white/20 mx-1" />
              <span>F#</span>
              <span className="opacity-30">•</span>
              <span className="text-[#00ff88]">● {customAudioUrl ? 'CUSTOM' : 'REAL'}</span>
            </div>
            <div className="flex-1 h-[2px] bg-white/[0.06] rounded-full overflow-hidden mx-4">
              <div className="h-full bg-white transition-all" style={{ width: `${duration>0? (currentTime/duration)*100:0}%` }} />
            </div>
            <div className="flex gap-1">
              <button onClick={()=>setActiveTab('upload')} className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1]">↑</button>
              <button className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1]">↺</button>
              <button className="w-8 h-8 rounded-full bg-white text-black">⎙</button>
            </div>
            {/* REAL AUDIO ONLY - NO SINUS */}
            <audio 
              ref={audioRef} 
              src={customAudioUrl || url}
              preload="auto"
              crossOrigin="anonymous"
              playsInline
            />
          </div>
        </div>

        {/* RIGHT RAIL */}
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
                    <div className="text-[9px] opacity-60">{tr.bpm} • {tr.key}</div>
                  </div>
                  <span className="text-[10px] font-mono">{tr.likes}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-3">
            <div className="text-[11px] tracking-widest opacity-40 mb-2">UPLOAD</div>
            <UploadZone onFiles={handleUpload} />
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
