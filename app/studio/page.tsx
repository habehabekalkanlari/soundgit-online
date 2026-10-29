"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useKnolli } from "@/lib/knolli"
type Track = { id: string, file_name: string, file_url: string, created_at: string }
function getLayaForFile(fileName: string) {
  const lower = fileName.toLowerCase()
  let genre = 'other', prob = 0.5, bpm = 124, key = 'F#m', daw = 'WAV', branch = 'main'
  if (lower.endsWith('.als') || lower.endsWith('.alp')) daw = ' 【entity-Ableton¦canonical_name=Ableton】 Live'
  else if (lower.endsWith('.logicx') || lower.endsWith('.【entity-logic¦canonical_name=Logic】')) daw = ' 【entity-Logic¦canonical_name=Logic】 Pro'
  else if (lower.endsWith('.flp')) daw = '【entity-FL Studio¦canonical_name=FL Studio】'
  else if (lower.endsWith('.cpr')) daw = 'Cubase'
  else if (lower.endsWith('.rpp')) daw = 'Reaper'
  else if (lower.endsWith('.band')) daw = 'GarageBand'
  else if (lower.endsWith('.zip')) daw = 'Stems'
  if (lower.includes('techno') || lower.includes('strange') || lower.includes('adana')) { genre='techno'; prob=0.727; bpm=124; key='F#m' }
  return { genre, prob, bpm, key, daw, branch: lower.includes('vocal') ? 'vocal' : 'main' }
}
export default function Studio() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
      if (unique.length > 0) setLayaFromFile(unique[0].file_name, unique[0].file_url)
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
  const handleDelete = async (id: string) => { if (!confirm('Silinsin mi?')) return; await fetch(`/api/tracks?id=${id}`, { method: 'DELETE' }); fetchTracks() }
  const handleLogout = () => { localStorage.removeItem('soundgit_user'); router.push('/') }
  const addFriend = () => { const name = prompt('Arkadas ismi?'); if (name) setFriends([...meta.friends, name]) }
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yukleniyor... v19.2 DAW...</div>
  if (!user) return null
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-4xl font-bold mb-2">SOUNDGIT STUDIO v19.2 DAW</h1><p className="text-xs text-zinc-500">PondOS v19.2 - {user.email} - Laya {laya.genre} {laya.bpm} - {meta.privacy} - DAW: 【entity-Ableton¦canonical_name=Ableton】 【entity-Logic¦canonical_name=Logic】 Cubase FL - 412G free</p></div>
          <div className="flex gap-2 items-center"><span className="text-xs">{user.email}</span><button onClick={handleLogout} className="px-3 py-1 bg-zinc-800 rounded text-xs">Cikis</button></div>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-zinc-900 rounded border border-green-800/50">
            <h3 className="font-bold text-sm mb-2 text-green-400">Knolli Laya</h3>
            <p className="text-xs">Genre: <span className="font-bold text-white">{laya.genre}</span> {Math.round(laya.prob*100)}%</p>
            <p className="text-xs">BPM {laya.bpm} Key {laya.key} DAW {laya.daw}</p>
          </div>
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
            <h3 className="font-bold text-sm mb-2">DAW Destek - v19.2</h3>
            <div className="flex flex-wrap gap-1 text-[10px]">
              <span className="px-2 py-1 bg-zinc-800 rounded border">【entity-Ableton¦canonical_name=Ableton】 .als</span>
              <span className="px-2 py-1 bg-zinc-800 rounded border">【entity-Logic¦canonical_name=Logic】 .logicx</span>
              <span className="px-2 py-1 bg-zinc-800 rounded border">Cubase .cpr</span>
              <span className="px-2 py-1 bg-zinc-800 rounded border">FL .flp</span>
              <span className="px-2 py-1 bg-zinc-800 rounded border">Reaper .rpp</span>
              <span className="px-2 py-1 bg-zinc-800 rounded border">Stems .zip</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">50MB max, Git gibi version control!</p>
          </div>
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
            <h3 className="font-bold text-sm mb-2">Friends</h3>
            <div className="flex gap-1 flex-wrap text-[10px]">{meta.friends.map((f,i) => <span key={i} className="px-2 py-1 bg-green-900/50 rounded">{f}</span>)}</div>
            <button onClick={addFriend} className="mt-2 px-2 py-1 bg-white text-black rounded text-[10px] font-bold">+ Ekle</button>
          </div>
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
            <h3 className="font-bold text-sm mb-2">Privacy</h3>
            <select value={meta.privacy} onChange={e => setPrivacy(e.target.value as any)} className="w-full px-2 py-1.5 bg-black border border-zinc-700 rounded text-xs">
              <option value="private">🔒 Private</option>
              <option value="friends_only">👥 Friends only</option>
              <option value="public">🌍 Public</option>
            </select>
          </div>
        </div>
        <div className="mb-6 p-6 bg-zinc-900 rounded border-2 border-dashed border-zinc-700 hover:border-zinc-500 transition">
          <h3 className="font-bold text-sm mb-3">🎛️ DAW Upload - Ableton, Logic, Cubase, 【entity-FL Studio¦canonical_name=FL Studio】 - Knolli Auto Sync!</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-black rounded border border-zinc-800">
              <p className="text-xs font-bold mb-1">DAW Projeleri:</p>
              <p className="text-[11px] text-zinc-400">.als (Ableton Live), .logicx (Logic Pro), .cpr (Cubase), .flp (【entity-FL Studio¦canonical_name=FL Studio】), .rpp (Reaper), .band (GarageBand)</p>
            </div>
            <div className="p-3 bg-black rounded border border-zinc-800">
              <p className="text-xs font-bold mb-1">Audio + Stems:</p>
              <p className="text-[11px] text-zinc-400">.wav, .mp3, .flac, .ogg, .zip (stems, samples) - 50MB</p>
            </div>
          </div>
          <input type="file" accept=".wav,.mp3,.flac,.ogg,.als,.alp,.logicx,.logic,.flp,.cpr,.rpp,.band,.zip" onChange={handleUpload} disabled={uploading} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-3 file:px-6 file:rounded file:border-0 file:bg-white file:text-black file:font-bold file:text-sm hover:file:bg-zinc-200" />
          <p className="text-[11px] text-zinc-500 mt-3">Seç: Ableton .als, Logic .logicx, Cubase .cpr, FL .flp - Knolli otomatik analiz: {laya.genre} {laya.bpm} BPM - Branch {meta.branch} - {meta.privacy}</p>
          {uploading && <p className="text-yellow-400 mt-2 text-xs animate-pulse">DAW projesi yükleniyor... Knolli sync...</p>}
        </div>
        <div className="grid gap-4">
          <h3 className="font-bold">Tracks ({tracks.length}) - DAW + Knolli</h3>
          {tracks.map((track) => {
            const tl = getLayaForFile(track.file_name)
            return (
              <div key={track.id} className="p-4 bg-zinc-900 rounded border border-zinc-800 hover:border-zinc-700 transition">
                <div className="flex justify-between"><p className="font-mono text-sm truncate pr-4">{track.file_name}</p><button onClick={() => handleDelete(track.id)} className="text-[10px] px-2 py-1 bg-red-900/30 rounded text-red-300">Sil</button></div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded border font-bold">{tl.daw}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-green-900/50 rounded">{meta.privacy}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-900/50 rounded">Branch {tl.branch}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded">{tl.genre} {tl.bpm}</span>
                </div>
                <audio controls src={track.file_url} className="w-full mt-3" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
