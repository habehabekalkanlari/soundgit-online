"use client";
export default function ScoreBoxAnalytics({ collab = { vocal: 53, energy: 64, groove: 86, drop: 83, bass: 63, drums: 68, overall: 70 } }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><span className="text-[10px] opacity-50">SCORE</span><span className="px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-bold">110 likes • Top %80</span></div>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06]"><div className="text-[8px] opacity-40">BPM</div><div className="text-[12px] font-bold">128</div><div className="text-[8px] opacity-30">sweet spot</div></div>
        <div className="p-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06]"><div className="text-[8px] opacity-40">Key</div><div className="text-[11px] font-bold">F# minor</div><div className="text-[8px] opacity-30">12 similar</div></div>
        <div className="p-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06]"><div className="text-[8px] opacity-40">LUFS</div><div className="text-[12px] font-bold">-8.2</div><div className="text-[8px] opacity-30">loud</div></div>
      </div>
      <div className="p-3 rounded-lg bg-[#ffcc00]/10 border border-[#ffcc00]/20"><div className="text-[10px] font-bold text-[#ffcc00]">LFM3-Omni-2B:</div><div className="text-[10px] opacity-80 mt-1">Drop'ta punch eksik, transient shaper dene</div><div className="flex gap-1.5 mt-2"><span className="px-2 py-0.5 rounded-full bg-white/[0.1] text-[8px]">Drop 72/100</span><span className="px-2 py-0.5 rounded-full bg-white/[0.1] text-[8px]">+Attack 35%</span><span className="px-2 py-0.5 rounded-full bg-white/[0.1] text-[8px]">Tape Sat</span></div></div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
        {Object.entries(collab).filter(([k])=>k!=='overall').map(([k,v]:any)=><div key={k} className="text-[9px]"><div className="flex justify-between opacity-60"><span className="capitalize">{k}</span><span>{v as any}</span></div><div className="h-[2px] bg-white/[0.1] rounded-full mt-1"><div className="h-full bg-white" style={{ width: `${v as any}%` }} /></div></div>)}
      </div>
    </div>
  );
}
