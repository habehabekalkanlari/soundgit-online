"use client";
import { useEffect, useRef, useState } from "react";
const DICT = {
  tr: { subtitle: "Prod\u00fckt\u00f6rler i\u00e7in Bounce Versiyon Kontrol\u00fc", openStudio: "St\u00fcdyoyu A\u00e7", github: "GitHub", donate: "Ba\u011f\u0131\u015f Yap", login: "Giri\u015f" },
  en: { subtitle: "Bounce Version Control for Producers", openStudio: "Open Studio", github: "GitHub", donate: "Donate", login: "Login" }
};
export default function Home(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [lang,setLang]=useState<"tr"|"en">("en");
  const [isAuthed,setIsAuthed]=useState(false);
  const t=DICT[lang];
  useEffect(()=>{
    const s=localStorage.getItem("soundgit_lang") as any; if(s) setLang(s);
    const u=localStorage.getItem("soundgit_user")||localStorage.getItem("access_token")||localStorage.getItem("google_user");
    setIsAuthed(!!u);
    if(typeof window!=="undefined" && window.location.hash && window.location.hash.includes("access_token")){
      const params=new URLSearchParams(window.location.hash.substring(1));
      const token=params.get("access_token");
      if(token){ localStorage.setItem("soundgit_user", JSON.stringify({token, time:Date.now()})); localStorage.setItem("access_token", token); window.history.replaceState({}, document.title, window.location.pathname); setIsAuthed(true); }
    }
  },[]);
  const toggleLang=()=>{ const n=lang==="tr"?"en":"tr"; setLang(n as any); localStorage.setItem("soundgit_lang", n); };
  const handleOpenStudio=()=>{
    const user=localStorage.getItem("soundgit_user")||localStorage.getItem("access_token")||localStorage.getItem("google_user");
    if(user){ window.location.href="/studio"; } else { window.location.href="/api/auth/login"; }
  };
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d",{alpha:true}) as any; if(!ctx) return;
    let raf=0,time=0;
    const resize=()=>{ canvas.width=window.innerWidth*2; canvas.height=window.innerHeight*2; (canvas.style as any).width=window.innerWidth+"px"; (canvas.style as any).height=window.innerHeight+"px"; };
    resize(); window.addEventListener("resize", resize);
    const waves=[{color:"#00ff88",amp:80,freq:0.002,speed:0.000022,yOffset:0},{color:"#0088ff",amp:60,freq:0.0015,speed:0.000018,yOffset:20},{color:"#ff0088",amp:50,freq:0.0018,speed:0.000015,yOffset:-15},{color:"#00e5ff",amp:40,freq:0.0012,speed:0.00002,yOffset:10}];
    const draw=()=>{ time+=1; ctx.clearRect(0,0,canvas.width,canvas.height); const centerY=canvas.height/2; waves.forEach((w:any)=>{ ctx.beginPath(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.shadowBlur=18; ctx.shadowColor=w.color; for(let x=0;x<canvas.width;x+=2){ const y=centerY+w.yOffset*2+Math.sin(x*w.freq+time*w.speed*1000)*w.amp*2; if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke(); ctx.shadowBlur=0;}); raf=requestAnimationFrame(draw);}; draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  },[]);
  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-white">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3"><div className="w-7 h-7 rotate-45 bg-gradient-to-br from-[#00ff88] to-[#0088ff] shadow-[0_0_20px_#00ff88]" /><span className="font-black tracking-[0.2em] text-xs opacity-70">SOUNDGIT</span></div>
        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-[11px] font-bold tracking-widest hover:bg-white/20 transition">{lang==="tr"?"EN":"TR"}</button>
          <a href="https://github.com/sponsors" target="_blank" className="hidden md:block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] hover:bg-white/10 transition">{t.donate}</a>
          {isAuthed ? <button onClick={()=>{localStorage.clear(); setIsAuthed(false); window.location.reload();}} className="px-4 py-1.5 rounded-full bg-white/10 text-white text-[11px] font-bold hover:bg-white/20 transition">Cikis</button> : <a href="/api/auth/login" className="px-4 py-1.5 rounded-full bg-white text-black text-[11px] font-bold hover:bg-white/90 transition">{t.login}</a>}
        </div>
      </header>
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-3 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">SOUNDGIT</h1>
        <p className="text-[13px] md:text-sm font-mono tracking-widest opacity-50 mb-10 max-w-xl">{t.subtitle}</p>
        <div className="flex gap-3">
          <button onClick={handleOpenStudio} className="px-7 py-3.5 rounded-full bg-white text-black font-bold text-[13px] hover:scale-[1.02] transition">→ {t.openStudio}</button>
          <a href="https://github.com/habehabekalkanlari/soundgit-online" target="_blank" className="px-7 py-3.5 rounded-full bg-white/10 border border-white/20 backdrop-blur font-bold text-[13px] hover:bg-white/15 transition">{t.github}</a>
        </div>
        <p className="mt-8 text-[10px] opacity-30 font-mono">{isAuthed ? "✓ Google authorized · Studio unlocked" : "🔒 Google login required · Open Studio will ask Google auth"}</p>
      </main>
    </div>
  );
}
