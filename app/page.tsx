"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Github, Heart, Play, User, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Old homepage animation — multi-colour sine waves, slow drift       */
/*  green / blue / magenta / cyan layers flowing left → right,         */
/*  overlapping with a soft outer glow on pure black                   */
/* ------------------------------------------------------------------ */
function SineCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // layer: colour, amplitude, wavelength, drift speed, thickness, alpha, glow, phase offset
    // old style: low amplitude, long wavelength, very slow gentle flow
    // speeds scaled to ~0.25x — calm, meditative drift (still smooth 60fps)
    const layers = [
      { rgb: "0, 255, 136", amp: 44, len: 640, speed: 0.0013, width: 2.2, alpha: 0.9, blur: 20, phase: 0.0 }, // green  #00ff88
      { rgb: "0, 136, 255", amp: 58, len: 780, speed: 0.001, width: 2.0, alpha: 0.75, blur: 18, phase: 1.9 }, // blue   #0088ff
      { rgb: "255, 0, 136", amp: 36, len: 520, speed: 0.0016, width: 1.9, alpha: 0.7, blur: 18, phase: 3.6 }, // magenta #ff0088
      { rgb: "0, 229, 255", amp: 68, len: 900, speed: 0.0008, width: 1.7, alpha: 0.6, blur: 16, phase: 5.2 }, // cyan   #00e5ff
    ];

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const midY = h / 2;
      // additive blending makes overlapping glows bloom on the black background
      ctx.globalCompositeOperation = "lighter";

      for (const L of layers) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${L.rgb}, ${L.alpha})`;
        ctx.lineWidth = L.width;
        ctx.shadowColor = `rgba(${L.rgb}, 0.85)`;
        ctx.shadowBlur = L.blur;
        const k = (Math.PI * 2) / L.len;
        const phase = t * L.speed + L.phase; // continuous drift → wave travels left→right
        for (let x = -8; x <= w + 8; x += 2) {
          // travelling sine + a soft second harmonic for organic feel
          const y =
            midY +
            Math.sin(x * k - phase) * L.amp +
            Math.sin(x * k * 0.5 - phase * 0.7) * L.amp * 0.22;
          if (x === -8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(1200);
      return () => ro.disconnect();
    }

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Prism diamond logo — rotated square with fader sliders inside      */
/* ------------------------------------------------------------------ */
function DiamondLogo({ size, glowClass }: { size: number; glowClass: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={glowClass}
      aria-hidden="true"
    >
      {/* diamond outline */}
      <rect
        x="22"
        y="22"
        width="56"
        height="56"
        rx="7"
        transform="rotate(45 50 50)"
        fill="rgba(10,10,10,0.55)"
        stroke="#ffffff"
        strokeWidth="3.4"
      />
      {/* slider tracks */}
      <line x1="36" y1="42" x2="64" y2="42" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="36" y1="52" x2="64" y2="52" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="36" y1="62" x2="64" y2="62" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      {/* slider knobs */}
      <circle cx="55" cy="42" r="3.6" fill="#ffffff" />
      <circle cx="45" cy="52" r="3.6" fill="#ffffff" />
      <circle cx="58" cy="62" r="3.6" fill="#ffffff" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Google "G" mark                                                    */
/* ------------------------------------------------------------------ */
function GoogleG({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.2-6.9-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.1 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.3 6.8C.5 8.4 0 10.1 0 12s.5 3.6 1.3 5.2l3.8-2.9z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.8 2.9c1-2.9 3.7-5 6.9-5z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const NAV = ["Explore", "Repositories", "Branches", "Activity"];

export default function App() {
  const [activeNav, setActiveNav] = useState("Explore");
  const [panel, setPanel] = useState<"donate" | "google" | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [donated, setDonated] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [heroAction, setHeroAction] = useState<"studio" | "github" | null>(null);

  const togglePanel = (p: "donate" | "google") =>
    setPanel((cur) => (cur === p ? null : p));

  return (
    <div
      data-safe-area-inset-root
      className="flex min-h-screen w-full flex-col overflow-x-clip bg-black"
      style={{
        boxSizing: "border-box",
        paddingTop: "var(--safe-area-inset-top)",
      }}
    >
      <title>Soundgit Old Sinus Restored + Logo Left</title>

      {/* ---------------- Header ---------------- */}
      <header
        data-safe-area-sticky-top
        className="sticky z-30 border-b border-white/[0.06] bg-black/70 backdrop-blur-md"
        style={{ top: "var(--safe-area-inset-top)" }}
      >
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          {/* left: diamond logo + soundgit wordmark (small) */}
          <div className="flex shrink-0 items-center gap-2.5">
            <DiamondLogo size={26} glowClass="logo-glow-sm" />
            <span className="text-[17px] tracking-tight">
              <span className="font-light text-[#c9c9ce]">sound</span>
              <span className="font-bold text-white">git</span>
            </span>
          </div>

          {/* right: nav + Donate + Google Giriş */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <nav className="mr-2 hidden items-center gap-7 lg:flex">
              {NAV.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveNav(item)}
                  className={
                    activeNav === item
                      ? "text-[13px] font-medium text-white"
                      : "text-[13px] text-[var(--muted)] transition-colors hover:text-white"
                  }
                >
                  {item}
                </button>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => togglePanel("donate")}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                panel === "donate"
                  ? "border-[#00ff88]/50 text-[#7dffb8]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-white/25 hover:text-white"
              }`}
            >
              <Heart size={13} />
              <span className="hidden sm:inline">Donate</span>
            </button>

            <button
              type="button"
              onClick={() => togglePanel("google")}
              className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/85"
            >
              <GoogleG size={14} />
              Google Giriş
            </button>
          </div>

          {/* Donate panel */}
          {panel === "donate" && (
            <div className="absolute right-5 top-[calc(100%+10px)] z-40 w-64 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.75)] sm:right-8">
              <p className="text-[13px] font-medium text-white">Soundgit'i destekle</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                Bağışlar sunucu ve geliştirme giderlerine gider.
              </p>
              {donated ? (
                <p className="mt-3 flex items-center gap-1.5 text-[13px] text-[#7dffb8]">
                  <Check size={14} /> Teşekkürler, desteğin alındı.
                </p>
              ) : (
                <>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {[3, 5, 10].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAmount(v)}
                        className={`rounded-lg border py-1.5 text-[13px] transition-colors ${
                          amount === v
                            ? "border-[#00ff88]/60 bg-[#00ff88]/10 text-[#7dffb8]"
                            : "border-[var(--line)] text-[var(--muted)] hover:text-white"
                        }`}
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={amount === null}
                    onClick={() => setDonated(true)}
                    className="mt-2.5 w-full rounded-lg bg-white py-2 text-[13px] font-medium text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {amount ? `$${amount} bağışla` : "Tutar seç"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Google sign-in panel */}
          {panel === "google" && (
            <div className="absolute right-5 top-[calc(100%+10px)] z-40 w-72 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.75)] sm:right-8">
              <GoogleG size={22} />
              <p className="mt-3 text-sm font-medium text-white">Google ile giriş yap</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                soundgit hesabına devam etmek için
              </p>
              {signedIn ? (
                <p className="mt-4 flex items-center gap-1.5 text-[13px] text-[#7dffb8]">
                  <Check size={14} /> Giriş yapıldı, hoş geldin.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setSignedIn(true)}
                  className="mt-4 flex w-full items-center gap-3 rounded-lg border border-[var(--line)] px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--muted)]">
                    <User size={15} />
                  </span>
                  <span>
                    <span className="block text-[13px] text-white">
                      Google hesabıyla devam et
                    </span>
                    <span className="block text-[11px] text-[var(--faint)]">
                      Hesap seçimi sonraki adımda
                    </span>
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ---------------- Hero — old sinus flow ---------------- */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
        {/* multi-colour sine waves — behind the text, full width */}
        <SineCanvas />

        {/* [diamond logo] SOUNDGIT — side by side */}
        <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6">
          <DiamondLogo
            size={104}
            glowClass="logo-glow h-[68px] w-[68px] shrink-0 sm:h-[104px] sm:w-[104px]"
          />
          <h1
            className="text-[42px] font-extrabold uppercase leading-none tracking-tight text-white sm:text-7xl"
            style={{ textShadow: "0 0 34px rgba(255,255,255,0.28)" }}
          >
            Soundgit
          </h1>
        </div>

        <p className="relative z-10 mt-5 text-center text-sm tracking-wide text-[#9a9aa2] sm:text-[15px]">
          Bounce Version-Control for Producers
        </p>

        {/* two white pill buttons */}
        <div className="relative z-10 mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            aria-pressed={heroAction === "studio"}
            onClick={() => setHeroAction((cur) => (cur === "studio" ? null : "studio"))}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
              heroAction === "studio"
                ? "bg-white text-black ring-4 ring-white/25"
                : "bg-white text-black hover:bg-white/85"
            }`}
          >
            <Play size={15} />
            Open Studio
          </button>
          <button
            type="button"
            aria-pressed={heroAction === "github"}
            onClick={() => setHeroAction((cur) => (cur === "github" ? null : "github"))}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
              heroAction === "github"
                ? "bg-white text-black ring-4 ring-white/25"
                : "bg-white text-black hover:bg-white/85"
            }`}
          >
            <Github size={16} />
            GitHub
          </button>
        </div>

        {/* action card */}
        {heroAction && (
          <div className="relative z-10 mt-7 flex w-full max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left backdrop-blur-md">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
              {heroAction === "studio" ? <Play size={16} /> : <Github size={17} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">
                {heroAction === "studio" ? "Soundgit Studio" : "Soundgit on GitHub"}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#9a9aa2]">
                {heroAction === "studio"
                  ? "The studio opens here in the full app — bounce, branch and listen to every version while the waves keep playing."
                  : "Repositories, branches and activity live here in the full app — every bounce tracked like a commit."}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setHeroAction(null)}
              className="shrink-0 rounded-full p-1 text-[#9a9aa2] transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
