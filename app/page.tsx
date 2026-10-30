"use client";
import { useEffect, useRef, useState } from "react";

const DICT = {
  tr: {
    subtitle: "Prodüktörler için Bounce Versiyon Kontrolü",
    openStudio: "Stüdyoyu Aç",
    github: "GitHub",
    donate: "Bağış Yap",
    login: "Giriş",
    langLabel: "TR"
  },
  en: {
    subtitle: "Bounce Version Control for Producers",
    openStudio: "Open Studio",
    github: "GitHub",
    donate: "Donate",
    login: "Login",
    langLabel: "EN"
  }
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lang, setLang] = useState<"tr"|"en">("en");
  const t = DICT[lang];

  useEffect(() => {
    const saved = localStorage.getItem("soundgit_lang") as "tr"|"en"|null;
    if (saved) setLang(saved);
  }, []);

  const toggleLang = () => {
    const next = lang === "tr" ? "en" : "tr";
    setLang(next);
    localStorage.setItem("soundgit_lang", next);
  };

  // Sinus animation - slow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let raf = 0;
    let time = 0;
    const resize = () => {
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const waves = [
      { color: "#00ff88", amp: 80, freq: 0.002, speed: 0.000022, yOffset: 0 },
      { color: "#0088ff", amp: 60, freq: 0.0015, speed: 0.000018, yOffset: 20 },
      { color: "#ff0088", amp: 50, freq: 0.0018, speed: 0.000015, yOffset: -15 },
      { color: "#00e5ff", amp: 40, freq: 0.0012, speed: 0.00002, yOffset: 10 },
    ];

    const draw = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;
      waves.forEach((w) => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = w.color;
        for (let x = 0; x < canvas.width; x += 2) {
          const y = centerY + w.yOffset*2 + Math.sin(x * w.freq + time * w.speed * 1000) * w.amp * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-white">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Top Bar with Lang Toggle */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rotate-45 bg-gradient-to-br from-[#00ff88] to-[#0088ff] shadow-[0_0_20px_#00ff88]" />
          <span className="font-black tracking-widest text-sm opacity-80">SOUNDGIT</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold tracking-widest hover:bg-white/20 transition"
            title="Dil değiştir / Change language"
          >
            {lang === "tr" ? "EN" : "TR"} · {t.langLabel}
          </button>
          <a href="https://github.com/sponsors" target="_blank" className="hidden md:block px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs hover:bg-white/20">
            {t.donate}
          </a>
          <a href="/api/auth/login" className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90">
            {t.login}
          </a>
        </div>
      </header>

      {/* Center */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-4 drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
          SOUNDGIT
        </h1>
        <p className="text-sm md:text-lg font-mono tracking-widest opacity-60 mb-10">
          {t.subtitle}
        </p>
        <div className="flex gap-4">
          <a href="/studio" className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition">
            → {t.openStudio}
          </a>
          <a href="https://github.com" target="_blank" className="px-8 py-4 rounded-full bg-white/10 border border-white/20 backdrop-blur font-bold text-sm hover:bg-white/20 transition">
            {t.github}
          </a>
        </div>
      </main>
    </div>
  );
}
