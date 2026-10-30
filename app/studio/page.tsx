"use client";
import { useState, useEffect, useRef } from "react";

// Minimal Studio - sadece işe yarayanlar + iconlar
type Track = { id: string; name: string; genre: string; bpm: number; score: number };

function TimelinePlayer({ bpm }: { bpm: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0,0,w,h);
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1;
      for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(0, h*0.25*i); ctx.lineTo(w, h*0.25*i); ctx.stroke(); }
      // waveform
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for(let x=0;x<w;x++){
        const y = h/2 + Math.sin(x*0.02 + Date.now()*0.00002*bpm)* (h*0.3) * Math.sin(x*0.01);
        if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [bpm]);
  return <canvas ref={canvasRef} width={800} height={160} className="w-full h-[160px] rounded-[12px] bg-[#0a0a0a] border border-zinc-800" />;
}

export default function StudioPage() {
  // Auth Guard - minimal
  const [authUser, setAuthUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soundgit_user");
      if (saved) { setAuthUser(JSON.parse(saved)); setAuthChecked(true); return; }
      const h = window.location.hash;
      if (h.includes("access_token")) {
        try {
          const p = new URLSearchParams(h.substring(1));
          const t = p.get("access_token");
          if (t) {
            const payload = JSON.parse(atob(t.split(".")[1]));
            const u = { email: payload.email, name: payload.user_metadata?.full_name || payload.email };
            localStorage.setItem("soundgit_user", JSON.stringify(u));
            setAuthUser(u);
            window.history.replaceState(null, "", window.location.pathname);
            setAuthChecked(true); return;
          }
        } catch {}
      }
    } catch {}
    setAuthChecked(true);
  }, []);

  const [track] = useState<Track>({ id: "1", name: "Untitled Session", genre: "Tech House", bpm: 126, score: 82 });
  const [active, setActive] = useState<string | null>(null);

  if (!authChecked) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 text-sm">Yükleniyor...</div>;
  if (!authUser) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[360px] rounded-[20px] border border-zinc-800 bg-zinc-900/70 p-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">🔒</div>
          <h2 className="text-[18px] font-bold text-white">Studio Kilitli</h2>
          <p className="mt-2 text-[13px] text-zinc-400">Google ile bağlanmadan studio açılmaz</p>
          <button onClick={() => (window.location.href = "/")} className="mt-6 w-full rounded-full bg-white py-2.5 text-[14px] font-semibold text-black">Ana Sayfaya Dön</button>
        </div>
      </div>
    );
  }

  const buttons = [
    { id: "vocal", label: "Vocal" },
    { id: "energy", label: "Energy" },
    { id: "groove", label: "Groove" },
    { id: "drop", label: "Drop" },
    { id: "bass", label: "Bass" },
    { id: "drums", label: "Drums" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1080px] px-5 py-6">
        {/* Header - minimal, no unnecessary text */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[8px] bg-white text-black flex items-center justify-center font-bold">S</div>
            <span className="text-[16px] font-semibold tracking-tight">Studio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[11px] text-zinc-400">{track.genre} · {track.bpm} BPM</span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-black">{track.score}</span>
          </div>
        </div>

        {/* Track name - only essential */}
        <div className="mt-8">
          <h1 className="text-[22px] font-bold tracking-tight">{track.name}</h1>
        </div>

        {/* Timeline - waveform only */}
        <div className="mt-5">
          <TimelinePlayer bpm={track.bpm} />
        </div>

        {/* 6 Collab Actions - white line icons */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {buttons.map((b) => (
            <button
              key={b.id}
              onClick={() => setActive(b.id === active ? null : b.id)}
              className={`group flex flex-col items-center justify-center gap-2 rounded-[14px] border py-4 transition ${active === b.id ? "border-white bg-white text-black" : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"}`}
            >
              <img src={`/icons/${b.id}.png`} alt={b.label} className={`h-[22px] w-[22px] ${active === b.id ? "" : "invert opacity-80 group-hover:opacity-100"} `} />
              <span className="text-[11px] font-medium tracking-wide">{b.label}</span>
            </button>
          ))}
        </div>

        {/* Comments - minimal */}
        <div className="mt-8 rounded-[14px] border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-zinc-400">Collab Feed</span>
            <span className="text-[11px] text-zinc-500">{active ? `${active} active` : "idle"}</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="rounded-[10px] bg-black/50 border border-zinc-800/50 p-3 text-[12px] text-zinc-300">Drop at 1:24 hits hard - needs sidechain on bass.</div>
            <div className="rounded-[10px] bg-black/50 border border-zinc-800/50 p-3 text-[12px] text-zinc-400">Add vocal chop in break, keep it minimal.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
