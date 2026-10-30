"use client";
import { useState, useRef } from "react";

type DAWType = 'ableton'|'logic'|'cubase'|'fl'|'audio'|'unknown';

interface UploadFile {
  name: string;
  size: number;
  type: DAWType;
  file: File;
}

function getDAWType(filename: string): { type: DAWType, icon: string, label: string, color: string } {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const name = filename.toLowerCase();
  
  // Ableton
  if (['als','alp','adg','adv','alc'].includes(ext) || name.includes('ableton')) {
    return { type: 'ableton', icon: 'A', label: 'Ableton Live', color: 'bg-[#00D9FF]/20 border-[#00D9FF]/30' };
  }
  // Logic
  if (['logicx','logic','band'].includes(ext) || name.includes('logic')) {
    return { type: 'logic', icon: '◍', label: 'Logic Pro', color: 'bg-[#FF2D55]/20 border-[#FF2D55]/30' };
  }
  // Cubase
  if (['cpr','npr','bak'].includes(ext) || name.includes('cubase')) {
    return { type: 'cubase', icon: 'C', label: 'Cubase', color: 'bg-[#FF9500]/20 border-[#FF9500]/30' };
  }
  // FL Studio
  if (['flp','fst','fsc'].includes(ext) || name.includes('fl studio') || name.includes('fruity')) {
    return { type: 'fl', icon: 'F', label: 'FL Studio', color: 'bg-[#FFCC00]/20 border-[#FFCC00]/30' };
  }
  // Audio
  if (['wav','mp3','aiff','aif','flac','ogg','m4a','mp4','mov'].includes(ext)) {
    return { type: 'audio', icon: '♫', label: 'Audio', color: 'bg-white/[0.06] border-white/[0.1]' };
  }
  return { type: 'unknown', icon: '◫', label: 'Project', color: 'bg-white/[0.06]' };
}

export default function UploadZone({ onFiles }: { onFiles?: (files: File[]) => void }) {
  const [isDrag, setIsDrag] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map(f => {
      const info = getDAWType(f.name);
      return { name: f.name, size: f.size, type: info.type, file: f };
    });
    setFiles(prev => [...prev, ...newFiles]);
    onFiles?.(Array.from(fileList));
  };

  return (
    <div className="w-full space-y-3">
      {/* DAW selector chips - minimal icon */}
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

      {/* Drop zone - SoundCloud style */}
      <div
        onDragOver={(e)=>{ e.preventDefault(); setIsDrag(true); }}
        onDragLeave={()=>setIsDrag(false)}
        onDrop={(e)=>{
          e.preventDefault();
          setIsDrag(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={()=>inputRef.current?.click()}
        className={`group relative border border-dashed rounded-[16px] p-6 text-center cursor-pointer transition-all
          ${isDrag ? 'border-white bg-white/[0.04] scale-[1.02]' : 'border-white/[0.12] hover:border-white/[0.25] hover:bg-white/[0.02]'}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".als,.logicx,.cpr,.flp,.wav,.mp3,.aiff,.flac,.ogg,.m4a,.logic,.band,.fst,.alc,.adg"
          className="hidden"
          onChange={(e)=> e.target.files && handleFiles(e.target.files)}
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-[18px] group-hover:scale-110 transition">↑</div>
          <div className="space-y-1">
            <div className="text-[13px] font-bold">Drop DAW project or audio</div>
            <div className="text-[11px] opacity-40 font-mono">.als .logicx .cpr .flp .wav .mp3 —  or click to browse</div>
          </div>
          <div className="flex gap-1.5">
            <span className="px-2 py-1 rounded-full bg-white/[0.06] text-[9px]">Ableton</span>
            <span className="px-2 py-1 rounded-full bg-white/[0.06] text-[9px]">Logic</span>
            <span className="px-2 py-1 rounded-full bg-white/[0.06] text-[9px]">Cubase</span>
            <span className="px-2 py-1 rounded-full bg-white/[0.06] text-[9px]">FL</span>
          </div>
        </div>
      </div>

      {/* Uploaded list */}
      {files.length>0 && (
        <div className="space-y-1.5">
          {files.map((f,i)=>{
            const info = getDAWType(f.name);
            return (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${info.color}`}>
                <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">{info.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono truncate">{f.name}</div>
                  <div className="text-[9px] opacity-50">{info.label} • {(f.size/1024/1024).toFixed(2)} MB</div>
                </div>
                <button onClick={(e)=>{ e.stopPropagation(); setFiles(files.filter((_,j)=>j!==i)); }} className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px]">✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
