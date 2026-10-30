"use client";
import { useEffect, useState } from 'react';

export default function ScoreBoxAnalytics({ lang = 'en' }: { lang?: 'tr' | 'en' }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[11px] opacity-60">Loading analytics...</div>;
  if (!data) return null;

  const casio = data.casio || {};
  const perc = Math.round(data.top_percentile || 80);
  const similar = data.similar_count || 12;

  return (
    <div className="border border-white/10 rounded-xl p-3 bg-white/[0.02] space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] uppercase tracking-widest opacity-50">{lang === 'tr' ? 'Skor' : 'Score'}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-black font-mono">{casio.likes || 110} likes • Top %{perc}</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
        <div className="bg-white/[0.04] rounded p-2">
          <div className="opacity-40">BPM</div>
          <div className="text-[13px] font-bold">{casio.bpm || 128}</div>
          <div className="opacity-30 text-[9px]">sweet spot</div>
        </div>
        <div className="bg-white/[0.04] rounded p-2">
          <div className="opacity-40">Key</div>
          <div className="text-[13px] font-bold">{casio.key_normalized || 'F# minor'}</div>
          <div className="opacity-30 text-[9px]">{similar} similar</div>
        </div>
        <div className="bg-white/[0.04] rounded p-2">
          <div className="opacity-40">LUFS</div>
          <div className="text-[13px] font-bold">{data.lfs?.lufs || -8.2}</div>
          <div className="opacity-30 text-[9px]">loud</div>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-[11px]">
        <div className="font-bold text-yellow-200/80">LFM3-Omni-2B:</div>
        <div className="opacity-80 mt-0.5">{data.lfs?.recommendation || "Drop'ta punch eksik, transient shaper dene"}</div>
        <div className="mt-1.5 flex gap-1">
          <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px]">Drop 72/100</span>
          <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px]">+Attack 35%</span>
          <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px]">Tape Sat</span>
        </div>
      </div>

      <div className="text-[9px] opacity-30 font-mono">
        DuckDB: {similar} track → Top %{perc} • Polars: F# minor avg {Math.round(data.similar_avg_likes||58)} likes → sen {casio.likes}
      </div>
    </div>
  );
}
