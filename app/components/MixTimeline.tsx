"use client";
import { useState, useRef } from "react";
interface Clip {
  id: string;
  name: string;
  lane: string;
  start: number;
  duration: number;
  color: string;
  score: number;
}
const LANES = [
  { id: 'drums', label: 'Drums', color: 'bg-[#ff4d4d]' },
  { id: 'bass', label: 'Bass', color: 'bg-[#4d8cff]' },
  { id: 'vocal', label: 'Vocal', color: 'bg-[#ffcc4d]' },
  { id: 'drop', label: 'Drop', color: 'bg-[#00ff88]' },
];
export default function MixTimeline({ files, parsed, currentTime, duration, onSeek }: any) {
  const [clips, setClips] = useState<Clip[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const pixelsPerSecond = 80;
  const handleDrop = (e: React.DragEvent, laneId: string) => {
    e.preventDefault();
    const fileName = e.dataTransfer.getData('text/plain');
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left + (timelineRef.current?.scrollLeft || 0) - 100;
    const startTime = Math.max(0, x / pixelsPerSecond);
    const lane = LANES.find(l => l.id === laneId);
    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      name: fileName || `Clip ${clips.length + 1}`,
      lane: laneId,
      start: Math.floor(startTime * 4) / 4,
      duration: 4,
      color: lane?.color || 'bg-white',
      score: Math.floor(Math.random() * 30 + 60)
    };
    setClips(prev => [...prev, newClip]);
  };
  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left + (timelineRef.current?.scrollLeft || 0) - 100;
    const t = Math.max(0, x / pixelsPerSecond);
    onSeek(Math.min(t, duration));
  };
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-black overflow-hidden">
      <div className="h-6 shrink-0 flex border-b border-white/[0.08] bg-[#0a0a0a]">
        <div className="w-[100px] shrink-0 border-r border-white/[0.08] flex items-center px-2 text-[9px] opacity-40">TIME</div>
        <div className="flex-1 relative overflow-hidden" ref={timelineRef} onClick={handleTimelineClick}>
          <div className="absolute inset-0 flex" style={{ width: `${duration * pixelsPerSecond}px` }}>
            {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
              <div key={i} className="w-[80px] shrink-0 border-r border-white/[0.04] flex items-end pb-1"><span className="text-[8px] opacity-30 ml-1">{i}s</span></div>
            ))}
          </div>
          <div className="absolute top-0 bottom-0 w-[1px] bg-white z-20 pointer-events-none" style={{ left: `${100 + currentTime * pixelsPerSecond}px` }}>
            <div className="w-2 h-2 bg-white rounded-full -ml-[3px] -mt-[2px]" />
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {LANES.map(lane => (
          <div key={lane.id} className="h-[72px] flex border-b border-white/[0.06] group/lane">
            <div className="w-[100px] shrink-0 border-r border-white/[0.08] bg-[#0a0a0a] flex flex-col justify-center px-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${lane.color}`} />
                <span className="text-[10px] font-bold">{lane.label}</span>
              </div>
              <span className="text-[8px] opacity-30">{clips.filter(c=>c.lane===lane.id).length} clips</span>
            </div>
            <div className="flex-1 relative bg-[#0f0f0f] group-hover/lane:bg-[#121212]" style={{ width: `${duration * pixelsPerSecond}px`, minWidth: `${duration * pixelsPerSecond}px` }} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e, lane.id)}>
              <div className="absolute inset-0 flex pointer-events-none">
                {Array.from({ length: Math.ceil(duration * 2) }).map((_, i) => (<div key={i} className="w-[40px] shrink-0 border-r border-white/[0.03]" />))}
              </div>
              {clips.filter(c=>c.lane===lane.id).map(clip => (
                <div key={clip.id} className={`absolute top-[8px] h-[56px] rounded-lg border border-white/10 flex flex-col justify-between p-2 cursor-grab ${clip.color} bg-opacity-30`} style={{ left: `${clip.start * pixelsPerSecond}px`, width: `${clip.duration * pixelsPerSecond}px` }} draggable onDragStart={e=>e.dataTransfer.setData('text/plain', clip.name)}>
                  <div className="flex items-center justify-between"><span className="text-[9px] font-bold truncate">{clip.name}</span><button onClick={()=>setClips(prev=>prev.filter(c=>c.id!==clip.id))} className="w-3 h-3 rounded-full bg-black/50 text-[8px]">×</button></div>
                  <div className="flex gap-[1px] h-[18px] items-end opacity-60">{Array.from({ length: 24 }).map((_, i)=>(<div key={i} className="w-[2px] bg-white rounded-full" style={{ height: `${Math.random()*80+20}%` }} />))}</div>
                  <div className="flex items-center justify-between"><span className="text-[7px] opacity-60">{clip.start.toFixed(2)}s</span><span className="text-[7px] font-bold bg-white text-black px-1 rounded-full">{clip.score}</span></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="shrink-0 h-[64px] border-t border-white/[0.08] bg-[#0a0a0a] flex items-center gap-2 px-3 overflow-x-auto">
        <span className="text-[9px] opacity-40 shrink-0">POOL → DRAG TO LANE:</span>
        {files.map((f:any,i:number)=>(
          <div key={i} draggable onDragStart={e=>e.dataTransfer.setData('text/plain', f.name)} className="px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-[9px] cursor-grab shrink-0 flex items-center gap-1.5">
            <span>♫</span>{f.name.slice(0,18)}
            <span className="px-1 rounded-full bg-white text-black text-[7px]">{parsed[i]?.collab?.overall || 70}</span>
          </div>
        ))}
        {files.length===0 && <span className="text-[9px] opacity-20">Upload wav/mp3/.als/.flp to add to mix</span>}
      </div>
    </div>
  );
}
