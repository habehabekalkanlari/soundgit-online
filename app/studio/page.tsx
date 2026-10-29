"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useKnolli } from "@/lib/knolli"
type Track = { id: string, file_name: string, file_url: string, created_at: string }
function getLayaForFile(fileName: string) {
  const lower = fileName.toLowerCase()
  let genre='other', prob=0.5, bpm=124, key='F#m', daw='WAV', branch='main'
  if (lower.endsWith('.als')) daw=' 【entity-Ableton¦canonical_name=Ableton】 Live'
  else if (lower.endsWith('.logicx')) daw=' 【entity-Logic¦canonical_name=Logic】 Pro'
  else if (lower.endsWith('.flp')) daw=' 【entity-FL Studio¦canonical_name=FL Studio】'
  else if (lower.endsWith('.cpr')) daw='Cubase'
  else if (lower.endsWith('.zip')) daw='Stems'
  if (lower.includes('techno')||lower.includes('strange')||lower.includes('adana')) { genre='techno'; prob=0.727; bpm=124; key='F#m' }
  return { genre, prob, bpm, key, daw, branch: lower.includes('vocal')?'vocal':'main' }
}
function WaveformPlayer({ url, comments }: { url: string, comments: { time: number, user: string, text: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationRef = useRef<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [freqData, setFreqData] = useState<number[]>(Array(64).fill(0))
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setCurrent(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => { audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('loadedmetadata', onLoaded); audio.removeEventListener('ended', onEnded) }
  }, [])
  const initAudioContext = async () => {
    if (audioContextRef.current) return
    const audio = audioRef.current; if (!audio) return
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 128
    const source = ctx.createMediaElementSource(audio)
    source.connect(analyser)
    analyser.connect(ctx.destination)
    audioContextRef.current = ctx
    analyserRef.current = analyser
  }
  const togglePlay = async () => {
    const audio = audioRef.current; if (!audio) return
    await initAudioContext()
    if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume()
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { await audio.play(); setIsPlaying(true); draw() }
  }
  const draw = () => {
    const canvas = canvasRef.current; const analyser = analyserRef.current
    if (!canvas || !analyser) { animationRef.current = requestAnimationFrame(draw); return }
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const w = canvas.width, h = canvas.height
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)
    setFreqData(Array.from(dataArray).slice(0,64))
    ctx.clearRect(0,0,w,h)
    const barWidth = w / dataArray.length * 2.5
    let x = 0
    for (let i=0;i<dataArray.length;i++) {
      const barHeight = (dataArray[i] / 255) * h * 0.8
      const isCurrentPos = Math.abs((current/duration)*w - x) < 5
      ctx.fillStyle = isCurrentPos ? '#ff5500' : `hsl(${120 + dataArray[i]}, 80%, 50%)`
      ctx.fillRect(x, (h-barHeight)/2, barWidth-1, barHeight)
      x += barWidth
    }
    ctx.fillStyle = 'rgba(255,85,0,0.15)'
    ctx.fillRect(0,0,(current/(duration||1))*w,h)
    ctx.fillStyle = '#ff5500'
    ctx.fillRect((current/(duration||1))*w -1,0,2,h)
    comments.forEach(c => {
      const cx = (c.time / (duration||200)) * w
      ctx.fillStyle = '#ff5500'
      ctx.beginPath(); ctx.arc(cx, h/2, 6, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = 'white'; ctx.font='9px monospace'; ctx.fillText(c.user, cx+8, h/2-10)
    })
    if (isPlaying) animationRef.current = requestAnimationFrame(draw)
  }
  useEffect(() => { if (isPlaying) draw(); else cancelAnimationFrame(animationRef.current) }, [isPlaying, current])
  const seek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; const audio = audioRef.current; if (!canvas || !audio) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    audio.currentTime = pct * (audio.duration||duration)
    setCurrent(pct*(audio.duration||duration))
  }
  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} width={800} height={100} className="w-full h-24 bg-[#0a0a0a] cursor-pointer border border-[#222] rounded" onClick={seek} />
      <div className="flex justify-between text-[11px] text-zinc-400 mt-1 font-mono"><span>{Math.floor(current/60)}:{String(Math.floor(current%60)).padStart(2,'0')} / {Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}</span><span className="flex gap-1">{freqData.slice(0,8).map((f,i) => <span key={i} className="w-1 h-3 bg-[#ff5500]" style={{ height: `${(f/255)*16+2}px` }}></span>)} Freq: {freqData[0]}Hz</span></div>
      <audio ref={audioRef} src={url} preload="metadata" crossOrigin="anonymous" />
      <button onClick={togglePlay} className="absolute top-2 left-2 w-10 h-10 rounded-full bg-[#ff5500] hover:bg-[#ff6600] flex items-center justify-center text-white font-bold text-lg shadow-lg">{isPlaying ? '❚❚' : '▶'}</button>
      <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 bg-black/70 rounded text-white">{isPlaying ? '● LIVE' : '○ PAUSED'} {Math.floor((current/duration)*100)||0}%</div>
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
      unique.forEach((t: Track) => { initLikes[t.id] = 134+Math.floor(Math.random()*50); initPlays[t.id] = 4670+Math.floor(Math.random()*1000); initComments[t.id] = [{ time: 22, user: 'habehabe', text: '🔥 drop!' }, { time: 85, user: 'pondos', text: 'nice mix @2:22' }] })
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
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">v20.1 Real Audio...</div>
  if (!user) return null
  return (
    <div className="min-h-screen bg-[#111] text-white">
      <div className="max-w-[1280px] mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">SOUNDGIT STUDIO v20.1 Real Play + Waveform</h1>
        <p className="text-xs text-zinc-500 mb-6">PondOS v20.1 - Real time waveform, freq, play - 【entity-SoundCloud¦canonical_name=SoundCloud】 gibi - {tracks.length} tracks</p>
        <div className="space-y-8">
          {tracks.map((track) => {
            const tl = getLayaForFile(track.file_name)
            const trackComments = comments[track.id] || []
            return (
              <div key={track.id} className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-[#2a2a2a]">
                <div className="p-5 flex gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#ff5500] flex items-center justify-center text-white">♫</div>
                      <div><h2 className="font-bold text-base">{track.file_name.replace(/^\d+-/, '')}</h2><p className="text-xs text-zinc-400">{user.email?.split('@')[0]} • {tl.genre} • {tl.daw} • {new Date(track.created_at).toLocaleDateString()}</p></div>
                    </div>
                    <WaveformPlayer url={track.file_url} comments={trackComments} />
                    <div className="flex items-center gap-2 mt-4">
                      <button onClick={() => setLikes(prev => ({ ...prev, [track.id]: (prev[track.id]||0)+1 }))} className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] border border-[#333] rounded text-xs flex gap-1">❤️ {likes[track.id]||0}</button>
                      <input value={newComment[track.id]||''} onChange={e => setNewComment(prev => ({ ...prev, [track.id]: e.target.value }))} onKeyDown={e => e.key==='Enter' && addComment(track.id)} placeholder="Write a comment - real time marker ekle" className="flex-1 px-3 py-1.5 bg-[#0a0a0a] border border-[#333] rounded text-xs" />
                      <button onClick={() => addComment(track.id)} className="px-3 py-1.5 bg-[#ff5500] hover:bg-[#ff6600] rounded text-xs font-bold">Comment</button>
                      <button className="px-2 py-1.5 bg-[#2a2a2a] rounded text-xs">↗ Share</button>
                      <button onClick={() => { navigator.clipboard.writeText(track.file_url); alert('Copied!') }} className="px-2 py-1.5 bg-[#2a2a2a] rounded text-xs">🔗 Copy</button>
                      <button className="px-2 py-1.5 bg-[#2a2a2a] rounded text-xs">+ Playlist</button>
                      <button onClick={() => handleDelete(track.id)} className="px-2 py-1.5 bg-red-900/20 rounded text-xs">Sil</button>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {trackComments.map((c,i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-[#2a2a2a] rounded border border-[#333]">● {c.user} @{Math.floor(c.time)}s: {c.text}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-56">
                    <div className="w-56 h-56 bg-gradient-to-br from-[#ff5500] via-[#ff3300] to-[#ffaa00] rounded-lg flex items-center justify-center relative shadow-xl">
                      <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur"></div>
                      <div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] bg-black/60 px-2 py-1 rounded text-white">{tl.genre} {tl.bpm}</span></div>
                      <div className="absolute top-2 right-2 text-[10px] px-2 py-1 bg-black/60 rounded text-white">{tl.daw}</div>
                      <div className="absolute bottom-2 left-2 right-2"><div className="h-1 bg-black/30 rounded overflow-hidden"><div className="h-full bg-[#ff5500] w-3/4"></div></div></div>
                    </div>
                    <div className="mt-3 bg-[#0a0a0a] p-3 rounded border border-[#222]">
                      <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full bg-[#333]"></div><div><p className="text-xs font-bold">{user.email?.split('@')[0]}</p><p className="text-[10px] text-zinc-500">{tracks.length} tracks</p></div></div>
                      <div className="grid grid-cols-3 gap-2 text-center mt-3">
                        <div><p className="text-sm font-bold">{plays[track.id]||4670}</p><p className="text-[9px] text-zinc-500">PLAYS</p></div>
                        <div><p className="text-sm font-bold">{likes[track.id]||134}</p><p className="text-[9px] text-zinc-500">LIKES</p></div>
                        <div><p className="text-sm font-bold">{Math.floor((likes[track.id]||134)/8)}</p><p className="text-[9px] text-zinc-500">REPOSTS</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-8 p-4 bg-[#1a1a1a] rounded border border-dashed border-zinc-700">
          <h3 className="text-sm font-bold mb-2">🎛️ DAW Upload - Real Play v20.1</h3>
          <input type="file" accept=".wav,.mp3,.flac,.ogg,.als,.logicx,.flp,.cpr,.zip" onChange={handleUpload} disabled={uploading} className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white file:text-black file:text-xs" />
          <p className="text-[10px] text-zinc-500 mt-2">Ableton Logic Cubase FL - Real waveform + freq - Play çalışıyor!</p>
        </div>
      </div>
    </div>
  )
}
