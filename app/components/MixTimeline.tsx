"use client";
import { useState, useRef } from "react";
const LANES = [
  { id: 'drums', label: 'Drums', color: 'bg-[#ff4d4d]' },
  { id: 'bass', label: 'Bass', color: 'bg-[#4d8cff]' },
  { id: 'vocal', label: 'Vocal', color: 'bg-[#ffcc4d]' },
  { id: 'drop', label: 'Drop', color: 'bg-[#00ff88]' },
];
export default function MixTimeline({ files, parsed, currentTime, duration, onSeek }: any) {
  const [clips, setClips] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const px = 80;
  const drop = (e: any, laneId: string) => {
    e.preventDefault();
    const name = e.dataTransfer.getData('text/plain');
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - 100 + (ref.current?.scrollLeft || 0);
    const start = Math.max(0, Math.floor((x / px) * 4) / 4);
    const lane = LANES.find(l => l.id === laneId);
    setClips(p => [...p, { id: Date.now() + Math.random(), name, lane: laneId, start, duration: 4, color: lane?.color, score: Math.floor(Math.random()*30+60) }]);
  };
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-black overflow-hidden rounded-xl border border-white/[0.06]">
      <div className="h-6 shrink-0 flex border-b border-white/[0.08] bg-[#0a0a0a]">
        <div className="w-[100px] shrink-0 border-r border-white/[0.08] flex items-center px-2 text-[9px] opacity-40">TIME</div>
        <div className="flex-1 relative overflow-hidden" ref={ref} onClick={(e:any)=>{const r=ref.current?.getBoundingClientRect(); if(!r) return; const x=e.clientX-r.left-100+(ref.current?.scrollLeft||0); onSeek(Math.max(0,x/px));}}>
          <div className="absolute inset-0 flex" style={{ width: `${duration*px}px` }}>{Array.from({ length: Math.ceil(duration) }).map((_, i) => (<div key={i} className="w-[80px] shrink-0 border-r border-white/[0.04] flex items-end pb-1"><span className="text-[8px] opacity-30 ml-1">{i}s</span></div>))}</div>
          <div className="absolute top-0 bottom-0 w-[1px] bg-white z-20 pointer-events-none" style={{ left: `${100 + currentTime*px}px` }}><div className="w-2 h-2 bg-white rounded-full -ml-[3px] -mt-[2px]" /></div>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {LANES.map(lane => (
          <div key={lane.id} className="h-[72px] flex border-b border-white/[0.06]">
            <div className="w-[100px] shrink-0 border-r border-white/[0.08] bg-[#0a0a0a] flex flex-col justify-center px-2"><div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${lane.color}`} /><span className="text-[10px] font-bold">{lane.label}</span></div><span className="text-[8px] opacity-30">{clips.filter((c:any)=>c.lane===lane.id).length} clips</span></div>
            <div className="flex-1 relative bg-[#0f0f0f] hover:bg-[#121212]" style={{ minWidth: `${duration*px}px` }} onDragOver={e=>e.preventDefault()} onDrop={e=>drop(e, lane.id)}>
              {clips.filter((c:any)=>c.lane===lane.id).map((clip:any) => (
                <div key={clip.id} className={`absolute top-[8px] h-[56px] rounded-lg border border-white/10 p-2 flex flex-col justify-between ${clip.color} bg-opacity-30`} style={{ left: `${clip.start*px}px`, width: `${clip.duration*px}px` }}>
                  <div className="flex justify-between"><span className="text-[9px] font-bold truncate">{clip.name}</span><button onClick={()=>setClips(p=>p.filter((c:any)=>c.id!==clip.id))} className="w-3 h-3 rounded-full bg-black/50 text-[8px]">×</button></div>
                  <div className="flex gap-[1px] h-[18px] items-end opacity-60">{Array.from({ length: 20 }).map((_, i)=>(<div key={i} className="w-[2px] bg-white rounded-full" style={{ height: `${Math.random()*80+20}%` }} />))}</div>
                  <div className="flex justify-between"><span className="text-[7px] opacity-60">{clip.start.toFixed(1)}s</span><span className="text-[7px] font-bold bg-white text-black px-1 rounded-full">{clip.score}</span></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="shrink-0 h-[56px] border-t border-white/[0.08] bg-[#0a0a0a] flex items-center gap-2 px-3 overflow-x-auto">
        <span className="text-[9px] opacity-40 shrink-0">POOL → DRAG TO LANE:</span>
        {files.map((f:any,i:number)=>(<div key={i} draggable onDragStart={e=>e.dataTransfer.setData('text/plain', f.name)} className="px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-[9px] cursor-grab shrink-0">♫ {f.name.slice(0,20)} • {parsed[i]?.collab?.overall || 70}</div>))}
        {files.length===0 && <span className="text-[9px] opacity-20">Upload et, sonra buradan lane'e sürükle</span>}
      </div>
    </div>
  );
}
