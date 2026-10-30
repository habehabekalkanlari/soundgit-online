"use client";
import { useState, useEffect, useRef } from "react";
function TimelinePlayer({ bpm }: { bpm: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if(!c) return; const ctx = c.getContext("2d"); if(!ctx) return;
    let raf=0;
    const draw = () => {
      const w=c.width, h=c.height; ctx.clearRect(0,0,w,h);
      ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle="#00ff88"; ctx.lineWidth=2; ctx.beginPath();
      for(let x=0;x<w;x++){ const y=h/2+Math.sin(x*0.02+Date.now()*0.00002*bpm)*(h*0.35); if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
      ctx.stroke(); raf=requestAnimationFrame(draw);
    };
    draw(); return ()=>cancelAnimationFrame(raf);
  }, [bpm]);
  return <canvas ref={canvasRef} width={800} height={140} className="w-full h-[140px] rounded-[12px] bg-[#0a0a0a] border border-zinc-800" />;
}
export default function StudioPage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(()=>{
    try{ const s=localStorage.getItem("soundgit_user"); if(s){ setAuthUser(JSON.parse(s)); setAuthChecked(true); return; }
    const h=window.location.hash; if(h.includes("access_token")){ try{ const p=new URLSearchParams(h.substring(1)); const t=p.get("access_token"); if(t){ const pl=JSON.parse(atob(t.split(".")[1])); const u={email:pl.email, name:pl.user_metadata?.full_name||pl.email}; localStorage.setItem("soundgit_user", JSON.stringify(u)); setAuthUser(u); window.history.replaceState(null,"",window.location.pathname); setAuthChecked(true); return; } }catch{} }
    }catch{} setAuthChecked(true);
  },[]);
  const [track] = useState({name:"Untitled Session", genre:"Tech House", bpm:126, score:82});
  const [active, setActive] = useState<string|null>(null);
  if(!authChecked) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 text-sm">Yükleniyor...</div>;
  if(!authUser) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[360px] rounded-[20px] border border-zinc-800 bg-zinc-900/70 p-7 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">🔒</div>
        <h2 className="text-[18px] font-bold text-white">Studio Kilitli</h2>
        <p className="mt-2 text-[13px] text-zinc-400">Google ile bağlanmadan açılmaz</p>
        <button onClick={()=>window.location.href="/"} className="mt-6 w-full rounded-full bg-white py-2.5 text-[14px] font-semibold text-black">Ana Sayfa</button>
      </div>
    </div>
  );
  const btns=[{id:"vocal",label:"Vocal"},{id:"energy",label:"Energy"},{id:"groove",label:"Groove"},{id:"drop",label:"Drop"},{id:"bass",label:"Bass"},{id:"drums",label:"Drums"}];
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1080px] px-5 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-[8px] bg-white text-black flex items-center justify-center font-bold">S</div><span className="text-[16px] font-semibold">Studio</span></div>
          <div className="flex items-center gap-2"><span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[11px] text-zinc-400">{track.genre} · {track.bpm} BPM</span><span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-black">{track.score}</span></div>
        </div>
        <div className="mt-8"><h1 className="text-[22px] font-bold tracking-tight">{track.name}</h1></div>
        <div className="mt-5"><TimelinePlayer bpm={track.bpm} /></div>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {btns.map(b=>(
            <button key={b.id} onClick={()=>setActive(b.id===active?null:b.id)} className={`flex flex-col items-center justify-center gap-2 rounded-[14px] border py-4 transition ${active===b.id?"border-white bg-white text-black":"border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"}`}>
              <img src={`/icons/${b.id}.png`} alt={b.label} className="h-[22px] w-[22px] object-contain" style={{filter: active===b.id ? "invert(0)" : "invert(1) brightness(1)"}} />
              <span className="text-[11px] font-medium">{b.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
