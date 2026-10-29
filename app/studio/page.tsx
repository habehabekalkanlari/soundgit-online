"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useKnolli } from "@/lib/knolli"
type Track = { id: string, file_name: string, file_url: string, created_at: string }
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
    const res = await fetch('/api/tracks'); const j = await res.json(); if (j.tracks) setTracks(j.tracks)
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
  const handleLogout = () => { localStorage.removeItem('soundgit_user'); router.push('/') }
  const addFriend = () => { const name = prompt('Arkadas ismi?'); if (name) setFriends([...meta.friends, name]) }
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yukleniyor... Knolli sync...</div>
  if (!user) return null
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-4xl font-bold mb-2">SOUNDGIT STUDIO v19 Knolli</h1><p className="text-xs text-zinc-500">PondOS v19 Knolli - {user.email} - Laya {laya.genre} {laya.bpm} BPM {laya.key} - Meta {meta.privacy} - Branch {meta.branch} - 412G free</p></div>
          <div className="flex gap-2 items-center">{user.avatar && <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />}<span className="text-xs">{user.email}</span><button onClick={handleLogout} className="px-3 py-1 bg-zinc-800 rounded text-xs">Cikis</button></div>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-zinc-900 rounded border border-green-800/50"><h3 className="font-bold text-sm mb-2 text-green-400">Knolli Laya - Auto</h3><p className="text-xs">Genre: <span className="text-white font-bold">{laya.genre}</span> {Math.round(laya.prob*100)}%</p><p className="text-xs">BPM: {laya.bpm} | Key: {laya.key}</p><p className="text-xs">DAW: {laya.daw}</p></div>
          <div className="p-4 bg-zinc-900 rounded border border-blue-800/50"><h3 className="font-bold text-sm mb-2 text-blue-400">Knolli Meta - Auto</h3><p className="text-xs truncate">File: {meta.file_name || 'yok'}</p><p className="text-xs">Branch: <span className="px-1 bg-zinc-800 rounded">{meta.branch}</span></p><p className="text-xs">Privacy: {meta.privacy}</p></div>
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800"><h3 className="font-bold text-sm mb-2">Friends - Knolli</h3><div className="flex gap-1 flex-wrap text-[10px]">{meta.friends.map((f,i) => <span key={i} className="px-2 py-1 bg-green-900/50 rounded">{f}</span>)}</div><button onClick={addFriend} className="mt-2 px-2 py-1 bg-zinc-800 rounded text-[10px]">+ Arkadas Ekle</button></div>
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800"><h3 className="font-bold text-sm mb-2">Privacy - Knolli</h3><select value={meta.privacy} onChange={e => setPrivacy(e.target.value as any)} className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-xs"><option value="private">Private</option><option value="friends_only">Friends only</option><option value="public">Public</option></select></div>
        </div>
        <div className="mb-6 p-4 bg-zinc-900 rounded border border-zinc-800"><h3 className="font-bold text-sm mb-2">Knolli Upload - Auto sync!</h3><input type="file" accept=".wav,.mp3,.flac,.ogg,.als,.logicx,.flp,.zip" onChange={handleUpload} disabled={uploading} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white file:text-black" /><p className="text-[10px] text-zinc-600 mt-2">Knolli: {laya.genre} {laya.bpm} BPM {laya.daw} - Branch {meta.branch} - {meta.privacy} - AUTH GUARD!</p>{uploading && <p className="text-yellow-400 mt-2 text-xs">Knolli sync...</p>}</div>
        <div className="grid gap-4"><h3 className="font-bold">Tracks ({tracks.length}) - Knolli managed</h3>{tracks.map((track) => (<div key={track.id} className="p-4 bg-zinc-900 rounded border border-zinc-800"><p className="font-mono text-sm truncate">{track.file_name}</p><div className="flex gap-2 mt-2"><span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded">{laya.daw}</span><span className="text-[10px] px-2 py-0.5 bg-green-900/50 rounded">{meta.privacy}</span><span className="text-[10px] px-2 py-0.5 bg-blue-900/50 rounded">Branch {meta.branch}</span></div><audio controls src={track.file_url} className="w-full mt-3" /><p className="text-[10px] text-zinc-600 mt-2">{new Date(track.created_at).toLocaleString()} - Knolli: {laya.genre}</p></div>))}</div>
      </div>
    </div>
  )
}
