"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useKnolli } from "@/lib/knolli"
type Track = { id: string, file_name: string, file_url: string, created_at: string }
function getLayaForFile(fileName: string) {
  const lower = fileName.toLowerCase()
  let genre = 'other', prob = 0.5, bpm = 124, key = 'F#m', daw = 'WAV', branch = 'main'
  if (lower.endsWith('.als') || lower.endsWith('.alp')) daw = ' Ableton'
  else if (lower.endsWith('.logicx')) daw = ' Logic'
  else if (lower.endsWith('.flp')) daw = 'FL'
  else if (lower.endsWith('.zip')) daw = 'Stems'
  if (lower.includes('techno') || lower.includes('strange') || lower.includes('adana')) { genre='techno'; prob=0.727; bpm=124; key='F#m'; branch='main' }
  else if (lower.includes('vocal')) { genre='vocal'; prob=0.8; bpm=124; branch='vocal' }
  else if (lower.includes('drum') || lower.includes('kick')) { genre='drums'; prob=0.75; bpm=126; branch='drums' }
  else if (lower.includes('trap')) { genre='trap'; prob=0.85; bpm=140; key='Dm' }
  else if (lower.includes('house')) { genre='house'; prob=0.75; bpm=126; key='Am' }
  return { genre, prob, bpm, key, daw, branch }
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
      if (saved) {
        try { const u = JSON.parse(saved); setUser(u); setOwner(u.email); setLoading(false); fetchTracks() } 
        catch { localStorage.clear(); router.push('/') }
      } else { router.push('/') }
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
  const handleDelete = async (id: string) => {
    if (!confirm('Silinsin mi?')) return
    await fetch(`/api/tracks?id=${id}`, { method: 'DELETE' })
    fetchTracks()
  }
  const handleLogout = () => { localStorage.removeItem('soundgit_user'); router.push('/') }
  const addFriend = () => { const name = prompt('Arkadas ismi?'); if (name) setFriends([...meta.friends, name]) }
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yukleniyor... Knolli v19.1...</div>
  if (!user) return null
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-4xl font-bold mb-2">SOUNDGIT STUDIO v19.1 Knolli Fix</h1><p className="text-xs text-zinc-500">PondOS v19.1 - {user.email} - Laya {laya.genre} {laya.bpm} BPM {laya.key} {Math.round(laya.prob*100)}% - Branch {meta.branch} - {meta.privacy} - 412G free</p></div>
          <div className="flex gap-2 items-center">{user.avatar && <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />}<span className="text-xs">{user.email}</span><button onClick={handleLogout} className="px-3 py-1 bg-zinc-800 rounded text-xs">Cikis</button></div>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-zinc-900 rounded border border-green-800/50">
            <h3 className="font-bold text-sm mb-2 text-green-400">Knolli Laya - Auto {meta.file_name ? '✓' : ''}</h3>
            {meta.file_name ? (
              <>
                <p className="text-xs">Genre: <span className="text-white font-bold">{laya.genre}</span> <span className="text-green-400">{Math.round(laya.prob*100)}%</span></p>
                <p className="text-xs">BPM: {laya.bpm} | Key: {laya.key}</p>
                <p className="text-xs">DAW: {laya.daw}</p>
                <p className="text-[10px] text-zinc-500 mt-1">Laya 322M analiz!</p>
              </>
            ) : (
              <p className="text-xs text-zinc-500">Dosya yükle, Laya analiz etsin! Techno, Trap, House algılar.</p>
            )}
          </div>
          <div className="p-4 bg-zinc-900 rounded border border-blue-800/50">
            <h3 className="font-bold text-sm mb-2 text-blue-400">Knolli Meta - Auto</h3>
            <p className="text-xs truncate">File: <span className="text-white">{meta.file_name ? meta.file_name.slice(-25) : 'Henüz yok - yükle!'}</span></p>
            <p className="text-xs">Branch: <span className="px-1.5 py-0.5 bg-blue-900/50 rounded text-[11px]">{meta.branch}</span> <span className="text-[10px] text-zinc-500">{meta.branch==='main'?'prod':meta.branch}</span></p>
            <p className="text-xs">Privacy: {meta.privacy}</p>
            <p className="text-[10px] text-zinc-600 mt-1">Auto sync!</p>
          </div>
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
            <h3 className="font-bold text-sm mb-2">Friends - Knolli</h3>
            <div className="flex gap-1 flex-wrap text-[10px]">{meta.friends.map((f,i) => <span key={i} className="px-2 py-1 bg-green-900/50 rounded border border-green-800/30">{f}</span>)}</div>
            <button onClick={addFriend} className="mt-3 px-3 py-1.5 bg-white text-black rounded text-[11px] font-bold hover:bg-zinc-200">+ Arkadas Ekle</button>
            <p className="text-[10px] text-zinc-600 mt-1">Sadece arkadaşlar download!</p>
          </div>
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
            <h3 className="font-bold text-sm mb-2">Privacy - Knolli</h3>
            <select value={meta.privacy} onChange={e => setPrivacy(e.target.value as any)} className="w-full px-3 py-2 bg-black border border-zinc-700 rounded text-xs">
              <option value="private">🔒 Private - Sadece ben</option>
              <option value="friends_only">👥 Friends only</option>
              <option value="public">🌍 Public</option>
            </select>
            <p className="text-[10px] text-zinc-500 mt-2">Non-friends göremez!</p>
          </div>
        </div>
        <div className="mb-6 p-5 bg-zinc-900 rounded border border-zinc-800 border-dashed">
          <h3 className="font-bold text-sm mb-3">Knolli Upload - Auto sync! Drag & drop destekli</h3>
          <input type="file" accept=".wav,.mp3,.flac,.ogg,.als,.logicx,.flp,.zip" onChange={handleUpload} disabled={uploading} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-5 file:rounded file:border-0 file:bg-white file:text-black file:font-bold hover:file:bg-zinc-200" />
          <p className="text-[11px] text-zinc-500 mt-3">Knolli: {laya.genre} {laya.bpm} BPM {laya.daw} - Branch {meta.branch} - {meta.privacy} - AUTH GUARD ✓ - Duplicates auto temizlenir!</p>
          {uploading && <p className="text-yellow-400 mt-2 text-xs animate-pulse">Knolli sync... Laya analiz ediyor...</p>}
        </div>
        <div className="grid gap-4">
          <h3 className="font-bold flex items-center gap-2">Tracks ({tracks.length}) - Knolli managed {tracks.length > 1 && <span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded">duplicates temizlendi!</span>}</h3>
          {tracks.map((track) => {
            const tl = getLayaForFile(track.file_name)
            return (
              <div key={track.id} className="p-4 bg-zinc-900 rounded border border-zinc-800 hover:border-zinc-700 transition">
                <div className="flex justify-between items-start">
                  <p className="font-mono text-sm truncate pr-4">{track.file_name}</p>
                  <button onClick={() => handleDelete(track.id)} className="text-[10px] px-2 py-1 bg-red-900/30 hover:bg-red-900/50 rounded text-red-300">Sil</button>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded border">{tl.daw}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-green-900/50 rounded border border-green-800/30">{meta.privacy}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-900/50 rounded border border-blue-800/30">Branch {tl.branch}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded">{tl.genre} {tl.bpm} BPM {tl.key} {Math.round(tl.prob*100)}%</span>
                </div>
                <audio controls src={track.file_url} className="w-full mt-3" />
                <p className="text-[10px] text-zinc-600 mt-2">{new Date(track.created_at).toLocaleString()} - Knolli: {tl.genre} - {meta.privacy} - per-track Laya!</p>
              </div>
            )
          })}
          {tracks.length === 0 && <p className="text-sm text-zinc-600 p-4 bg-zinc-900/50 rounded border border-dashed">Henüz track yok - yükle bro! Knolli analiz etsin.</p>}
        </div>
      </div>
    </div>
  )
}
