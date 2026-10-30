"use client";
import { useEffect, useRef, useState } from "react";
function SineCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const layers = [
      { rgb: "0, 255, 136", amp: 44, len: 640, speed: 0.00035, width: 2.2, alpha: 0.9, blur: 20, phase: 0.0 },
      { rgb: "0, 136, 255", amp: 58, len: 780, speed: 0.00028, width: 2.0, alpha: 0.75, blur: 18, phase: 1.9 },
      { rgb: "255, 0, 136", amp: 36, len: 520, speed: 0.00042, width: 1.9, alpha: 0.7, blur: 18, phase: 3.6 },
      { rgb: "0, 229, 255", amp: 68, len: 900, speed: 0.00022, width: 1.7, alpha: 0.6, blur: 16, phase: 5.2 },
    ];
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const midY = h / 2;
      ctx.globalCompositeOperation = "lighter";
      for (const L of layers) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${L.rgb}, ${L.alpha})`;
        ctx.lineWidth = L.width;
        ctx.shadowColor = `rgba(${L.rgb}, 0.85)`;
        ctx.shadowBlur = L.blur;
        const k = (Math.PI * 2) / L.len;
        const phase = t * L.speed + L.phase;
        for (let x = -8; x <= w + 8; x += 2) {
          const y = midY + Math.sin(x * k - phase) * L.amp + Math.sin(x * k * 0.5 - phase * 0.7) * L.amp * 0.22;
          if (x === -8) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { draw(1200); return () => ro.disconnect(); }
    const loop = (t: number) => { draw(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
function DiamondLogo({ size, glowClass }: { size: number; glowClass?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={glowClass} aria-hidden="true">
      <rect x="22" y="22" width="56" height="56" rx="7" transform="rotate(45 50 50)" fill="rgba(10,10,10,0.55)" stroke="#ffffff" strokeWidth="3.4" />
      <line x1="36" y1="42" x2="64" y2="42" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="36" y1="52" x2="64" y2="52" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="36" y1="62" x2="64" y2="62" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="55" cy="42" r="3.6" fill="#ffffff" />
      <circle cx="45" cy="52" r="3.6" fill="#ffffff" />
      <circle cx="58" cy="62" r="3.6" fill="#ffffff" />
    </svg>
  );
}
export default function Home() {
  const [activeNav, setActiveNav] = useState("Explore");
  const [panel, setPanel] = useState<"donate" | "google" | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [donated, setDonated] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [heroAction, setHeroAction] = useState<"studio" | "github" | null>(null);
  const togglePanel = (p: "donate" | "google") => setPanel((cur) => (cur === p ? null : p));
  const NAV = ["Explore", "Repositories", "Branches", "Activity"];
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-clip bg-black">
      <style>{`:root{--muted:#9a9aa2} .logo-glow{filter:drop-shadow(0 0 18px rgba(255,255,255,0.5))} .logo-glow-sm{filter:drop-shadow(0 0 10px rgba(255,255,255,0.4))}`}</style>
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/70 backdrop-blur-md">
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <div className="flex shrink-0 items-center gap-2.5">
            <DiamondLogo size={26} glowClass="logo-glow-sm" />
            <span className="text-[17px] tracking-tight"><span className="font-light text-[#c9c9ce]">sound</span><span className="font-bold text-white">git</span></span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <nav className="mr-2 hidden items-center gap-7 lg:flex">
              {NAV.map((item) => (
                <button key={item} type="button" onClick={() => setActiveNav(item)} className={activeNav === item ? "text-[13px] font-medium text-white" : "text-[13px] text-[#9a9aa2] hover:text-white"}>{item}</button>
              ))}
            </nav>
            <button type="button" onClick={() => togglePanel("donate")} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#9a9aa2] hover:text-white">Donate</button>
            <button type="button" onClick={() => togglePanel("google")} className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black">Google Giris</button>
          </div>
          {panel === "donate" && (
            <div className="absolute right-5 top-[calc(100%+10px)] z-40 w-64 rounded-xl border border-white/10 bg-[#111114] p-4">
              <p className="text-[13px] font-medium text-white">Destekle</p>
              {donated ? <p className="mt-3 text-[13px] text-[#7dffb8]">Tesekkurler!</p> : (
                <>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">{[3,5,10].map((v) => (<button key={v} onClick={() => setAmount(v)} className={`rounded-lg border py-1.5 text-[13px] ${amount === v ? "border-[#00ff88]/60 bg-[#00ff88]/10 text-[#7dffb8]" : "border-white/10 text-[#9a9aa2]"}`}>${v}</button>))}</div>
                  <button disabled={amount === null} onClick={() => setDonated(true)} className="mt-2.5 w-full rounded-lg bg-white py-2 text-[13px] font-medium text-black">{amount ? `$${amount} bagisla` : "Tutar sec"}</button>
                </>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
        <SineCanvas />
        <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6">
          <DiamondLogo size={104} glowClass="logo-glow h-[68px] w-[68px] sm:h-[104px] sm:w-[104px]" />
          <h1 className="text-[42px] font-extrabold uppercase tracking-tight text-white sm:text-7xl">Soundgit</h1>
        </div>
        <p className="relative z-10 mt-5 text-center text-sm text-[#9a9aa2]">Bounce Version-Control for Producers</p>
        <div className="relative z-10 mt-9 flex gap-3">
          <button onClick={() => setHeroAction("studio")} className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black">Open Studio</button>
          <button onClick={() => setHeroAction("github")} className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black">GitHub</button>
        </div>
      </main>
    </div>
  );
}
