"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useKnolli } from "@/lib/knolli"
type Track = { id: string, file_name: string, file_url: string, created_at: string }
function getLayaForFile(fileName: string) {
  const lower = fileName.toLowerCase()
  let genre='other', prob=0.5, bpm=124, key='F#m', daw='WAV', branch='main'
  if (lower.endsWith('.als')) daw='【entity-Ableton¦canonical_name=Ableton】 Live'
  else if (lower.endsWith('.logicx')) daw='【entity-Logic¦canonical_name=Logic】 Pro'
  else if (lower.endsWith('.flp')) daw='【entity-FL Studio¦canonical_name=FL Studio】'
  else if (lower.endsWith('.cpr')) daw='Cubase'
  else if (lower.endsWith('.zip')) daw='Stems'
  if (lower.includes('techno')||lower.includes('strange')||lower.includes('adana')) { genre='techno'; prob=0.727; bpm=124; key='F#m' }
  return { genre, prob, bpm, key, daw, branch: lower.includes('vocal')?'vocal':'main' }
}
function Waveform({ url, comments }: { url: string, comments: { time: number, user: string, text: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0,0,w,h)
    ctx.fillStyle = '#333'
    for (let i=0;i<w;i+=4) {
      const height = Math.random()*h*0.8 + h*0.1
      ctx.fillRect(i, (h-height)/2, 2, height)
    }
    comments.forEach(c => {
      const x = (c.time / (duration || 200)) * w
      ctx.fillStyle = '#ff5500'
      ctx.beginPath(); ctx.arc(x, h/2, 6, 0, Math.PI*2); ctx.fill()
    })
    ctx.fillStyle = 'rgba(255,85,0,0.3)'
    ctx.fillRect(0,0,(current/(duration||200))*w,h)
  }, [duration, current, comments])
  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} width={600} height={80} className="w-full h-20 bg-[#1a1a1a] cursor-pointer" onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const pct = x / rect.width
        if (audioRef.current) { audioRef.current.currentTime = pct * (audioRef.current.duration||200); setCurrent(pct*(audioRef.current.duration||200)) }
      }} />
      <div className="flex justify-between text-[10px] text-zinc-500 mt-1"><span>{Math.floor(current/60)}:{String(Math.floor(current%60)).padStart(2,'0')}</span><span>{Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}</span></div>
      <audio ref={audioRef} src={url} onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} className="hidden" />
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
      unique.forEach((t: Track) => { initLikes[t.id] = Math.floor(Math.random()*200); initPlays[t.id] = Math.floor(Math.random()*5000); initComments[t.id] = [{ time: 22, user: 'habehabe', text: '🔥 drop!' }, { time: 85, user: 'pondos', text: 'nice mix' }] })
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
    const time = Math.random()*100
    setComments(prev => ({ ...prev, [trackId]: [...(prev[trackId]||[]), { time, user: user?.email?.split('@')[0]||'you', text }] }))
    setNewComment(prev => ({ ...prev, [trackId]: '' }))
  }
  const handleDelete = async (id: string) => { if (!confirm('Silinsin mi?')) return; await fetch(`/api/tracks?id=${id}`, { method: 'DELETE' }); fetchTracks() }
  const handleLogout = () => { localStorage.removeItem('soundgit_user'); router.push('/') }
  const addFriend = () => { const name = prompt('Arkadas ismi?'); if (name) setFriends([...meta.friends, name]) }
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yukleniyor... v20 【entity-SoundCloud¦canonical_name=SoundCloud】...</div>
  if (!user) return null
  return (
    <div className="min-h-screen bg-[#111] text-white">
      <div className="bg-[#333] border-b border-[#222] px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6"><span className="font-bold text-lg">SOUNDGIT</span><span className="text-xs text-zinc-400">Home Feed Library</span></div>
        <div className="flex items-center gap-4"><span className="text-xs">{user.email}</span><button onClick={handleLogout} className="px-3 py-1 bg-[#555] rounded text-xs">Cikis</button></div>
      </div>
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">SOUNDGIT STUDIO v20 SoundCloud UI</h1>
          <p className="text-xs text-zinc-500">PondOS v20 - SoundCloud gibi - Waveform + Comments + Cover - {meta.friends.length} friends</p>
        </div>
        <div className="grid md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-[#222] rounded"><h3 className="text-xs font-bold mb-1">DAW Upload - v20</h3><div className="flex flex-wrap gap-1 text-[10px]"><span className="px-1.5 py-0.5 bg-[#333] rounded"> 【entity-Ableton¦canonical_name=Ableton】 .als</span><span className="px-1.5 py-0.5 bg-[#333] rounded"> 【entity-Logic¦canonical_name=Logic】 .logicx</span><span className="px-1.5 py-0.5 bg-[#333] rounded">Cubase .cpr</span><span className="px-1.5 py-0.5 bg-[#333] rounded">FL .flp</span></div></div>
          <div className="p-3 bg-[#222] rounded"><h3 className="text-xs font-bold mb-1">Knolli Laya</h3><p className="text-[11px]">{laya.genre} {laya.bpm} BPM {laya.key} {Math.round(laya.prob*100)}% - {laya.daw}</p></div>
          <div className="p-3 bg-[#222] rounded"><h3 className="text-xs font-bold mb-1">Friends</h3><div className="flex gap-1 text-[9px]">{meta.friends.map((f,i) => <span key={i} className="px-1.5 py-0.5 bg-green-900/50 rounded">{f}</span>)}</div></div>
          <div className="p-3 bg-[#222] rounded"><h3 className="text-xs font-bold mb-1">Privacy</h3><select value={meta.privacy} onChange={e => setPrivacy(e.target.value as any)} className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-[11px]"><option value="private">Private</option><option value="friends_only">Friends only</option><option value="public">Public</option></select></div>
        </div>
        <div className="mb-6 p-4 bg-[#222] rounded border border-dashed border-zinc-700">
          <input type="file" accept=".wav,.mp3,.flac,.ogg,.als,.logicx,.flp,.cpr,.rpp,.zip" onChange={handleUpload} disabled={uploading} className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white file:text-black file:text-xs" />
          <p className="text-[10px] text-zinc-500 mt-2">Ableton Logic Cubase FL - SoundCloud UI - Waveform + Cover + Comments</p>
          {uploading && <p className="text-yellow-400 text-xs mt-1">Yükleniyor...</p>}
        </div>
        <div className="space-y-6">
          {tracks.map((track) => {
            const tl = getLayaForFile(track.file_name)
            const trackComments = comments[track.id] || []
            return (
              <div key={track.id} className="bg-[#2a2a2a] rounded overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-[#3a3a3a] to-[#2a2a2a] flex gap-4">
                  <button className="w-14 h-14 rounded-full bg-[#ff5500] flex items-center justify-center text-2xl">▶</button>
                  <div className="flex-1">
                    <h2 className="font-bold text-lg truncate">{track.file_name.replace(/^\d+-/, '')}</h2>
                    <p className="text-xs text-zinc-400">{user.email?.split('@')[0]} • {tl.genre} • {tl.daw} • {new Date(track.created_at).toLocaleDateString()} • {tl.branch}</p>
                    <div className="mt-4">
                      <Waveform url={track.file_url} comments={trackComments} />
                      <div className="flex gap-2 mt-1">
                        {trackComments.map((c,i) => (
                          <div key={i} className="text-[10px] px-1.5 py-0.5 bg-[#444] rounded flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-[#ff5500]"></span>{c.user}: {c.text} @{Math.floor(c.time)}s
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button onClick={() => setLikes(prev => ({ ...prev, [track.id]: (prev[track.id]||0)+1 }))} className="px-3 py-1.5 bg-[#333] hover:bg-[#444] rounded text-xs flex items-center gap-1">❤️ {likes[track.id]||0}</button>
                      <div className="flex-1 flex items-center gap-2">
                        <input value={newComment[track.id]||''} onChange={e => setNewComment(prev => ({ ...prev, [track.id]: e.target.value }))} onKeyDown={e => e.key==='Enter' && addComment(track.id)} placeholder="Write a comment at current time" className="flex-1 px-3 py-1.5 bg-[#1a1a1a] border border-[#444] rounded text-xs" />
                        <button onClick={() => addComment(track.id)} className="px-3 py-1.5 bg-[#ff5500] rounded text-xs">→</button>
                      </div>
                      <button className="px-2 py-1.5 bg-[#333] rounded text-xs">↗ Share</button>
                      <button onClick={() => { navigator.clipboard.writeText(track.file_url); alert('Link copied!') }} className="px-2 py-1.5 bg-[#333] rounded text-xs">🔗 Copy Link</button>
                      <button className="px-2 py-1.5 bg-[#333] rounded text-xs">+ Add to playlist</button>
                      <button onClick={() => handleDelete(track.id)} className="px-2 py-1.5 bg-red-900/30 rounded text-xs">Sil</button>
                    </div>
                  </div>
                  <div className="w-48 h-48 bg-gradient-to-br from-[#ff5500] to-[#ffaa00] rounded flex items-center justify-center relative">
                    <div className="w-20 h-20 rounded-full bg-black/30"></div>
                    <div className="absolute bottom-2 left-2 text-[9px] text-black/60">{tl.genre} {tl.bpm}</div>
                    <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-black/50 rounded">{tl.daw}</div>
                  </div>
                </div>
                <div className="p-4 bg-[#1a1a1a] flex gap-6">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold mb-2 text-zinc-400">DETAILS</h4>
                    <p className="text-xs text-zinc-300">{track.file_name} - Laya analiz: {tl.genre} {Math.round(tl.prob*100)}% BPM {tl.bpm} Key {tl.key} - DAW {tl.daw} - Branch {tl.branch} - {meta.privacy} - Git gibi version control!</p>
                    <p className="text-xs text-[#ff5500] mt-2">@{user.email?.split('@')[0]}</p>
                    <h4 className="text-xs font-bold mt-6 mb-2 text-zinc-400">{trackComments.length} COMMENTS</h4>
                    <div className="space-y-2">
                      {trackComments.map((c,i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <div className="w-6 h-6 rounded-full bg-[#333]"></div>
                          <div><span className="font-bold">{c.user}</span> <span className="text-zinc-500">at {Math.floor(c.time)}s</span><p className="text-zinc-300">{c.text}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-64 space-y-3">
                    <div className="bg-[#222] p-3 rounded">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#444]"></div>
                        <div><p className="text-xs font-bold">{user.email?.split('@')[0]}</p><p className="text-[10px] text-zinc-500">{tracks.length} tracks • {meta.friends.length} friends</p></div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 bg-white text-black rounded text-xs font-bold">Follow</button>
                        <button className="flex-1 py-1.5 bg-[#333] rounded text-xs">Message</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#222] p-2 rounded"><p className="text-sm font-bold">{plays[track.id]||0}</p><p className="text-[9px] text-zinc-500">PLAYS</p></div>
                      <div className="bg-[#222] p-2 rounded"><p className="text-sm font-bold">{likes[track.id]||0}</p><p className="text-[9px] text-zinc-500">LIKES</p></div>
                      <div className="bg-[#222] p-2 rounded"><p className="text-sm font-bold">{Math.floor((likes[track.id]||0)/10)}</p><p className="text-[9px] text-zinc-500">REPOSTS</p></div>
                    </div>
                    <div className="bg-[#222] p-2 rounded text-[10px] text-zinc-500">FANS WHO PLAYED MOST - Friends only download!</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
