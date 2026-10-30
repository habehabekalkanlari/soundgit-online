"use client";
import { useState, useRef } from "react";

type DAWType = 'ableton'|'logic'|'cubase'|'fl'|'audio'|'unknown';

interface ParsedResult {
  format: string;
  ext: string;
  bpm: number;
  key: string;
  stems: string[];
  stem_count: number;
  file_name: string;
  file_size_mb: string;
  collab?: { vocal: number, energy: number, groove: number, drop: number, bass: number, drums: number, overall: number };
  error?: string;
}

interface UploadFile {
  name: string;
  size: number;
  type: DAWType;
  file: File;
  parsed?: ParsedResult;
  parsing?: boolean;
}

function getDAWType(filename: string): { type: DAWType, icon: string, label: string, color: string } {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const name = filename.toLowerCase();
  if (['als','alp','adg','adv','alc'].includes(ext) || name.includes('ableton')) return { type: 'ableton', icon: 'A', label: 'Ableton Live', color: 'bg-[#00D9FF]/20 border-[#00D9FF]/30' };
  if (['logicx','logic','band'].includes(ext) || name.includes('logic')) return { type: 'logic', icon: '◍', label: 'Logic Pro', color: 'bg-[#FF2D55]/20 border-[#FF2D55]/30' };
  if (['cpr','npr','bak'].includes(ext) || name.includes('cubase')) return { type: 'cubase', icon: 'C', label: 'Cubase', color: 'bg-[#FF9500]/20 border-[#FF9500]/30' };
  if (['flp','fst','fsc'].includes(ext) || name.includes('fl studio') || name.includes('fruity')) return { type: 'fl', icon: 'F', label: 'FL Studio', color: 'bg-[#FFCC00]/20 border-[#FFCC00]/30' };
  if (['wav','mp3','aiff','aif','flac','ogg','m4a'].includes(ext)) return { type: 'audio', icon: '♫', label: 'Audio', color: 'bg-white/[0.06] border-white/[0.1]' };
  return { type: 'unknown', icon: '◫', label: 'Project', color: 'bg-white/[0.06]' };
}

const collabMeta = [
  { k:'vocal', i:'◍', l:'Vocal' },
  { k:'energy', i:'⚡', l:'Energy' },
  { k:'groove', i:'◫', l:'Groove' },
  { k:'drop', i:'▼', l:'Drop' },
  { k:'bass', i:'◑', l:'Bass' },
  { k:'drums', i:'◎', l:'Drums' },
];

export default function UploadZone({ onFiles }: { onFiles?: (files: File[], parsed: ParsedResult[]) => void }) {
  const [isDrag, setIsDrag] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = async (file: File, index: number) => {
    setFiles(prev => prev.map((f,i) => i===index ? { ...f, parsing: true } : f));
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/parse', { method: 'POST', body: fd });
      const data = await res.json() as ParsedResult;
      setFiles(prev => prev.map((f,i) => i===index ? { ...f, parsed: data, parsing: false } : f));
      const allParsed = [...files.map(f=>f.parsed).filter(Boolean), data] as ParsedResult[];
      onFiles?.(files.map(f=>f.file), allParsed);
      return data;
    } catch {
      setFiles(prev => prev.map((f,i) => i===index ? { ...f, parsing: false } : f));
      return null;
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map(f => ({ name: f.name, size: f.size, type: getDAWType(f.name).type, file: f, parsing: false }));
    const startIndex = files.length;
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach((uf, idx) => parseFile(uf.file, startIndex + idx));
    onFiles?.(Array.from(fileList), []);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {[
          { id: 'ableton', icon: 'A', label: 'Ableton' },
          { id: 'logic', icon: '◍', label: 'Logic' },
          { id: 'cubase', icon: 'C', label: 'Cubase' },
          { id: 'fl', icon: 'F', label: 'FL Studio' },
        ].map(daw => (
          <div key={daw.id} className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center gap-1.5 text-[10px] font-mono">
            <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[9px] font-bold">{daw.icon}</span>
            <span className="opacity-70">{daw.label}</span>
          </div>
        ))}
      </div>

      <div
        onDragOver={(e)=>{ e.preventDefault(); setIsDrag(true); }}
        onDragLeave={()=>setIsDrag(false)}
        onDrop={(e)=>{ e.preventDefault(); setIsDrag(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
        onClick={()=>inputRef.current?.click()}
        className={`group relative border border-dashed rounded-[16px] p-6 text-center cursor-pointer transition-all ${isDrag ? 'border-white bg-white/[0.04] scale-[1.02]' : 'border-white/[0.12] hover:border-white/[0.25] hover:bg-white/[0.02]'}`}
      >
        <input ref={inputRef} type="file" multiple accept=".als,.logicx,.cpr,.flp,.wav,.mp3,.aiff,.flac,.ogg,.m4a,.logic,.band,.fst,.alc,.adg" className="hidden" onChange={(e)=> e.target.files && handleFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-[18px] group-hover:scale-110 transition">↑</div>
          <div className="space-y-1">
            <div className="text-[13px] font-bold">Drop → Auto Collab Scoring</div>
            <div className="text-[11px] opacity-40 font-mono">.als .flp → vocal/energy/groove/drop/bass/drums</div>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {collabMeta.map(c=>(
              <span key={c.k} className="px-2 py-1 rounded-full bg-white/[0.06] text-[9px] flex items-center gap-1"><span>{c.i}</span>{c.l}</span>
            ))}
          </div>
        </div>
      </div>

      {files.length>0 && (
        <div className="space-y-2">
          {files.map((f,i)=>{
            const info = getDAWType(f.name);
            const p = f.parsed;
            const c = p?.collab;
            return (
              <div key={i} className={`px-3 py-3 rounded-xl border ${info.color}`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">{info.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono truncate">{f.name} • {(f.size/1024/1024).toFixed(2)} MB</div>
                    <div className="text-[9px] opacity-50">{info.label} {f.parsing ? '• Scoring...' : p ? `• ${p.bpm} BPM • ${p.key} • ${p.stem_count} stems • Overall ${c?.overall || 0}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {f.parsing && <div className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin" />}
                    {c && <span className="px-2 py-1 rounded-full bg-white text-black text-[9px] font-bold">{c.overall}</span>}
                    <button onClick={(e)=>{ e.stopPropagation(); setFiles(files.filter((_,j)=>j!==i)); }} className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px]">✕</button>
                  </div>
                </div>
                {p && c && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="px-2 py-1 rounded-full bg-white text-black text-[9px] font-bold">BPM {p.bpm}</span>
                      <span className="px-2 py-1 rounded-full bg-white/[0.1] text-[9px]">Key {p.key}</span>
                      <span className="px-2 py-1 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-[9px]">Overall {c.overall}</span>
                      <span className="px-2 py-1 rounded-full bg-[#00D9FF]/20 text-[9px]">LFM3 ✓</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {collabMeta.map(meta=>{
                        const score = c[meta.k as keyof typeof c] as number;
                        const bar = Math.round((score/100)*100);
                        return (
                          <div key={meta.k} className="px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] flex items-center gap-1"><span>{meta.i}</span>{meta.l}</span>
                              <span className="text-[10px] font-mono font-bold">{score}</span>
                            </div>
                            <div className="h-[3px] bg-white/[0.08] rounded-full overflow-hidden">
                              <div className="h-full bg-white transition-all" style={{ width: `${bar}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {p.stems.map((s,j)=>(<span key={j} className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[9px] font-mono">{s}</span>))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
