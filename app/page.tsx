"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Links                                                              */
/* ------------------------------------------------------------------ */
const BMC_URL = "https://buymeacoffee.com/soundgit";
const SPONSORS_URL = "https://github.com/sponsors";
const GITHUB_URL = "https://github.com/habehabekalkanlari/soundgit-online";
const GOOGLE_AUTH_URL =
  "https://rvuiklogpbknbqvizddv.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://soundgit.online/studio";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (feather-style, no external icon dependency)      */
/* ------------------------------------------------------------------ */
function Icon({
  size = 16,
  children,
  className,
}: {
  size?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const HeartIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Icon>
);

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

const XIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

const UserIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const PlayIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" />
  </svg>
);

const PauseIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="4" width="4.5" height="16" rx="1" fill="currentColor" />
    <rect x="14.5" y="4" width="4.5" height="16" rx="1" fill="currentColor" />
  </svg>
);

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const CopyIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

const ExternalIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </Icon>
);

const CoffeeIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </Icon>
);

const CompassIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </Icon>
);

const FolderIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Icon>
);

const BranchIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </Icon>
);

const ActivityIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Icon>
);

const BellIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
);

const BackIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Icon>
);

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
/*  Modal shell                                                        */
/* ------------------------------------------------------------------ */
function Modal({
  onClose,
  children,
  label,
}: {
  onClose: () => void;
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div className="animate-modal-in relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.75)]">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const NAV = ["Explore", "Repositories", "Branches", "Activity"] as const;
type NavItem = (typeof NAV)[number];

const NAV_PANELS: Record<
  NavItem,
  { heading: string; desc: string; icon: ReactNode }
> = {
  Explore: {
    heading: "Explore Tracks — yakında",
    desc: "Prodüktörlerin paylaştığı bounce'ları dinleyip sürüm dallarını keşfedeceğin alan çok yakında burada olacak.",
    icon: <CompassIcon size={20} />,
  },
  Repositories: {
    heading: "Repositories — yakında",
    desc: "Tüm projelerin ve bounce geçmişin, kod depoları gibi sürüm kontrollü tek bir alanda toplanacak.",
    icon: <FolderIcon size={20} />,
  },
  Branches: {
    heading: "Branches — yakında",
    desc: "Her deneme ayrı bir dalda: vokal denemesi, bas denemesi, alternatif mix… Ana sürüme dokunmadan dene.",
    icon: <BranchIcon size={20} />,
  },
  Activity: {
    heading: "Activity — yakında",
    desc: "Yeni bounce'lar, dal birleştirmeleri ve proje hareketleri tek bir akışta burada listelenecek.",
    icon: <ActivityIcon size={20} />,
  },
};

const TRACKS = [
  { id: "gece", name: "gece-bounce", file: "gece_bounce_v14.wav", duration: "2:34" },
  { id: "bas", name: "bas-deneme", file: "bas_deneme_v8.wav", duration: "1:58" },
  { id: "vokal", name: "vokal-loop", file: "vokal_loop_v21.wav", duration: "3:12" },
];

const BRANCHES = ["main", "deneme", "vokal"] as const;
type Branch = (typeof BRANCHES)[number];

type VersionRow = { v: string; note: string; duration: string };

const INITIAL_VERSIONS: Record<Branch, VersionRow[]> = {
  main: [
    { v: "v14", note: "gece_bounce_final.wav", duration: "2:34" },
    { v: "v13", note: "baslar sıkıştırıldı", duration: "2:31" },
    { v: "v12", note: "ilk tam bounce", duration: "2:40" },
  ],
  deneme: [
    { v: "v6", note: "yeni davul denemesi", duration: "1:48" },
    { v: "v5", note: "tempo 128 bpm denemesi", duration: "1:52" },
  ],
  vokal: [
    { v: "v9", note: "vokal_loop_kuru.wav", duration: "3:12" },
    { v: "v8", note: "vokale reverb eklendi", duration: "3:05" },
  ],
};

type Toast = {
  id: number;
  title: string;
  message?: string;
  tone: "success" | "info";
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("Explore");
  const [donateOpen, setDonateOpen] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [navPanel, setNavPanel] = useState<NavItem | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);

  const [amount, setAmount] = useState<number | null>(null);
  const [donated, setDonated] = useState(false);
  const [loginState, setLoginState] = useState<"idle" | "opened">("idle");
  const [notified, setNotified] = useState<Record<string, boolean>>({});

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [branch, setBranch] = useState<Branch>("main");
  const [versions, setVersions] =
    useState<Record<Branch, VersionRow[]>>(INITIAL_VERSIONS);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const showToast = (
    title: string,
    message?: string,
    tone: "success" | "info" = "success",
  ) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, title, message, tone }]);
    window.setTimeout(
      () => setToasts((t) => t.filter((x) => x.id !== id)),
      4500,
    );
  };

  const dismissToast = (id: number) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ---------------- actions ---------------- */

  const donateWith = (v: number) => {
    setAmount(v);
    openExternal(BMC_URL);
    setDonated(true);
    showToast(
      "Teşekkürler!",
      `$${v} bağışın için bağış sayfası yeni sekmede açıldı.`,
    );
  };

  const openSponsors = () => {
    openExternal(SPONSORS_URL);
    setDonated(true);
    showToast(
      "Teşekkürler!",
      "GitHub Sponsors sayfası yeni sekmede açıldı.",
    );
  };

  const copyDonateLink = () => {
    const ta = document.createElement("textarea");
    ta.value = BMC_URL;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    showToast(
      ok ? "Bağlantı kopyalandı" : "Kopyalanamadı",
      BMC_URL,
      ok ? "success" : "info",
    );
  };

  const startGoogleLogin = () => {
    setLoginState("opened");
    openExternal(GOOGLE_AUTH_URL);
    showToast(
      "Google girişi açılıyor",
      "Yeni sekmede Google hesabınla giriş yap; bitince Studio'ya yönlendirileceksin.",
      "info",
    );
  };

  const openGithub = () => {
    openExternal(GITHUB_URL);
    showToast(
      "GitHub açılıyor",
      "soundgit-online deposu yeni sekmede açıldı.",
      "info",
    );
  };

  const onNav = (item: NavItem) => {
    setActiveNav(item);
    setNavPanel(item);
    setGoogleOpen(false);
  };

  const notifyMe = (item: NavItem) => {
    setNotified((n) => ({ ...n, [item]: true }));
    showToast("Listeye eklendin", `${NAV_PANELS[item].heading.split(" — ")[0]} yayına girince haber vereceğiz.`);
  };

  const takeBounce = () => {
    setVersions((prev) => {
      const rows = prev[branch];
      const nextNum =
        rows.reduce((max, r) => {
          const n = parseInt(r.v.replace("v", ""), 10);
          return Number.isNaN(n) ? max : Math.max(max, n);
        }, 0) + 1;
      const track = TRACKS.find((t) => t.id === playingId) ?? TRACKS[0];
      return {
        ...prev,
        [branch]: [
          { v: `v${nextNum}`, note: `yeni bounce — ${track.file}`, duration: track.duration },
          ...rows,
        ],
      };
    });
    showToast("Bounce alındı", `${branch} dalına yeni sürüm kaydedildi.`);
  };

  /* ---------------- keyboard: Esc closes overlays ---------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDonateOpen(false);
        setNavPanel(null);
        setGoogleOpen(false);
        setStudioOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      data-safe-area-inset-root
      className="flex min-h-screen w-full flex-col overflow-x-clip bg-black"
      style={{
        boxSizing: "border-box",
        paddingTop: "var(--safe-area-inset-top)",
      }}
    >
      <title>Soundgit Homepage - All Buttons Active</title>

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
                  onClick={() => onNav(item)}
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
              onClick={() => {
                setDonateOpen(true);
                setGoogleOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[#00ff88]/50 hover:text-[#7dffb8]"
            >
              <HeartIcon size={13} />
              <span className="hidden sm:inline">Donate</span>
            </button>

            <button
              type="button"
              onClick={() => setGoogleOpen((o) => !o)}
              aria-expanded={googleOpen}
              className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/85"
            >
              <GoogleG size={14} />
              Google Giriş
            </button>
          </div>

          {/* Google sign-in panel */}
          {googleOpen && (
            <div className="absolute right-5 top-[calc(100%+10px)] z-40 w-72 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.75)] sm:right-8">
              <GoogleG size={22} />
              <p className="mt-3 text-sm font-medium text-white">Google ile giriş yap</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                soundgit hesabına devam etmek için
              </p>
              {loginState === "opened" ? (
                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-[13px] text-[#7dffb8]">
                    <CheckIcon size={14} /> Giriş sekmesi açıldı.
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                    Google girişini yeni sekmede tamamla; bitince
                    soundgit.online/studio adresine yönlendirileceksin.
                  </p>
                  <button
                    type="button"
                    onClick={startGoogleLogin}
                    className="mt-3 w-full rounded-lg border border-[var(--line)] py-2 text-[13px] text-white transition-colors hover:bg-white/5"
                  >
                    Sekmeyi tekrar aç
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startGoogleLogin}
                  className="mt-4 flex w-full items-center gap-3 rounded-lg border border-[var(--line)] px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--muted)]">
                    <UserIcon size={15} />
                  </span>
                  <span>
                    <span className="block text-[13px] text-white">
                      Google hesabıyla devam et
                    </span>
                    <span className="block text-[11px] text-[var(--faint)]">
                      Supabase üzerinden güvenli giriş
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
            onClick={() => setStudioOpen(true)}
            className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85"
          >
            <PlayIcon size={15} />
            Open Studio
          </button>
          <button
            type="button"
            onClick={openGithub}
            className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85"
          >
            <spanIcon size={16} />
            GitHub
          </button>
        </div>

        {/* mobile nav (desktop nav lives in the header) */}
        <nav className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-2 lg:hidden">
          {NAV.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onNav(item)}
              className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                activeNav === item
                  ? "border-white/40 text-white"
                  : "border-[var(--line)] text-[var(--muted)] hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </main>

      {/* ---------------- Donate modal ---------------- */}
      {donateOpen && (
        <Modal onClose={() => setDonateOpen(false)} label="Soundgit'i destekle">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00ff88]/10 text-[#00ff88]">
                <HeartIcon size={18} />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-white">
                  Soundgit'i destekle
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Bağışlar sunucu ve geliştirme giderlerine gider.
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Kapat"
              onClick={() => setDonateOpen(false)}
              className="shrink-0 rounded-full p-1 text-[var(--muted)] transition-colors hover:bg-white/10 hover:text-white"
            >
              <XIcon size={16} />
            </button>
          </div>

          {donated ? (
            <div className="mt-6 rounded-xl border border-[#00ff88]/25 bg-[#00ff88]/[0.06] p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[15px] font-medium text-[#7dffb8]">
                <CheckIcon size={16} /> Teşekkürler!
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
                {amount
                  ? `$${amount} bağışın için ödeme sayfası yeni sekmede açıldı.`
                  : "Bağış sayfası yeni sekmede açıldı."}{" "}
                Desteğin Soundgit'i ayakta tutuyor.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDonated(false);
                  setAmount(null);
                }}
                className="mt-3 rounded-full border border-[var(--line)] px-4 py-1.5 text-xs text-white transition-colors hover:bg-white/5"
              >
                Tekrar bağış yap
              </button>
            </div>
          ) : (
            <>
              <p className="mt-5 text-xs text-[var(--muted)]">
                Tutara dokun — bağış sayfası yeni sekmede açılır:
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[3, 5, 10].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => donateWith(v)}
                    className={`rounded-xl border py-3 text-[15px] font-medium transition-colors ${
                      amount === v
                        ? "border-[#00ff88]/60 bg-[#00ff88]/10 text-[#7dffb8]"
                        : "border-[var(--line)] text-white hover:border-white/30"
                    }`}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                openExternal(BMC_URL);
                showToast(
                  "Buy Me a Coffee açılıyor",
                  "Bağış sayfası yeni sekmede açıldı.",
                  "info",
                );
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[13px] font-semibold text-black transition-colors hover:bg-white/85"
            >
              <CoffeeIcon size={15} />
              Buy Me a Coffee
            </button>
            <button
              type="button"
              onClick={openSponsors}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-white/5"
            >
              <spanIcon size={15} />
              GitHub Sponsors
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs text-[var(--muted)]">Bağış bağlantısını paylaş:</p>
            <div className="mt-2 flex gap-2">
              <input
                readOnly
                value={BMC_URL}
                aria-label="Bağış bağlantısı"
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-black/40 px-3 py-2 text-xs text-[var(--muted)] outline-none focus:border-white/30"
              />
              <button
                type="button"
                onClick={copyDonateLink}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-xs text-white transition-colors hover:bg-white/5"
              >
                <CopyIcon size={13} />
                Kopyala
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- Nav panel modal ---------------- */}
      {navPanel && (
        <Modal onClose={() => setNavPanel(null)} label={NAV_PANELS[navPanel].heading}>
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] text-white">
              {NAV_PANELS[navPanel].icon}
            </span>
            <button
              type="button"
              aria-label="Kapat"
              onClick={() => setNavPanel(null)}
              className="shrink-0 rounded-full p-1 text-[var(--muted)] transition-colors hover:bg-white/10 hover:text-white"
            >
              <XIcon size={16} />
            </button>
          </div>
          <p className="mt-4 text-lg font-semibold text-white">
            {NAV_PANELS[navPanel].heading}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
            {NAV_PANELS[navPanel].desc}
          </p>
          <span className="mt-4 inline-block rounded-full border border-[#00ff88]/30 bg-[#00ff88]/[0.07] px-2.5 py-1 text-[11px] font-medium text-[#7dffb8]">
            Yakında
          </span>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!notified[navPanel]}
              onClick={() => notifyMe(navPanel)}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black transition-all hover:bg-white/85 disabled:cursor-default disabled:bg-white/15 disabled:text-[#7dffb8]"
            >
              {notified[navPanel] ? (
                <>
                  <CheckIcon size={14} /> Listedesin
                </>
              ) : (
                <>
                  <BellIcon size={14} /> Haberdar et
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setNavPanel(null);
                setStudioOpen(true);
              }}
              className="flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-[13px] text-white transition-colors hover:bg-white/5"
            >
              <PlayIcon size={13} /> Studio'yu aç
            </button>
          </div>
        </Modal>
      )}

      {/* ---------------- Studio view (/studio) ---------------- */}
      {studioOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black">
          <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <DiamondLogo size={26} glowClass="logo-glow-sm" />
                <span className="text-[15px]">
                  <span className="font-light text-[#c9c9ce]">sound</span>
                  <span className="font-bold text-white">git</span>
                  <span className="ml-2 text-[var(--faint)]">/ studio</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStudioOpen(false)}
                className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3.5 py-1.5 text-xs text-[var(--muted)] transition-colors hover:text-white"
              >
                <BackIcon size={13} />
                Ana sayfa
              </button>
            </div>

            {/* waveform */}
            <div className="relative mt-6 h-44 overflow-hidden rounded-2xl border border-white/[0.07] bg-black">
              <SineCanvas />
              <div className="absolute left-4 top-3 z-10 text-xs text-[var(--muted)]">
                {playingId
                  ? `Çalınıyor: ${TRACKS.find((t) => t.id === playingId)?.file}`
                  : "Bir parça seç ve dinle"}
              </div>
            </div>

            {/* tracks */}
            <p className="mt-7 text-sm font-semibold text-white">Parçalar</p>
            <div className="mt-3 space-y-2">
              {TRACKS.map((t) => {
                const playing = playingId === t.id;
                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      playing
                        ? "border-[#00ff88]/30 bg-[#00ff88]/[0.04]"
                        : "border-[var(--line)] bg-[var(--surface)]"
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={playing ? `${t.name} durdur` : `${t.name} çal`}
                      onClick={() => {
                        setPlayingId(playing ? null : t.id);
                        showToast(
                          playing ? "Durduruldu" : "Çalınıyor",
                          t.file,
                          "info",
                        );
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/85"
                    >
                      {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{t.name}</p>
                      <p className="truncate text-xs text-[var(--faint)]">{t.file}</p>
                    </div>
                    {playing && (
                      <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className="eq-bar w-[3px] rounded-full bg-[#00ff88]"
                            style={{ height: "100%", animationDelay: `${i * 0.13}s` }}
                          />
                        ))}
                      </span>
                    )}
                    <span className="shrink-0 text-xs text-[var(--muted)]">{t.duration}</span>
                  </div>
                );
              })}
            </div>

            {/* branches + versions */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {BRANCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBranch(b)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                      branch === b
                        ? "border-[#00ff88]/50 bg-[#00ff88]/10 text-[#7dffb8]"
                        : "border-[var(--line)] text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    <BranchIcon size={12} />
                    {b}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={takeBounce}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-white/85"
              >
                <PlayIcon size={12} />
                Yeni Bounce Al
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--line)]">
              {versions[branch].map((row, i) => (
                <div
                  key={`${row.v}-${i}`}
                  className="flex items-center gap-3 border-b border-white/[0.05] bg-[var(--surface)] px-4 py-3 last:border-b-0"
                >
                  <span className="w-10 shrink-0 rounded-md bg-white/[0.07] px-1.5 py-0.5 text-center text-xs font-medium text-white">
                    {row.v}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[13px] text-[var(--muted)]">
                    {row.note}
                  </p>
                  <span className="shrink-0 text-xs text-[var(--faint)]">{row.duration}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 pb-4 text-center text-xs text-[var(--faint)]">
              {branch} dalında {versions[branch].length} sürüm · her bounce bir commit gibi saklanır
            </p>
          </div>
        </div>
      )}

      {/* ---------------- Toasts ---------------- */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:left-auto sm:right-5 sm:translate-x-0 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
            role="status"
          >
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                t.tone === "success"
                  ? "bg-[#00ff88]/15 text-[#00ff88]"
                  : "bg-white/10 text-white"
              }`}
            >
              {t.tone === "success" ? <CheckIcon size={13} /> : <ExternalIcon size={12} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 break-words text-xs leading-relaxed text-[var(--muted)]">
                  {t.message}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Bildirimi kapat"
              onClick={() => dismissToast(t.id)}
              className="shrink-0 rounded-full p-0.5 text-[var(--faint)] transition-colors hover:text-white"
            >
              <XIcon size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
