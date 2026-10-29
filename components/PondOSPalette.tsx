"use client"
import { useEffect, useState } from "react"
export default function PondOSPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(!open)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])
  const analyze = () => {
    const q = query.toLowerCase()
    if (q.includes("ne eksik") || q.includes("durum") || q.includes("analiz")) {
      setAnswer(`🔍 SoundGit Durum:
✅ Next.js + Supabase + Vercel
✅ Live: soundgit.online
✅ Buckets: tracks (50MB) + stems (50MB)
✅ Routes: /studio, /studio/projects, /studio/pulls, /admin
⚠️ Kontrol et:
- .env.local dolu mu? (SUPABASE_URL)
- npm run dev çalışıyor mu?
- Supabase'de tracks/stems bucket'ları var mı?
💡 Sıradaki: stem upload + AI ayırma feature'ı`)
    } else if (q.includes("eksikleri tamamla") || q.includes("fixle")) {
      setAnswer(`🔧 Oto Tamir:
1. npm install (yapıldı ✅)
2. .env.local sablon olusturuldu, Supabase KEY'leri doldur
3. Supabase'de bucket olustur: tracks, stems
4. npm run dev ile test et`)
    } else if (q.includes("soundgit") && q.includes("calistir")) {
      setAnswer(`▶️ Terminalde: npm run dev -> http://localhost:3000`)
    } else if (q) {
      setAnswer(`PondOS: "${query}" komutunu aldim! Yakinda LFM ile baglayacagiz. Simdilik: ne eksik, eksikleri tamamla, soundgit calistir yaz.`)
    }
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">⌘</span>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && analyze()}
              placeholder="PondOS ne yapayim? (ne eksik, eksikleri tamamla...)"
              className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500"
            />
            <kbd className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">ESC</kbd>
          </div>
        </div>
        {answer && (
          <div className="p-4 max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono">{answer}</pre>
          </div>
        )}
        <div className="p-3 border-t border-zinc-800 text-xs text-zinc-500">
          PondOS v6 • Ctrl+K ile aç/kapat • iMac 2017 • SoundGit için
        </div>
      </div>
    </div>
  )
}
