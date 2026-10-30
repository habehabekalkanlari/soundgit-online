"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useKnolli } from "@/lib/knolli"
type Track = { id: string, file_name: string, file_url: string, created_at: string }
function getLayaForFile(fileName: string) {
  const lower = fileName.toLowerCase()
  let genre='other', bpm=124, key='F#m', daw='WAV', color='#00ff88'
  if (lower.endsWith('.als')) { daw=' 【entity-Ableton¦canonical_name=Ableton】'; color='#00ff88' }
  else if (lower.endsWith('.logicx')) { daw=' 【entity-Logic¦canonical_name=Logic】'; color='#0088ff' }
  else if (lower.endsWith('.flp')) { daw='FL'; color='#ff0088' }
  if (lower.includes('techno')) { genre='techno'; color='#00ff88' }
  return { genre, bpm, key, daw, color }
}
function getCollabReport(fileName: string) {
  const lower = fileName.toLowerCase()
  const needs: string[] = []
  const checks: { icon: string, iconImg: string, name: string, value: string, status: string }[] = []
  let score = 100
  const hasVocal = lower.includes('vocal')
  if (!hasVocal) { needs.push('vocal'); score -= 25; checks.push({ icon: '🎤', iconImg: '/icons/vocal.png', name: 'Vocal', value: 'Yok', status: 'missing' }) }
  else checks.push({ icon: '🎤', iconImg: '/icons/vocal.png', name: 'Vocal', value: 'Var', status: 'has' })
  const hasEnergy = lower.includes('drop') || lower.includes('energetic')
  if (!hasEnergy) { needs.push('energy'); score -= 15; checks.push({ icon: '🔥', iconImg: '/icons/energy.png', name: 'Enerji', value: 'Düşük', status: 'low' }) }
  else checks.push({ icon: '🔥', iconImg: '/icons/energy.png', name: 'Enerji', value: 'İyi', status: 'has' })
  const hasDance = lower.includes('hihat') || lower.includes('groove')
  if (!hasDance) { needs.push('danceability'); score -= 15; checks.push({ icon: '💃', iconImg: '/icons/groove.png', name: 'Groove', value: 'Düşük', status: 'low' }) }
  else checks.push({ icon: '💃', iconImg: '/icons/groove.png', name: 'Groove', value: 'İyi', status: 'has' })
  const hasDrop = lower.includes('drop')
  if (!hasDrop) { needs.push('drop'); score -= 10; checks.push({ icon: '💥', iconImg: '/icons/drop.png', name: 'Drop', value: 'Yok', status: 'missing' }) }
  else checks.push({ icon: '💥', iconImg: '/icons/drop.png', name: 'Drop', value: 'Var', status: 'has' })
  const hasBass = lower.includes('bass')
  if (!hasBass) { needs.push('bass'); score -= 5; checks.push({ icon: '🎸', iconImg: '/icons/bass.png', name: 'Bass', value: 'Zayıf', status: 'low' }) }
  else checks.push({ icon: '🎸', iconImg: '/icons/bass.png', name: 'Bass', value: 'Var', status: 'has' })
  const hasDrums = lower.includes('drum')
  if (!hasDrums) { needs.push('drums'); score -= 10; checks.push({ icon: '🥁', iconImg: '/icons/drums.png', name: 'Drums', value: 'Yok', status: 'missing' }) }
  else checks.push({ icon: '🥁', iconImg: '/icons/drums.png', name: 'Drums', value: 'Var', status: 'has' })
  return { score: Math.max(0, score), needs, checks, collabOpen: score < 80 }
}
function TimelinePlayer({ url, color, comments }: { url: string, color: string, comments: { time: number, user: string, text: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
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
    comments.forEach(c => { const cx = (c.time / (duration||200)) * w; ctx.fillStyle = c.time <= current ? color : '#555'; ctx.beginPath(); ctx.arc(cx, h*0.25, 5, 0, Math.PI*2); ctx.fill() })
  }, [current, duration, comments, color])
  const toggle = async () => { const audio = audioRef.current; if (!audio) return; if (isPlaying) { audio.pause(); setIsPlaying(false) } else { await audio.play(); setIsPlaying(true) } }
  const seek = (e: React.MouseEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current; const audio = audioRef.current; if (!canvas || !audio) return; const rect = canvas.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; audio.currentTime = pct * (audio.duration||duration||200); setCurrent(pct*(audio.duration||duration||200)) }
  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} width={800} height={100} className="w-full h-[88px] bg-black border border-zinc-800 rounded-lg cursor-pointer" onClick={seek} />
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">{isPlaying ? '❚❚' : '▶'}</button>
          <span className="text-[11px] font-mono text-zinc-400">{Math.floor(current/60)}:{String(Math.floor(current%60)).padStart(2,'0')} / {Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}</span>
        </div>
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
      const initLikes: Record<string, number> = {}; const initComments: Record<string, any[]> = {}
      unique.forEach((t: Track) => { initLikes[t.id]=134; initComments[t.id]=[{ time: 12, user: 'habehabe', text: 'drop' }, { time: 45, user: 'pondos', text: 'vocal?' }] })
      setLikes(initLikes); setComments(initComments)
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
    alert(`Havuz: ${type} - ${track.file_name.replace(/^\d+-/, '')}`)
  }
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-sm">Yükleniyor...</div>
  if (!user) return null
  const poolTracks = showPool ? tracks.filter(t => getCollabReport(t.file_name).collabOpen) : tracks
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1160px] mx-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-bold tracking-tight">SOUNDGIT STUDIO</h1>
          <div className="flex gap-2">
            <button onClick={()=>setShowPool(!showPool)} className={`px-3 py-1.5 rounded-full text-xs border ${showPool ? 'bg-white text-black border-white' : 'bg-black border-zinc-800 text-zinc-400'}`}>{showPool ? `Havuz: ${poolTracks.length}` : 'Tüm'}</button>
            <button onClick={handleLogout} className="px-3 py-1.5 bg-black border border-zinc-800 rounded-full text-xs">Çıkış</button>
          </div>
        </div>
        <div className="space-y-4">
          {poolTracks.map((track) => {
            const tl = getLayaForFile(track.file_name)
            const collab = getCollabReport(track.file_name)
            const trackComments = comments[track.id] || []
            return (
              <div key={track.id} className="bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-4 flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="font-medium text-sm truncate flex-1">{track.file_name.replace(/^\d+-/, '')}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border shrink-0" style={{ borderColor: tl.color, color: tl.color }}>{tl.genre} {tl.bpm}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${collab.score < 50 ? 'border-red-900 text-red-300' : collab.score < 80 ? 'border-orange-900 text-orange-300' : 'border-green-900 text-green-300'}`}>{collab.score}</span>
                    </div>
                    <TimelinePlayer url={track.file_url} color={tl.color} comments={trackComments} />
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {collab.checks.map((c,i) => (
                        <span key={i} className={`text-[10px] px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 ${c.status === 'has' ? 'border-zinc-700 text-zinc-500' : 'border-orange-900/50 text-orange-300 bg-orange-950/20'}`}>
                          <img src={c.iconImg} alt={c.name} className="w-3.5 h-3.5 invert brightness-0 invert opacity-80" style={{ filter: 'invert(1) brightness(2)' }} />
                          {c.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      <button onClick={()=>handleCollab(track, 'Vocal')} className="px-3.5 py-1.5 bg-white text-black rounded-full text-xs font-medium flex items-center gap-1.5"><img src="/icons/vocal.png" className="w-3.5 h-3.5" alt="" />Vocal</button>
                      <button onClick={()=>handleCollab(track, 'Drums')} className="px-3.5 py-1.5 bg-zinc-800 rounded-full text-xs flex items-center gap-1.5"><img src="/icons/drums.png" className="w-3.5 h-3.5 invert" alt="" />Drums</button>
                      <button onClick={()=>handleCollab(track, 'Bass')} className="px-3.5 py-1.5 bg-zinc-800 rounded-full text-xs flex items-center gap-1.5"><img src="/icons/bass.png" className="w-3.5 h-3.5 invert" alt="" />Bass</button>
                      <button onClick={()=>handleCollab(track, 'Drop')} className="px-3.5 py-1.5 bg-zinc-800 rounded-full text-xs flex items-center gap-1.5"><img src="/icons/drop.png" className="w-3.5 h-3.5 invert" alt="" />Drop</button>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setLikes(p => ({ ...p, [track.id]: (p[track.id]||0)+1 }))} className="px-2.5 py-1 bg-black border border-zinc-800 rounded-full text-xs">♡ {likes[track.id]||0}</button>
                      <input value={newComment[track.id]||''} onChange={e => setNewComment(prev => ({ ...prev, [track.id]: e.target.value }))} onKeyDown={e => e.key==='Enter' && addComment(track.id)} placeholder="Yorum" className="flex-1 px-3 py-1 bg-black border border-zinc-800 rounded-full text-xs" />
                      <button onClick={() => handleDelete(track.id)} className="px-2 py-1 bg-black border border-zinc-800 rounded-full text-xs">✕</button>
                    </div>
                    {trackComments.length>0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {trackComments.map((c,i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-black border border-zinc-800 rounded-full text-zinc-500">{c.user}: {c.text}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-[160px] shrink-0">
                    <div className="w-full aspect-square bg-black rounded-xl border border-zinc-800 flex items-center justify-center relative">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">♪</div>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full" style={{ width: `${collab.score}%`, background: tl.color }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-6">
          <input type="file" accept=".wav,.mp3,.als,.logicx,.flp,.zip" onChange={handleUpload} disabled={uploading} className="block w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:text-xs" />
        </div>
      </div>
    </div>
  )
}
