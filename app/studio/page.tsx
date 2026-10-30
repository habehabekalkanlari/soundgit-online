"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useKnolli } from "@/lib/knolli"
type Track = { id: string, file_name: string, file_url: string, created_at: string }
function getLayaForFile(fileName: string) {
  const lower = fileName.toLowerCase()
  let genre='other', bpm=124, key='F#m', daw='WAV', color='#00ff88'
  if (lower.endsWith('.als')) { daw=' Ableton'; color='#00ff88' }
  else if (lower.endsWith('.logicx')) { daw=' Logic'; color='#0088ff' }
  else if (lower.endsWith('.flp')) { daw='FL'; color='#ff0088' }
  if (lower.includes('techno')) { genre='techno'; color='#00ff88' }
  return { genre, bpm, key, daw, color }
}
function getCollabReport(fileName: string) {
  const lower = fileName.toLowerCase()
  const needs: string[] = []
  const checks: { icon: string, name: string, value: string, status: string }[] = []
  let score = 100
  const hasVocal = lower.includes('vocal')
  if (!hasVocal) { needs.push('vocal'); score -= 25; checks.push({ icon: '🎤', name: 'Vocal', value: 'Yok %0', status: 'missing' }) }
  else checks.push({ icon: '🎤', name: 'Vocal', value: 'Var %80', status: 'has' })
  const hasEnergy = lower.includes('drop') || lower.includes('energetic')
  if (!hasEnergy) { needs.push('energy'); score -= 15; checks.push({ icon: '🔥', name: 'Enerji', value: '50% Düşük', status: 'low' }) }
  else checks.push({ icon: '🔥', name: 'Enerji', value: '80% İyi', status: 'has' })
  const hasDance = lower.includes('hihat') || lower.includes('groove')
  if (!hasDance) { needs.push('danceability'); score -= 15; checks.push({ icon: '💃', name: 'Danceability', value: '40% Düşük', status: 'low' }) }
  else checks.push({ icon: '💃', name: 'Danceability', value: '70% İyi', status: 'has' })
  const hasDrop = lower.includes('drop')
  if (!hasDrop) { needs.push('drop'); score -= 10; checks.push({ icon: '💥', name: 'Drop', value: 'Yok', status: 'missing' }) }
  else checks.push({ icon: '💥', name: 'Drop', value: 'Var', status: 'has' })
  const hasBass = lower.includes('bass')
  if (!hasBass) { needs.push('bass'); score -= 5; checks.push({ icon: '🎸', name: 'Bass', value: 'Zayıf', status: 'low' }) }
  else checks.push({ icon: '🎸', name: 'Bass', value: 'Var', status: 'has' })
  const hasDrums = lower.includes('drum')
  if (!hasDrums) { needs.push('drums'); score -= 10; checks.push({ icon: '🥁', name: 'Drums', value: 'Yok', status: 'missing' }) }
  else checks.push({ icon: '🥁', name: 'Drums', value: 'Var', status: 'has' })
  const issues = []
  if (!hasVocal) issues.push({ icon: '🎤', msg: 'Vocal: Yok! %0, lazım!' })
  if (!hasEnergy) issues.push({ icon: '🔥', msg: 'Enerji: Düşük, 50%, drop lazım!' })
  if (!hasDance) issues.push({ icon: '💃', msg: 'Danceability: Düşük, hi-hat lazım!' })
  if (!hasVocal) issues.push({ icon: '💡', msg: 'Öneri: Vocal eklenirse 90/100 olur!' })
  return { score: Math.max(0, score), needs, checks, issues, collabOpen: score < 80 }
}
function TimelinePlayer({ url, color, comments }: { url: string, color: string, comments: { time: number, user: string, text: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const waveformData = useRef<number[]>([])
  useEffect(() => { waveformData.current = Array.from({ length: 400 }, () => Math.random()*0.8+0.2) }, [])
  useEffect(() => {
    const audio = audioRef.current; if (!audio) return
    const onTime = () => setCurrent(audio.currentTime)
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime); audio.addEventListener('loadedmetadata', onMeta); audio.addEventListener('ended', onEnd)
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onMeta); audio.removeEventListener('ended', onEnd) }
  }, [])
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0,0,w,h); ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,w,h)
    const data = waveformData.current; const barW = w / data.length
    data.forEach((v,i) => {
      const barH = v * h * 0.85; const x = i * barW
      const isPlayed = (i / data.length) < (current / (duration||1))
      ctx.fillStyle = isPlayed ? color : '#2a2a2a'; ctx.globalAlpha = isPlayed ? 1 : 0.8
      ctx.fillRect(x, (h-barH)/2, barW-1, barH)
    })
    ctx.globalAlpha = 1
    const playheadX = (current / (duration||1)) * w
    ctx.fillStyle = color; ctx.fillRect(playheadX-1,0,2,h)
    ctx.beginPath(); ctx.arc(playheadX, h/2, 6, 0, Math.PI*2); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke()
    comments.forEach(c => { const cx = (c.time / (duration||200)) * w; ctx.fillStyle = c.time <= current ? color : '#555'; ctx.beginPath(); ctx.arc(cx, h*0.25, 5, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke() })
    if (hoverTime !== null) { const hx = (hoverTime / (duration||1)) * w; ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(hx-1,0,2,h); ctx.fillStyle = '#fff'; ctx.font='10px monospace'; ctx.fillText(`${Math.floor(hoverTime/60)}:${String(Math.floor(hoverTime%60)).padStart(2,'0')}`, hx+6, 12) }
  }, [current, duration, comments, color, hoverTime])
  const toggle = async () => { const audio = audioRef.current; if (!audio) return; if (isPlaying) { audio.pause(); setIsPlaying(false) } else { await audio.play(); setIsPlaying(true) } }
  const seek = (e: React.MouseEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current; const audio = audioRef.current; if (!canvas || !audio) return; const rect = canvas.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; audio.currentTime = pct * (audio.duration||duration||200); setCurrent(pct*(audio.duration||duration||200)) }
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current; if (!canvas) return; const rect = canvas.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; setHoverTime(pct * (duration||200)) }
  return (
    <div className="relative w-full group">
      <canvas ref={canvasRef} width={800} height={100} className="w-full h-[96px] bg-black border border-zinc-800 rounded-lg cursor-pointer" onClick={seek} onMouseMove={onMouseMove} onMouseLeave={()=>setHoverTime(null)} />
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-bold hover:bg-zinc-200 border">{isPlaying ? '❚❚' : '▶'}</button>
          <span className="text-[11px] font-mono text-zinc-400">{Math.floor(current/60)}:{String(Math.floor(current%60)).padStart(2,'0')} / {Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: color, color }}>{isPlaying ? `● ${Math.floor((current/(duration||1))*100)}% akıyor` : '○ durdu'}</span>
        </div>
        <span className="text-[10px] text-zinc-600">Nereye tıklarsan oraya gider</span>
      </div>
      <audio ref={audioRef} src={url} preload="metadata" crossOrigin="anonymous" />
    </div>
  )
}
export default function Studio() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Record<string, { time: number, user: string, text: string }[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [likes, setLikes] = useState<Record<string, number>>({})
  const [plays, setPlays] = useState<Record<string, number>>({})
  const [showPool, setShowPool] = useState(false)
  const router = useRouter()
  const { setLayaFromFile, setOwner } = useKnolli()
  useEffect(() => {
    const checkAuth = () => {
      const hash = window.location.hash
      if (hash.includes('access_token')) {
        try {
          const params = new URLSearchParams(hash.substring(1))
          const token = params.get('access_token')
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const u = { email: payload.email, avatar: payload.user_metadata?.avatar_url }
            setUser(u); setOwner(payload.email); localStorage.setItem('soundgit_user', JSON.stringify(u))
            window.history.replaceState(null, '', window.location.pathname)
            setLoading(false); fetchTracks(); return
          }
        } catch {}
      }
      const saved = localStorage.getItem('soundgit_user')
      if (saved) { try { const u = JSON.parse(saved); setUser(u); setOwner(u.email); setLoading(false); fetchTracks() } catch { localStorage.clear(); router.push('/') } }
      else { router.push('/') }
    }
    checkAuth()
  }, [router])
  const fetchTracks = async () => {
    const res = await fetch('/api/tracks'); const j = await res.json()
    if (j.tracks) {
      const unique = j.tracks.filter((t: Track, idx: number, arr: Track[]) => arr.findIndex((x: Track) => x.file_name === t.file_name) === idx)
      setTracks(unique)
      if (unique.length>0) setLayaFromFile(unique[0].file_name, unique[0].file_url)
      const initLikes: Record<string, number> = {}; const initPlays: Record<string, number> = {}; const initComments: Record<string, any[]> = {}
      unique.forEach((t: Track) => { initLikes[t.id]=134; initPlays[t.id]=4670; initComments[t.id]=[{ time: 12, user: 'habehabe', text: '🔥 drop lazım' }, { time: 45, user: 'pondos', text: 'vocal?' }, { time: 78, user: 'adana', text: 'hi-hat lazım!' }] })
      setLikes(initLikes); setPlays(initPlays); setComments(initComments)
    }
  }
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true)
    try {
      const fileName = `${Date.now()}-${file.name}`
      const res = await fetch('/api/upload-url', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ fileName }) })
      const j = await res.json(); 
      await fetch(j.signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      const publicUrl = `https://rvuiklogpbknbqvizddv.supabase.co/storage/v1/object/public/tracks/${j.path}`
      setLayaFromFile(file.name, publicUrl)
      await fetch('/api/tracks', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ file_name: file.name, file_url: publicUrl }) })
      fetchTracks()
    } catch (err: any) { alert(err.message) } finally { setUploading(false); e.target.value = '' }
  }
  const addComment = (trackId: string) => {
    const text = newComment[trackId]; if (!text) return
    const time = Math.random()*120
    setComments(prev => ({ ...prev, [trackId]: [...(prev[trackId]||[]), { time, user: user?.email?.split('@')[0]||'you', text }] }))
    setNewComment(prev => ({ ...prev, [trackId]: '' }))
  }
  const handleDelete = async (id: string) => { if (!confirm('Sil?')) return; await fetch(`/api/tracks?id=${id}`, { method: 'DELETE' }); fetchTracks() }
  const handleLogout = () => { localStorage.removeItem('soundgit_user'); router.push('/') }
  const handleCollab = (track: Track, type: string) => {
    alert(`🎉 Havuz Mantığı!\n\n${type} ekleyeceksin!\n\nProje: ${track.file_name}\n\n1. Projeyi dinle (timeline akıyor)\n2. Üstüne ${type} ekle\n3. Tekrar buraya yükle, kiminse onunla paylaş\n4. Parça oluşsun!\n\nPara yok, vesile oluyoruz! Biri yazıyor, diğeri üstüne ekliyor!`)
  }
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">v24 Havuz akıyor...</div>
  if (!user) return null
  const poolTracks = showPool ? tracks.filter(t => getCollabReport(t.file_name).collabOpen) : tracks
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1220px] mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">SOUNDGIT STUDIO v24 Havuz</h1>
            <p className="text-xs text-zinc-500 mt-1">PondOS v24 - Havuz Mantığı - Biri yazıyor, diğeri üstüne ekliyor, parça oluşuyor! Para yok, vesile oluyoruz!</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShowPool(!showPool)} className={`px-4 py-2 rounded-full text-xs font-bold border ${showPool ? 'bg-white text-black border-white' : 'bg-black border-zinc-800 text-zinc-400'}`}>{showPool ? '🌊 Havuz: Açık' : '🌊 Havuz: Tüm Projeler'} {showPool ? `(${poolTracks.length})` : ''}</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-black border border-zinc-800 rounded-full text-xs">Çıkış</button>
          </div>
        </div>
        <div className="space-y-6">
          {poolTracks.map((track) => {
            const tl = getLayaForFile(track.file_name)
            const collab = getCollabReport(track.file_name)
            const trackComments = comments[track.id] || []
            return (
              <div key={track.id} className={`bg-zinc-900 rounded-xl border overflow-hidden ${collab.collabOpen ? 'border-orange-900/50' : 'border-zinc-800'}`}>
                <div className="p-5 flex gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <h2 className="font-bold text-sm truncate flex-1">{track.file_name.replace(/^\d+-/, '')}</h2>
                      <span className="text-[10px] px-2 py-1 rounded-full border" style={{ borderColor: tl.color, color: tl.color }}>{tl.genre} {tl.bpm}</span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${collab.score < 50 ? 'bg-red-950 border-red-800 text-red-300' : collab.score < 80 ? 'bg-orange-950 border-orange-800 text-orange-300' : 'bg-green-950 border-green-800 text-green-300'}`}>🔍 Collab: {collab.score}/100 {collab.collabOpen ? '- Açık!' : '- İyi!'}</span>
                    </div>
                    <TimelinePlayer url={track.file_url} color={tl.color} comments={trackComments} />
                    {/* Laya Collab Raporu */}
                    <div className="mt-4 p-3 bg-black border border-zinc-800 rounded-xl">
                      <p className="text-[11px] font-bold mb-2">🔍 Laya Collab Raporu - {collab.score}/100 {collab.collabOpen ? 'Collab Lazım!' : 'İyi!'}</p>
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        {collab.checks.map((c,i) => (
                          <span key={i} className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 ${c.status === 'has' ? 'bg-green-950/30 border-green-900/50 text-green-300' : c.status === 'missing' ? 'bg-red-950/30 border-red-900/50 text-red-300' : 'bg-orange-950/30 border-orange-900/50 text-orange-300'}`}>{c.icon} {c.name}: {c.value} {c.status === 'has' ? '✅' : c.status === 'missing' ? '❌' : '⚠️'}</span>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {collab.issues.map((iss,i) => (
                          <p key={i} className={`text-[11px] px-2 py-1 rounded-lg ${iss.icon === '💡' ? 'bg-blue-950/30 border border-blue-900/50 text-blue-300' : iss.icon === '🎤' && iss.msg.includes('Yok') ? 'bg-red-950/20 text-red-300' : 'bg-zinc-900 text-zinc-300'}`}>{iss.icon} {iss.msg}</p>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2">💡 Öneri: Vocal eklenirse 90/100 olur! | Skor: {collab.score}/100 - {collab.collabOpen ? 'Collab lazım!' : 'İyi!'}</p>
                    </div>
                    {/* Collab Butonları - Havuz Mantığı */}
                    <div className="mt-3">
                      <p className="text-[11px] font-bold mb-2">🌊 Havuz Mantığı - Biri yazıyor, diğeri üstüne ekliyor!</p>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={()=>handleCollab(track, 'Vocal')} className="px-3 py-1.5 bg-white text-black rounded-full text-xs font-bold hover:bg-zinc-200">🎤 Vocal Ekleyeceğim</button>
                        <button onClick={()=>handleCollab(track, 'Drums')} className="px-3 py-1.5 bg-black border border-zinc-700 rounded-full text-xs hover:bg-zinc-900">🥁 Drums Ekleyeceğim</button>
                        <button onClick={()=>handleCollab(track, 'Bass')} className="px-3 py-1.5 bg-black border border-zinc-700 rounded-full text-xs hover:bg-zinc-900">🎸 Bass Ekleyeceğim</button>
                        <button onClick={()=>handleCollab(track, 'Drop')} className="px-3 py-1.5 bg-black border border-zinc-700 rounded-full text-xs hover:bg-zinc-900">💥 Drop Ekleyeceğim</button>
                        <button onClick={()=>handleCollab(track, 'Hi-hat')} className="px-3 py-1.5 bg-black border border-zinc-700 rounded-full text-xs hover:bg-zinc-900">💃 Hi-hat Ekleyeceğim</button>
                        <button onClick={()=>handleCollab(track, 'Enerji')} className="px-3 py-1.5 bg-black border border-zinc-700 rounded-full text-xs hover:bg-zinc-900">🔥 Enerji Ekleyeceğim</button>
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-2">Para yok, vesile oluyoruz! Projeyi dinle, üstüne ekle, tekrar paylaş, parça oluşsun!</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setLikes(p => ({ ...p, [track.id]: (p[track.id]||0)+1 }))} className="px-3 py-1.5 bg-black border border-zinc-800 rounded-full text-xs">♡ {likes[track.id]||0}</button>
                      <input value={newComment[track.id]||''} onChange={e => setNewComment(prev => ({ ...prev, [track.id]: e.target.value }))} onKeyDown={e => e.key==='Enter' && addComment(track.id)} placeholder="Yorum ekle - timeline'da marker olur" className="flex-1 px-3 py-1.5 bg-black border border-zinc-800 rounded-full text-xs" />
                      <button onClick={() => addComment(track.id)} className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-bold">Ekle</button>
                      <button onClick={() => handleDelete(track.id)} className="px-2 py-1.5 bg-black border border-zinc-800 rounded-full text-xs">✕</button>
                    </div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {trackComments.map((c,i) => (
                        <span key={i} className="text-[10px] px-2.5 py-1 bg-black border border-zinc-800 rounded-full" style={{ borderColor: c.time ? tl.color+'60' : undefined }}>● {c.user} @{Math.floor(c.time)}s: {c.text}</span>
                      ))}
                    </div>
                    {collab.needs.length > 0 && (
                      <div className="mt-3 flex gap-1.5 flex-wrap">
                        {collab.needs.map((need,i) => (
                          <span key={i} className="text-[9px] px-2 py-1 bg-orange-950/30 border border-orange-900/50 rounded-full text-orange-300">#{need}-aranıyor</span>
                        ))}
                        <span className="text-[9px] px-2 py-1 bg-black border border-zinc-800 rounded-full text-zinc-500">#collab-açık #havuz #para-yok #vesile</span>
                      </div>
                    )}
                  </div>
                  <div className="w-[200px]">
                    <div className="w-[200px] h-[200px] bg-black rounded-xl border border-zinc-800 flex items-center justify-center relative">
                      <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold">♪</div>
                      <div className="absolute bottom-2 left-2 right-2 h-1 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full" style={{ width: `${collab.score}%`, background: collab.score < 50 ? '#ef4444' : collab.score < 80 ? '#f97316' : '#22c55e' }}></div></div>
                      <div className="absolute top-2 left-2 text-[9px] px-2 py-1 bg-black/80 border border-zinc-800 rounded-full">{collab.score}/100</div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-black border border-zinc-800 rounded-lg py-2"><p className="text-sm font-bold">{plays[track.id]||4670}</p><p className="text-[9px] text-zinc-500">PLAYS</p></div>
                      <div className="bg-black border border-zinc-800 rounded-lg py-2"><p className="text-sm font-bold">{likes[track.id]||134}</p><p className="text-[9px] text-zinc-500">LIKES</p></div>
                      <div className="bg-black border border-zinc-800 rounded-lg py-2"><p className="text-sm font-bold">{collab.needs.length}</p><p className="text-[9px] text-zinc-500">EKSİK</p></div>
                    </div>
                    <div className="mt-2 p-2 bg-black border border-zinc-800 rounded-lg">
                      <p className="text-[10px] font-bold">🌊 Havuz</p>
                      <p className="text-[9px] text-zinc-500 mt-1">Biri yazıyor, diğeri üstüne ekliyor, parça oluşuyor! Para yok, vesile!</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-8 p-5 bg-zinc-900 rounded-xl border border-dashed border-zinc-700">
          <input type="file" accept=".wav,.mp3,.als,.logicx,.flp,.cpr,.zip" onChange={handleUpload} disabled={uploading} className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:bg-white file:text-black file:font-bold" />
          <p className="text-[11px] text-zinc-500 mt-2">Havuz mantığı: Projeyi yükle, dinle, geliştir, tekrar paylaş, parça oluşsun! {uploading ? 'Yükleniyor...' : 'DAW + Audio - Tone in tone - Havuz'}</p>
        </div>
      </div>
    </div>
  )
}
