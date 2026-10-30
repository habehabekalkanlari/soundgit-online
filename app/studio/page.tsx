"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------------------------------- types --------------------------------- */

type CheckItem = { label: string; ok: boolean; kind: string };
type CommentItem = { id: string; user: string; text: string; timeSec: number };
type Track = {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  keySig: string;
  daw: string;
  color: string;
  score: number;
  checks: CheckItem[];
  likes: number;
  liked: boolean;
  comments: CommentItem[];
  duration: number;
  pool: boolean;
};
type User = { name: string; initial: string };

/* ------------------------------- records API ------------------------------ */

async function api(action: string, args: Record<string, unknown>) {
  const res = await fetch("actions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, args }),
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok || data.error) {
    throw new Error(data.error || `İstek başarısız (${res.status})`);
  }
  return data.data;
}

/* ------------------------------ domain logic ------------------------------ */

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function getCollabReport(fileName: string): { score: number; checks: CheckItem[] } {
  const n = fileName.toLowerCase();
  const checks: CheckItem[] = [
    { label: "Vocal", ok: n.includes("vocal") || n.includes("vox"), kind: "vocal" },
    { label: "Enerji", ok: n.includes("energetic") || n.includes("energy") || n.includes("enerji"), kind: "energy" },
    { label: "Groove", ok: n.includes("groove"), kind: "groove" },
    { label: "Drop", ok: n.includes("drop"), kind: "drop" },
    { label: "Bass", ok: n.includes("bass"), kind: "bass" },
    { label: "Drums", ok: n.includes("drum") || n.includes("hihat") || n.includes("kick"), kind: "drums" },
  ];
  const hits = checks.filter((c) => c.ok).length;
  const score = Math.min(98, 52 + hits * 8 + (hashStr(n) % 7));
  return { score, checks };
}

function getLayaForFile(fileName: string) {
  const lower = fileName.toLowerCase();
  const ext = lower.split(".").pop() || "";
  const h = hashStr(lower);
  const bpm = 90 + (h % 61);
  const keys = ["Am", "Cm", "F#m", "Gm", "Dm", "Em", "Bm"];
  const keySig = keys[h % keys.length];
  if (ext === "wav" || ext === "flac")
    return { genre: "Techno", bpm, keySig, daw: "Ableton", color: "#e11d48" };
  if (ext === "als")
    return { genre: "House", bpm, keySig, daw: "Ableton", color: "#f97316" };
  if (ext === "flp")
    return { genre: "Trap", bpm, keySig, daw: "FL Studio", color: "#22c55e" };
  if (ext === "logicx")
    return { genre: "Pop", bpm, keySig, daw: "Logic Pro", color: "#38bdf8" };
  if (lower.includes("drop") || lower.includes("energetic"))
    return { genre: "EDM", bpm, keySig, daw: "Ableton", color: "#e11d48" };
  return { genre: "Elektronik", bpm, keySig, daw: "Ableton", color: "#a78bfa" };
}

function stripTimestamp(name: string): string {
  return name
    .replace(/[-_ ]?\d{4}[-_.]\d{2}[-_.]\d{2}([_ ]\d{2}[:.]\d{2}([:.]\d{2})?)?/g, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_]+/g, " ")
    .trim();
}

function scoreColor(score: number): string {
  if (score >= 80) return "var(--ok)";
  if (score >= 65) return "var(--warn)";
  return "var(--accent)";
}

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* --------------------------------- icons ---------------------------------- */

const I = {
  play: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  ),
  pause: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
  heart: (filled: boolean) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 20.7C6.4 17 3 13.6 3 9.9 3 7.2 5 5 7.7 5c1.7 0 3.3.9 4.3 2.3C13 5.9 14.6 5 16.3 5 19 5 21 7.2 21 9.9c0 3.7-3.4 7.1-9 10.8z" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7" />
    </svg>
  ),
  note: (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M9 18V6l10-2v11.5" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="15.5" r="2.5" />
    </svg>
  ),
  google: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5l-3.9 3C3.3 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.4a7.2 7.2 0 0 1 0-4.8l-3.9-3A12 12 0 0 0 0 12c0 1.9.5 3.8 1.3 5.4l3.9-3z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2A11.9 11.9 0 0 0 12 0 12 12 0 0 0 1.3 6.6l3.9 3c.9-2.9 3.6-4.9 6.8-4.9z" />
    </svg>
  ),
  check: (kind: string) => {
    const p = {
      vocal: <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />,
      energy: <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />,
      groove: <path d="M3 15c3-6 6-6 9 0s6 6 9 0M3 9c3-6 6-6 9 0s6 6 9 0" />,
      drop: <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />,
      bass: <path d="M4 10v4h3l5 4V6l-5 4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />,
      drums: <path d="M12 3v18M5 7l14 10M19 7 5 17M4 4h16" />,
    }[kind] || <circle cx="12" cy="12" r="8" />;
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {p}
      </svg>
    );
  },
};

/* ----------------------------- TimelinePlayer ----------------------------- */

function TimelinePlayer({ track }: { track: Track }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const duration = track.duration || 180;

  const waveformData = useMemo(() => {
    const seed = hashStr(track.name);
    const arr: number[] = [];
    let x = seed % 2147483647;
    for (let i = 0; i < 400; i++) {
      x = (x * 16807) % 2147483647;
      const env = 0.35 + 0.65 * Math.abs(Math.sin(i / 34));
      arr.push(Math.max(0.06, Math.min(1, (x / 2147483647) * env + 0.12)));
    }
    return arr;
  }, [track.name]);

  // simulated playback clock (drives playhead when no audio file is attached)
  useEffect(() => {
    if (!isPlaying) return;
    lastRef.current = performance.now();
    const step = (t: number) => {
      const dt = (t - lastRef.current) / 1000;
      lastRef.current = t;
      setCurrent((c) => {
        const next = c + dt;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, duration]);

  // draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 800;
    const H = 100;
    ctx.clearRect(0, 0, W, H);
    const barW = W / waveformData.length;
    const progress = duration > 0 ? current / duration : 0;
    waveformData.forEach((v, i) => {
      const x = i * barW;
      const h = v * (H - 18);
      const played = i / waveformData.length <= progress;
      ctx.fillStyle = played ? "#f4f4f5" : "#3f3f46";
      ctx.fillRect(x, (H - h) / 2, Math.max(1, barW - 0.6), h);
    });
    // comment dots
    track.comments.forEach((c) => {
      const x = (c.timeSec / duration) * W;
      ctx.beginPath();
      ctx.fillStyle = "#e11d48";
      ctx.arc(x, 10, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0a0a0b";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });
    // playhead line + circle
    const px = progress * W;
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = "#e11d48";
    ctx.arc(px, H / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [current, duration, waveformData, track.comments]);

  const toggle = () => {
    if (current >= duration) setCurrent(0);
    if (audioRef.current && audioRef.current.src) {
      if (isPlaying) audioRef.current.pause();
      else void audioRef.current.play().catch(() => undefined);
    }
    setIsPlaying((p) => !p);
  };

  const seek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const t = ratio * duration;
    setCurrent(t);
    if (audioRef.current && audioRef.current.src) audioRef.current.currentTime = t;
  };

  return (
    <div className="w-full">
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current && audioRef.current.src) setCurrent(audioRef.current.currentTime);
        }}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Duraklat" : "Oynat"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--text)] text-black transition hover:opacity-85"
        >
          {isPlaying ? I.pause : I.play}
        </button>
        <div className="min-w-0 flex-1">
          <canvas
            ref={canvasRef}
            width={800}
            height={100}
            onClick={seek}
            className="h-[52px] w-full cursor-pointer rounded-md"
            aria-label="Dalga formu, aramak için tıkla"
          />
        </div>
        <div className="mono shrink-0 text-[11px] text-[var(--muted)]">
          {fmt(current)} / {fmt(duration)}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- TrackCard ------------------------------- */

function TrackCard({
  track,
  busy,
  onLike,
  onDelete,
  onComment,
}: {
  track: Track;
  busy: boolean;
  onLike: (t: Track) => void;
  onDelete: (t: Track) => void;
  onComment: (t: Track, text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onComment(track, text);
    setDraft("");
  };
  return (
    <article className="flex gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)]/60 p-4">
      {/* left flexible column */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-[var(--text)]">
            {stripTimestamp(track.name)}
          </h3>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
            {track.genre}
          </span>
          <span className="mono rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
            {track.bpm} BPM · {track.keySig} · {track.daw}
          </span>
          <span
            className="mono rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ color: scoreColor(track.score), background: "rgba(255,255,255,0.05)" }}
          >
            {track.score}
          </span>
          {track.pool && (
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-rose-300">
              Havuz
            </span>
          )}
        </div>

        <div className="mt-3">
          <TimelinePlayer track={track} />
        </div>

        {/* collab checks */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {track.checks.map((c) => (
            <span
              key={c.label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] ${
                c.ok
                  ? "border-[var(--line)] bg-[var(--surface-2)] text-white"
                  : "border-[var(--line)] text-zinc-600"
              }`}
            >
              <span style={{ filter: "invert(1)", opacity: c.ok ? 1 : 0.35 }}>{I.check(c.kind)}</span>
              {c.label}
              {c.ok && <span className="text-[var(--ok)]">✓</span>}
            </span>
          ))}
        </div>

        {/* action buttons */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onComment(track, "Vocal hattı çok net, bir de harmony deneyelim.")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12px] font-semibold text-black transition hover:opacity-85 disabled:opacity-40"
          >
            {I.check("vocal")} Vocal
          </button>
          {(["drums", "bass", "drop"] as const).map((k) => {
            const label = k === "drums" ? "Drums" : k === "bass" ? "Bass" : "Drop";
            return (
              <button
                key={k}
                type="button"
                disabled={busy}
                onClick={() =>
                  onComment(track, `${label} bölümü için collab notu bırakıldı.`)
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[12px] font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:opacity-40"
              >
                {I.check(k)} {label}
              </button>
            );
          })}
          <button
            type="button"
            disabled={busy}
            onClick={() => onLike(track)}
            aria-label="Beğen"
            className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12px] transition disabled:opacity-40 ${
              track.liked ? "text-rose-400" : "text-[var(--muted)] hover:text-white"
            }`}
          >
            {I.heart(track.liked)} {track.likes}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(track)}
            aria-label="Parçayı sil"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12px] text-[var(--muted)] transition hover:text-rose-400 disabled:opacity-40"
          >
            {I.trash} Sil
          </button>
        </div>

        {/* comments */}
        {track.comments.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {track.comments.slice(-3).map((c) => (
              <li key={c.id} className="text-[12px] text-[var(--muted)]">
                <span className="mono mr-2 text-rose-300">{fmt(c.timeSec)}</span>
                <span className="font-medium text-zinc-300">{c.user}: </span>
                {c.text}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Yorum yaz…"
            className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[13px] text-[var(--text)] outline-none focus:border-zinc-500"
          />
          <button
            type="button"
            disabled={busy || !draft.trim()}
            onClick={submit}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-[12px] font-medium text-white transition hover:bg-zinc-700 disabled:opacity-40"
          >
            Gönder
          </button>
        </div>
      </div>

      {/* right 160px square */}
      <div className="relative hidden h-[160px] w-[160px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-black text-zinc-500 sm:flex">
        {I.note}
        <span className="mono mt-1 text-[11px]" style={{ color: track.color }}>
          {track.genre}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-zinc-800">
          <div
            className="h-full transition-all"
            style={{ width: `${track.score}%`, background: scoreColor(track.score) }}
          />
        </div>
        <span className="mono absolute bottom-3 right-3 text-[12px] font-bold" style={{ color: scoreColor(track.score) }}>
          {track.score}
        </span>
      </div>
    </article>
  );
}

/* ----------------------------------- App ---------------------------------- */

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"studio" | "home">("studio");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filter, setFilter] = useState<"all" | "pool">("all");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [result, setResult] = useState<{ saved: number; remaining: number; error: string | null } | null>(null);

  const reloadRecords = async () => {
    const data = await api("records.list", { collection: "tracks" });
    const recs = (data?.records || []) as Array<{ id: string; value: any }>;
    setTracks(
      recs.map((r) => ({ ...(r.value as Track), id: r.id }))
    );
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    reloadRecords()
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const createRow = async (value: Omit<Track, "id">, key: string) => {
    const rec = await api("records.create", {
      collection: "tracks",
      value,
      idempotency_key: key,
    });
    return rec;
  };

  const buildTrack = (fileName: string, pool: boolean): Omit<Track, "id"> => {
    const laya = getLayaForFile(fileName);
    const report = getCollabReport(fileName);
    return {
      name: fileName,
      genre: laya.genre,
      bpm: laya.bpm,
      keySig: laya.keySig,
      daw: laya.daw,
      color: laya.color,
      score: report.score,
      checks: report.checks,
      likes: 0,
      liked: false,
      comments: [],
      duration: 150 + (hashStr(fileName) % 90),
      pool,
    };
  };

  const handleAddTrack = async () => {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    setResult(null);
    let saved = 0;
    let err: string | null = null;
    const rows = [buildTrack(name, filter === "pool")];
    try {
      for (const row of rows) {
        await createRow(row, `track-${hashStr(row.name)}-${Date.now()}`);
        saved += 1;
      }
    } catch (e) {
      err = e instanceof Error ? e.message : String(e);
    }
    let reloadError: string | null = null;
    try {
      await reloadRecords();
    } catch (e) {
      reloadError = e instanceof Error ? e.message : String(e);
    }
    setResult({ saved, remaining: rows.length - saved, error: err || reloadError });
    if (!err && !reloadError) setNewName("");
    setBusy(false);
  };

  const handleSeed = async () => {
    if (busy) return;
    setBusy(true);
    setResult(null);
    const names = [
      "gece_vocal_drop_energetic.wav",
      "groove_bass_hihat_loop.flp",
      "sabah_energetic_groove_vocal.als",
    ];
    const rows = names.map((n, i) => buildTrack(n, i !== 1));
    let saved = 0;
    let err: string | null = null;
    try {
      for (const row of rows) {
        await createRow(row, `seed-${hashStr(row.name)}`);
        saved += 1;
      }
    } catch (e) {
      err = e instanceof Error ? e.message : String(e);
    }
    let reloadError: string | null = null;
    try {
      await reloadRecords();
    } catch (e) {
      reloadError = e instanceof Error ? e.message : String(e);
    }
    setResult({ saved, remaining: rows.length - saved, error: err || reloadError });
    setBusy(false);
  };

  const persist = async (track: Track) => {
    const { id, ...value } = track;
    await api("records.replace", { collection: "tracks", id, value });
  };

  const handleLike = async (track: Track) => {
    if (busy) return;
    const next: Track = {
      ...track,
      liked: !track.liked,
      likes: track.likes + (track.liked ? -1 : 1),
    };
    setTracks((ts) => ts.map((t) => (t.id === track.id ? next : t)));
    try {
      await persist(next);
    } catch (e) {
      setTracks((ts) => ts.map((t) => (t.id === track.id ? track : t)));
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleComment = async (track: Track, text: string) => {
    if (busy) return;
    const comment: CommentItem = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user: user?.name || "Sen",
      text,
      timeSec: Math.floor(Math.random() * (track.duration - 10)) + 5,
    };
    const next: Track = { ...track, comments: [...track.comments, comment] };
    setTracks((ts) => ts.map((t) => (t.id === track.id ? next : t)));
    try {
      await persist(next);
      setNotice("Yorum kaydedildi.");
    } catch (e) {
      setTracks((ts) => ts.map((t) => (t.id === track.id ? track : t)));
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDelete = async (track: Track) => {
    if (busy) return;
    setBusy(true);
    try {
      await api("records.delete", { collection: "tracks", id: track.id });
      setTracks((ts) => ts.filter((t) => t.id !== track.id));
      setNotice("Parça silindi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const signInDemo = () => {
    setUser({ name: "Studio Kullanıcısı", initial: "S" });
    setView("studio");
    setError(null);
  };

  const signOut = () => {
    setUser(null);
    setTracks([]);
    setView("studio");
  };

  const visible = filter === "pool" ? tracks.filter((t) => t.pool) : tracks;

  return (
    <div
      data-safe-area-inset-root
      className="min-h-screen bg-[var(--bg)] text-[var(--text)]"
      style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }}
    >
      {/* header */}
      <header
        data-safe-area-sticky-top
        className="sticky z-30 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur"
        style={{ top: "var(--safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M9 18V6l10-2v11.5" />
                <circle cx="6.5" cy="18" r="2.5" />
                <circle cx="16.5" cy="15.5" r="2.5" />
              </svg>
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-wide">SOUNDGIT STUDIO</p>
              <p className="text-[11px] text-[var(--muted)]">Collab parça havuzu</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-lg border border-[var(--line)] bg-[var(--surface)] p-0.5">
              {(["pool", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
                    filter === f ? "bg-white text-black" : "text-[var(--muted)] hover:text-white"
                  }`}
                >
                  {f === "pool" ? "Havuz" : "Tüm"}
                </button>
              ))}
            </div>
            {user && (
              <>
                <span className="hidden items-center gap-2 sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-[13px] font-bold text-white">
                    {user.initial}
                  </span>
                  <span className="text-[13px] text-zinc-200">{user.name}</span>
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12px] text-[var(--muted)] transition hover:text-white"
                >
                  Çıkış
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* home / login view */}
      {view === "home" && !user && (
        <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-white">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M9 18V6l10-2v11.5" />
              <circle cx="6.5" cy="18" r="2.5" />
              <circle cx="16.5" cy="15.5" r="2.5" />
            </svg>
          </span>
          <h1 className="mt-5 text-2xl font-bold">SOUNDGIT</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
            Studio; parçalarını dinleyip collab notları bıraktığın yer. Devam etmek
            için Google hesabınla giriş yap.
          </p>
          <button
            type="button"
            onClick={signInDemo}
            className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-zinc-900 shadow transition hover:opacity-90"
          >
            {I.google} Google ile Giriş Yap
          </button>
          <p className="mt-3 text-[11px] text-zinc-500">
            Bu önizlemde giriş, gerçek Google hesabına bağlanmadan yerel oturumla açılır.
          </p>
          <button
            type="button"
            onClick={() => setView("studio")}
            className="mt-6 text-[12px] text-[var(--muted)] underline underline-offset-4 hover:text-white"
          >
            Studio'ya dön
          </button>
        </main>
      )}

      {/* studio */}
      {view === "studio" && user && (
        <main className="mx-auto max-w-5xl px-4 pb-40 pt-5">
          {error && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-[13px] text-rose-200">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="shrink-0 text-rose-300 hover:text-white" aria-label="Kapat">
                ✕
              </button>
            </div>
          )}
          {notice && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[13px] text-zinc-200">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[var(--muted)] hover:text-white" aria-label="Kapat">
                ✕
              </button>
            </div>
          )}
          {result && (
            <p className="mb-4 text-[12px] text-[var(--muted)]">
              Kaydedilen: {result.saved} · Kalan: {result.remaining}
              {result.error ? ` · Hata: ${result.error}` : ""}
            </p>
          )}

          {loading ? (
            <p className="py-16 text-center text-[13px] text-[var(--muted)]">Parçalar yükleniyor…</p>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--line)] px-6 py-14 text-center">
              <div className="flex justify-center text-zinc-600">{I.note}</div>
              <p className="mt-3 text-[15px] font-medium text-zinc-200">
                {filter === "pool" ? "Havuzda henüz parça yok" : "Henüz parça yok"}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-[var(--muted)]">
                Aşağıdaki alana bir dosya adı yazarak ilk parçayı ekleyebilir ya da
                örnek parçalarla studio'yu doldurabilirsin.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={handleSeed}
                className="mt-5 rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-black transition hover:opacity-85 disabled:opacity-40"
              >
                Örnek parçaları yükle
              </button>
              {result && (
                <p className="mt-3 text-[12px] text-[var(--muted)]">
                  Kaydedilen: {result.saved} · Kalan: {result.remaining}
                  {result.error ? ` · ${result.error}` : ""}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map((t) => (
                <TrackCard
                  key={t.id}
                  track={t}
                  busy={busy}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onComment={handleComment}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* bottom add-track bar (studio, logged in) */}
      {view === "studio" && user && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTrack()}
              placeholder="Yeni parça dosya adı — örn. gece_vocal_drop.wav"
              className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-[13px] text-[var(--text)] outline-none focus:border-zinc-500"
            />
            <button
              type="button"
              disabled={busy || !newName.trim()}
              onClick={handleAddTrack}
              className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {busy ? "Kaydediliyor…" : "Parçayı Ekle"}
            </button>
          </div>
          <p className="mx-auto max-w-5xl px-4 pb-3 text-[11px] text-zinc-500">
            Dosya yükleme henüz desteklenmiyor; parça, dosya adından tür/BPM/collab
            analizi üretilerek karta eklenir.
          </p>
        </div>
      )}

      {/* AUTH GUARD overlay */}
      {!user && view === "studio" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center shadow-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-rose-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-bold">Google ile giriş yapmalısın</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
              Studio'ya erişmek için Google ile giriş yap. Giriş yapmadan parçalar
              görüntülenemez.
            </p>
            <button
              type="button"
              onClick={() => setView("home")}
              className="mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-zinc-900 transition hover:opacity-90"
            >
              {I.google} Google ile Giriş
            </button>
            <p className="mt-3 text-[11px] text-zinc-500">
              Buton seni ana sayfadaki giriş ekranına götürür.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
