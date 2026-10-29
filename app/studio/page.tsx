"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useKnolli } from "@/lib/knolli"
type Track = { id: string, file_name: string, file_url: string, created_at: string }
function getLayaForFile(fileName: string) {
  const lower = fileName.toLowerCase()
  let genre='other', prob=0.5, bpm=124, key='F#m', daw='WAV', branch='main', color='#00ff88'
  if (lower.endsWith('.als')) { daw=' 【entity-Ableton¦canonical_name=Ableton】'; color='#00ff88' }
  else if (lower.endsWith('.logicx')) { daw=' 【entity-Logic¦canonical_name=Logic】'; color='#0088ff' }
  else if (lower.endsWith('.flp')) { daw='FL'; color='#ff0088' }
  else if (lower.endsWith('.cpr')) { daw='Cubase'; color='#ffaa00' }
  if (lower.includes('techno')||lower.includes('strange')||lower.includes('adana')) { genre='techno'; prob=0.727; bpm=124; key='F#m'; color='#00ff88' }
  else if (lower.includes('house')) { genre='house'; prob=0.75; color='#0088ff' }
  else if (lower.includes('trap')) { genre='trap'; prob=0.85; color='#ff0088' }
  return { genre, prob, bpm, key, daw, branch, color }
}
function WaveformPlayer({ url, color, comments }: { url: string, color: string, comments: { time: number, user: string, text: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const audio = audioRef.current; if (!audio) return
    const onTime = () => setCurrent(audio.currentTime)
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onMeta); audio.removeEventListener('ended', onEnd) }
  }, [])
  const initCtx = async () => {
    if (audioContextRef.current) return
    const audio = audioRef.current; if (!audio) return
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = ctx.createAnalyser(); analyser.fftSize = 128
    const source = ctx.createMediaElementSource(audio)
    source.connect(analyser); analyser.connect(ctx.destination)
    audioContextRef.current = ctx; analyserRef.current = analyser
  }
  const toggle = async () => {
    const audio = audioRef.current; if (!audio) return
    await initCtx()
    if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume()
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { await audio.play(); setIsPlaying(true); requestAnimationFrame(draw) }
  }
  const draw = () => {
    const canvas = canvasRef.current; const analyser = analyserRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0,0,w,h)
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,w,h)
    if (analyser && isPlaying) {
      const data = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(data)
      const barW = w / data.length * 2.5
      let x = 0
      for (let i=0;i<data.length;i++) {
        const barH = (data[i]/255)*h*0.8
        ctx.fillStyle = i < data.length/3 ? '#00ff88' : i < data.length*2/3 ? '#0088ff' : '#ff0088'
        ctx.globalAlpha = 0.3 + (data[i]/255)*0.7
        ctx.fillRect(x, (h-barH)/2, barW-1, barH)
        x += barW
      }
      ctx.globalAlpha = 1
    } else {
      ctx.fillStyle = '#222'
      for (let i=0;i<w;i+=4) { const bh = Math.random()*h*0.6 + h*0.1; ctx.fillRect(i, (h-bh)/2, 2, bh) }
    }
    ctx.fillStyle = color; ctx.globalAlpha = 0.15; ctx.fillRect(0,0,(current/(duration||1))*w,h); ctx.globalAlpha = 1
    ctx.fillStyle = color; ctx.fillRect((current/(duration||1))*w -1,0,2,h)
    comments.forEach(c => {
      const cx = (c.time/(duration||200))*w
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx, h/2, 5, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font='9px monospace'; ctx.fillText(c.user, cx+7, h/2-8)
    })
    if (isPlaying) requestAnimationFrame(draw)
  }
  const seek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; const audio = audioRef.current; if (!canvas || !audio) return
    const rect = canvas.getBoundingClientRect()
    const pct = (e.clientX - rect.left)/rect.width
    audio.currentTime = pct * (audio.duration||duration)
  }
  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} width={800} height={100} className="w-full h-24 bg-black border border-zinc-800 rounded cursor-pointer" onClick={seek} />
      <div className="flex justify-between text-[11px] text-zinc-500 mt-1.5 font-mono">
        <span className="text-zinc-400">{Math.floor(current/60)}:{String(Math.floor(current%60)).padStart(2,'0')} / {Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}</span>
        <span style={{ color }}>{isPlaying ? '● LIVE' : '○ PAUSED'} {Math.floor((current/(duration||1))*100)||0}% {Math.floor(current)}s</span>
      </div>
      <audio ref={audioRef} src={url} preload="metadata" crossOrigin="anonymous" />
      <button onClick={toggle} className="absolute top-3 left-3 w-11 h-11 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center font-bold shadow-lg border border-zinc-200">{isPlaying ? '❚❚' : '▶'}</button>
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
  const router = useRouter()
  const { laya, meta, setLayaFromFile, setPrivacy, setFriends, setOwner } = useKnolli()
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
      unique.forEach((t: Track) => { initLikes[t.id] = 134; initPlays[t.id] = 4670; initComments[t.id] = [{ time: 22, user: 'habehabe', text: '🔥 drop!' }, { time: 58, user: 'pondos', text: 'baris k remix?' }] })
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
  const handleDelete = async (id: string) => { if (!confirm('Silinsin mi?')) return; await fetch(`/api/tracks?id=${id}`, { method: 'DELETE' }); fetchTracks() }
  const handleLogout = () => { localStorage.removeItem('soundgit_user'); router.push('/') }
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">v21.1 Tone in Tone...</div>
  if (!user) return null
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1220px] mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold tracking-tight">SOUNDGIT STUDIO v21.1 Tone in Tone</h1><p className="text-xs text-zinc-500 mt-1">PondOS v21.1 - Siteye uyumlu, tone in tone, siyah + beyaz + sine wave renkleri - {tracks.length} tracks</p></div>
          <div className="flex items-center gap-3 text-xs"><span className="text-zinc-400">{user.email}</span><button onClick={handleLogout} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800">Çıkış</button></div>
        </div>
        <div className="space-y-6">
          {tracks.map((track) => {
            const tl = getLayaForFile(track.file_name)
            const trackComments = comments[track.id] || []
            return (
              <div key={track.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                <div className="p-5 flex gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">♫</div>
                      <div className="flex-1 min-w-0"><h2 className="font-bold text-[15px] truncate">{track.file_name.replace(/^\d+-/, '')}</h2><p className="text-[11px] text-zinc-500 mt-0.5">{user.email?.split('@')[0]} • {tl.genre} • {tl.daw} • {new Date(track.created_at).toLocaleDateString()} • Branch {tl.branch}</p></div>
                      <span className="text-[10px] px-2 py-1 rounded-full border" style={{ borderColor: tl.color, color: tl.color }}>{tl.genre} {Math.round(tl.prob*100)}%</span>
                    </div>
                    <WaveformPlayer url={track.file_url} color={tl.color} comments={trackComments} />
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <button onClick={() => setLikes(prev => ({ ...prev, [track.id]: (prev[track.id]||0)+1 }))} className="px-3 py-1.5 bg-black border border-zinc-800 hover:border-zinc-700 rounded-full text-xs flex items-center gap-1.5"><span className="text-zinc-400">♡</span> {likes[track.id]||0}</button>
                      <div className="flex-1 min-w-[200px] flex gap-2">
                        <input value={newComment[track.id]||''} onChange={e => setNewComment(prev => ({ ...prev, [track.id]: e.target.value }))} onKeyDown={e => e.key==='Enter' && addComment(track.id)} placeholder="Write a comment - marker olarak ekle" className="flex-1 px-3 py-1.5 bg-black border border-zinc-800 rounded-full text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" />
                        <button onClick={() => addComment(track.id)} className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-bold hover:bg-zinc-200">→</button>
                      </div>
                      <button className="px-3 py-1.5 bg-black border border-zinc-800 rounded-full text-xs hover:border-zinc-700">↗ Share</button>
                      <button onClick={() => { navigator.clipboard.writeText(track.file_url); alert('Link kopyalandı!') }} className="px-3 py-1.5 bg-black border border-zinc-800 rounded-full text-xs hover:border-zinc-700">🔗 Copy</button>
                      <button className="px-3 py-1.5 bg-black border border-zinc-800 rounded-full text-xs hover:border-zinc-700">+ Playlist</button>
                      <button onClick={() => handleDelete(track.id)} className="px-2 py-1.5 bg-black border border-zinc-800 rounded-full text-xs text-zinc-500 hover:text-white">✕</button>
                    </div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {trackComments.map((c,i) => (
                        <span key={i} className="text-[10px] px-2.5 py-1 bg-black border border-zinc-800 rounded-full">● {c.user} @{Math.floor(c.time)}s: {c.text}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-[200px] shrink-0">
                    <div className="w-[200px] h-[200px] bg-black rounded-xl border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${tl.color}22, transparent, ${tl.color}11)` }}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border-2" style={{ borderColor: `${tl.color}40`, background: `radial-gradient(circle, ${tl.color}20, transparent)` }}></div>
                      </div>
                      <div className="relative z-10 text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center text-black font-bold text-lg">♪</div>
                        <p className="text-[10px] mt-2 px-2 py-1 bg-zinc-900 rounded-full border border-zinc-800" style={{ color: tl.color }}>{tl.daw}</p>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: '68%', background: tl.color }}></div></div>
                        <div className="flex justify-between text-[9px] text-zinc-600 mt-1"><span>{tl.bpm} BPM</span><span>{tl.key}</span></div>
                      </div>
                    </div>
                    <div className="mt-3 bg-black rounded-xl border border-zinc-800 p-3">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700"></div>
                        <div><p className="text-xs font-bold">{user.email?.split('@')[0]}</p><p className="text-[10px] text-zinc-500">{tracks.length} tracks • {meta.friends.length} friends</p></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-zinc-900 rounded-lg py-2 border border-zinc-800"><p className="text-sm font-bold">{plays[track.id]||4670}</p><p className="text-[9px] text-zinc-500 tracking-wide">PLAYS</p></div>
                        <div className="bg-zinc-900 rounded-lg py-2 border border-zinc-800"><p className="text-sm font-bold">{likes[track.id]||134}</p><p className="text-[9px] text-zinc-500 tracking-wide">LIKES</p></div>
                        <div className="bg-zinc-900 rounded-lg py-2 border border-zinc-800"><p className="text-sm font-bold">{Math.floor((likes[track.id]||134)/8)}</p><p className="text-[9px] text-zinc-500 tracking-wide">REPOSTS</p></div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-zinc-200">Follow</button>
                        <button className="flex-1 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs hover:bg-zinc-800">Message</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {tracks.length===0 && <div className="p-10 text-center bg-zinc-900 rounded-xl border border-dashed border-zinc-800"><p className="text-sm text-zinc-500">Henüz track yok - DAW projesi yükle, 【entity-SoundCloud¦canonical_name=SoundCloud】 gibi görünsün!</p></div>}
        </div>
        <div className="mt-8 p-5 bg-zinc-900 rounded-xl border border-dashed border-zinc-700">
          <h3 className="text-sm font-bold mb-3">🎛️ DAW Upload - Tone in Tone - Siteye uyumlu</h3>
          <div className="grid md:grid-cols-3 gap-2 mb-4 text-[11px]">
            <span className="px-3 py-2 bg-black border border-zinc-800 rounded-full text-center"> Ableton .als <span className="text-[#00ff88]">●</span></span>
            <span className="px-3 py-2 bg-black border border-zinc-800 rounded-full text-center"> Logic .logicx <span className="text-[#0088ff]">●</span></span>
            <span className="px-3 py-2 bg-black border border-zinc-800 rounded-full text-center">Cubase .cpr <span className="text-[#ffaa00]">●</span></span>
            <span className="px-3 py-2 bg-black border border-zinc-800 rounded-full text-center">FL Studio .flp <span className="text-[#ff0088]">●</span></span>
            <span className="px-3 py-2 bg-black border border-zinc-800 rounded-full text-center">Audio .wav .mp3</span>
            <span className="px-3 py-2 bg-black border border-zinc-800 rounded-full text-center">Stems .zip</span>
          </div>
          <input type="file" accept=".wav,.mp3,.flac,.ogg,.als,.logicx,.flp,.cpr,.zip" onChange={handleUpload} disabled={uploading} className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:bg-white file:text-black file:font-bold file:text-xs hover:file:bg-zinc-200" />
          <p className="text-[11px] text-zinc-500 mt-3">Tone in tone: Siyah + Beyaz + Sine wave renkleri (#00ff88 #0088ff #ff0088) - Siteyle uyumlu!</p>
        </div>
      </div>
    </div>
  )
}
