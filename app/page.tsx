"use client";

import React, { useEffect, useRef, useState } from "react";

type Panel = "none" | "donate" | "google";

interface DemoUser {
  email: string;
  name: string;
}

async function callActions(action: string, args: Record<string, unknown>) {
  const res = await fetch("actions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, args }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.error) {
    throw new Error((data && data.error) || "Kayıt servisine ulaşılamadı.");
  }
  return data.data;
}

const LAYERS = [
  { color: "#00ff88", speed: 0.00035, amp: 46, thickness: 2.2, alpha: 0.9 },
  { color: "#0088ff", speed: 0.00028, amp: 62, thickness: 2.0, alpha: 0.8 },
  { color: "#ff0088", speed: 0.00042, amp: 34, thickness: 1.8, alpha: 0.75 },
  { color: "#00e5ff", speed: 0.00022, amp: 78, thickness: 1.6, alpha: 0.7 },
];

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
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const mid = h * 0.52;

      LAYERS.forEach((layer, li) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const p = x / Math.max(w, 1);
          const y =
            mid +
            Math.sin(p * Math.PI * 2.2 + t * layer.speed * 10 + li * 1.7) * layer.amp +
            Math.sin(p * Math.PI * 5.1 - t * layer.speed * 6 + li) * layer.amp * 0.32;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = layer.color;
        ctx.globalAlpha = layer.alpha;
        ctx.lineWidth = layer.thickness;
        ctx.shadowColor = layer.color;
        ctx.shadowBlur = 18;
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

function Diamond({ size, glow = false }: { size: number; glow?: boolean }) {
  return (
    <div
      className="diamond-spin shrink-0"
      style={{
        width: size,
        height: size,
        transform: "rotate(45deg)",
        background: "linear-gradient(135deg,#00ff88 0%,#00e5ff 55%,#ff0088 130%)",
        borderRadius: Math.max(3, size * 0.14),
        boxShadow: glow
          ? "0 0 34px rgba(0,255,136,.75),0 0 70px rgba(0,229,255,.35)"
          : "0 0 14px rgba(0,255,136,.55)",
      }}
      aria-hidden="true"
    />
  );
}

export default function App() {
  const [panel, setPanel] = useState<Panel>("none");
  const [user, setUser] = useState<DemoUser | null>(null);
  const [thanks, setThanks] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [oauthNote, setOauthNote] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await callActions("records.list", { collection: "activity" });
        if (alive && data && Array.isArray(data.records)) {
          setSavedCount(data.records.length);
        }
      } catch {
        if (alive) setSavedCount(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openDonate = (amount: number) => {
    window.open("https://buymeacoffee.com/soundgit", "_blank");
    setThanks(true);
    setNotice(amount + "$ için destek sayfası açıldı. Teşekkürler!");
  };

  const demoLogin = () => {
    const demo: DemoUser = { email: "demo@soundgit.online", name: "Demo" };
    setUser(demo);
    setPanel("none");
    setNotice("Demo modunda giriş yapıldı: demo@soundgit.online");
    void (async () => {
      try {
        await callActions("records.create", {
          collection: "activity",
          value: { type: "demo_login", email: demo.email, at: new Date().toISOString() },
          idempotency_key: "login-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        });
        setSavedCount((c) => (c === null ? 1 : c + 1));
      } catch {
        /* Kayıt servisi önizlemede kapalı olabilir; giriş yine de çalışır. */
      }
    })();
  };

  const openStudio = () => {
    if (user) {
      setStudioOpen(true);
      setNotice("Studio açıldı — hoş geldin, " + user.name + ".");
    } else {
      setPanel("google");
      setNotice("Studio için önce giriş yapın.");
    }
  };

  const openGithub = () => {
    window.open("https://github.com/habehabekalkanlari/soundgit-online", "_blank");
  };

  return (
    <div
      data-safe-area-inset-root
      className="relative min-h-screen overflow-x-clip bg-[var(--bg)] text-[var(--ink)]"
      style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }}
    >
      {/* Header */}
      <header
        data-safe-area-sticky-top
        className="sticky z-40 border-b border-[var(--line)] bg-black/85 backdrop-blur-md"
        style={{ top: "var(--safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5" onClick={() => setStudioOpen(false)}>
            <Diamond size={26} />
            <span className="text-lg tracking-tight">
              <span className="font-light">sound</span>
              <span className="font-bold">git</span>
            </span>
          </a>

          <nav className="order-3 flex w-full items-center gap-5 text-sm text-[var(--muted)] sm:order-2 sm:w-auto sm:flex-1 sm:justify-center">
            <a className="transition hover:text-[var(--ink)]" href="#explore">Explore</a>
            <a className="transition hover:text-[var(--ink)]" href="#explore">Repositories</a>
            <a className="transition hover:text-[var(--ink)]" href="#explore">Branches</a>
            <a className="transition hover:text-[var(--ink)]" href="#activity">Activity</a>
          </nav>

          <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0">
            <button
              type="button"
              onClick={() => { setPanel("donate"); setThanks(false); }}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1.5 text-sm transition hover:border-[var(--accent)]"
            >
              <span aria-hidden="true">♡</span> Donate
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--muted)] sm:block">
                  {user.name} · {user.email}
                </span>
                <button
                  type="button"
                  onClick={() => { setUser(null); setStudioOpen(false); setNotice("Çıkış yapıldı."); }}
                  className="rounded-full bg-[var(--surface-2)] px-3.5 py-1.5 text-sm"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPanel("google")}
                className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-black transition hover:bg-[var(--accent)]"
              >
                <span className="mr-1.5 font-bold">G</span> Google Giriş
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main id="top" className="relative">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.08),transparent_55%)]" />
          <SineCanvas />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7">
              <Diamond size={104} glow />
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
                <span className="font-light">SOUND</span>
                <span className="font-bold">GIT</span>
              </h1>
            </div>

            <p className="glow-pulse mt-6 max-w-xl text-balance text-lg text-[var(--muted)] sm:text-xl">
              Bounce Version-Control for Producers
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
              Her bounce bir commit. Her proje bir repo. Prodüktörler için dallanma,
              sürüm geçmişi ve işbirliği — stüdyonun hızında.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={openStudio}
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-black shadow-[0_0_28px_rgba(0,255,136,0.45)] transition hover:brightness-110"
              >
                Open Studio
              </button>
              <button
                type="button"
                onClick={openGithub}
                className="rounded-full border border-[var(--line)] bg-black/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:border-[var(--accent-4)]"
              >
                GitHub ↗
              </button>
            </div>

            {notice && (
              <div className="mt-6 max-w-md rounded-2xl border border-[var(--line)] bg-black/70 px-4 py-3 text-sm text-[var(--muted)] backdrop-blur" role="status">
                {notice}
              </div>
            )}

            {/* Trusted product card */}
            <div id="explore" className="mt-12 w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)]/90 p-5 text-left backdrop-blur">
              <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Resmi site</p>
              <a
                href="https://soundgit.online"
                target="_blank"
                rel="noopener"
                className="mt-2 block text-xl font-bold hover:text-[var(--accent)]"
              >
                SoundGit Online
              </a>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                soundgit.online — prodüktörler için bounce tabanlı sürüm kontrolü.
              </p>
              <a
                href="https://soundgit.online"
                target="_blank"
                rel="noopener"
                className="mt-4 inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold text-black"
              >
                Siteyi Aç ↗
              </a>
            </div>
          </div>
        </section>

        {/* Studio / features */}
        {studioOpen && user ? (
          <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <div className="rounded-3xl border border-[var(--accent)]/40 bg-[var(--surface)] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">Studio</h2>
                <span className="mono rounded-full bg-black px-3 py-1 text-xs text-[var(--accent)]">
                  {user.email}
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { t: "main", d: "Son bounce: mix_v12.wav · 2 saat önce" },
                  { t: "feat/vocal-chain", d: "3 commit · birleştirilmeye hazır" },
                  { t: "exp/808-glue", d: "Deneysel dal · çakışma yok" },
                ].map((b) => (
                  <div key={b.t} className="rounded-2xl bg-black/50 p-4">
                    <p className="mono text-sm text-[var(--accent-4)]">{b.t}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{b.d}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStudioOpen(false)}
                className="mt-5 rounded-full border border-[var(--line)] px-4 py-2 text-sm"
              >
                Ana sayfaya dön
              </button>
            </div>
          </section>
        ) : (
          <section id="activity" className="mx-auto grid max-w-6xl gap-3 px-4 pb-16 sm:grid-cols-3 sm:px-6">
            {[
              { k: "Commit", v: "Her bounce izlenir", d: "WAV, proje dosyası ve presetler sürümlenir." },
              { k: "Branch", v: "Korkmadan dene", d: "Alternatif mix'ler ayrı dallarda yaşar." },
              { k: "Merge", v: "En iyisini birleştir", d: "Beğendiğin dalı main'e al, geçmiş kaybolmaz." },
            ].map((f) => (
              <article key={f.k} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">{f.k}</p>
                <h3 className="mt-2 text-lg font-bold">{f.v}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{f.d}</p>
              </article>
            ))}
          </section>
        )}

        <footer className="border-t border-[var(--line)] py-6 text-center text-xs text-[var(--muted)]">
          soundgit.online — Bounce Version-Control for Producers
          {savedCount !== null && <span className="mt-1 block">Kayıtlı etkinlik: {savedCount}</span>}
        </footer>
      </main>

      {/* Donate modal */}
      {panel === "donate" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Bağış">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold">SoundGit'i Destekle ♡</h2>
              <button type="button" onClick={() => setPanel("none")} className="rounded-full bg-black px-2.5 py-1 text-sm" aria-label="Kapat">✕</button>
            </div>
            {thanks ? (
              <div className="mt-5 rounded-2xl bg-black/50 p-4 text-center">
                <p className="text-2xl" aria-hidden="true">💚</p>
                <p className="mt-2 font-bold">Teşekkürler!</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Desteğiniz yeni pencerede açıldı. İyi ki varsınız.</p>
                <button type="button" onClick={() => setPanel("none")} className="mt-4 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-bold text-black">Kapat</button>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm text-[var(--muted)]">Bir tutar seçin; Buy Me a Coffee sayfası yeni sekmede açılır.</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => openDonate(a)}
                      className="rounded-2xl border border-[var(--line)] bg-black/50 py-4 text-lg font-bold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      ${a}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Google panel */}
      {panel === "google" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Google ile giriş">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold"><span className="mr-1">G</span> Google Giriş</h2>
              <button type="button" onClick={() => setPanel("none")} className="rounded-full bg-black px-2.5 py-1 text-sm" aria-label="Kapat">✕</button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Google hesabınızla giriş yapın. Test için demo modu anında çalışır.
            </p>
            <button
              type="button"
              onClick={demoLogin}
              className="mt-5 w-full rounded-full bg-white py-3 text-sm font-bold text-black transition hover:bg-[var(--accent)]"
            >
              Demo Giriş (demo@soundgit.online)
            </button>
            <a
              href="https://rvuiklogpbknbqvizddv.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://soundgit.online/studio"
              target="_blank"
              rel="noopener"
              onClick={() => setOauthNote(true)}
              className="mt-2 block w-full rounded-full border border-[var(--line)] py-3 text-center text-sm font-semibold transition hover:border-[var(--accent-4)]"
            >
              Google OAuth ile Devam Et
            </a>
            {oauthNote && (
              <p className="mt-3 rounded-xl bg-black/50 p-3 text-xs leading-relaxed text-[var(--muted)]">
                Canlı sitede bu buton Supabase üzerinden Google yetkilendirmesine yönlendirir
                ve /studio'ya döner. Önizlemede demo modu kullanılır.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
