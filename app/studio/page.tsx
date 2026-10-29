"use client"
import { useEffect, useState } from "react"
type Track = { id: string, file_name: string, file_url: string, created_at: string }
function getDAW(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'als') return 'Ableton'
  if (ext === 'logicx') return 'Logic'
  if (ext === 'flp') return 'FL'
  if (ext === 'zip') return 'Stems'
  return 'WAV'
}
export default function Studio() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [uploading, setUploading] = useState(false)
  const [privacy, setPrivacy] = useState("friends_only")
  useEffect(() => { 
    fetch('/api/tracks').then(r => r.json()).then(j => j.tracks && setTracks(j.tracks))
  }, [])
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true)
    try {
      const fileName = `${Date.now()}-${file.name}`
      const res = await fetch('/api/upload-url', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ fileName }) })
      const j = await res.json(); 
      await fetch(j.signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      const publicUrl = `https://rvuiklogpbknbqvizddv.supabase.co/storage/v1/object/public/tracks/${j.path}`
      await fetch('/api/tracks', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ file_name: file.name, file_url: publicUrl }) })
      const r = await fetch('/api/tracks'); const d = await r.json(); d.tracks && setTracks(d.tracks)
    } catch (err: any) { alert(err.message) } finally { setUploading(false); e.target.value = '' }
  }
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">SOUNDGIT STUDIO v18 Social + Privacy</h1>
        <p className="text-xs text-zinc-500 mb-6">PondOS v18 - Friend system + Private + DAW upload (.als .logicx .flp) - 412G free</p>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
            <h3 className="font-bold text-sm mb-2">Friends - Sadece arkadaslar download</h3>
            <div className="flex gap-2 text-xs"><span className="px-2 py-1 bg-green-900/50 rounded">habehabe</span><span className="px-2 py-1 bg-green-900/50 rounded">pondos</span><span className="px-2 py-1 bg-green-900/50 rounded">adana_twins</span></div>
            <p className="text-[10px] text-zinc-600 mt-2">Non-friends goremez!</p>
          </div>
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
            <h3 className="font-bold text-sm mb-2">Privacy - Private by default</h3>
            <select value={privacy} onChange={e => setPrivacy(e.target.value)} className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-xs">
              <option value="private">Private - Sadece ben</option>
              <option value="friends_only">Friends only</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
            <h3 className="font-bold text-sm mb-2">DAW Upload - Ableton Logic FL</h3>
            <p className="text-xs text-zinc-400">.als .logicx .flp .zip 50MB</p>
          </div>
        </div>
        <div className="mb-6 p-4 bg-zinc-900 rounded border border-zinc-800">
          <input type="file" accept=".wav,.mp3,.flac,.ogg,.als,.logicx,.flp,.zip" onChange={handleUpload} disabled={uploading} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white file:text-black" />
          <p className="text-[10px] text-zinc-600 mt-2">Privacy: {privacy} - DAW upload - Sadece arkadaslar indirebilir</p>
          {uploading && <p className="text-yellow-400 mt-2 text-xs">Yukleniyor...</p>}
        </div>
        <div className="grid gap-4">
          <h3 className="font-bold">Tracks ({tracks.length}) - Friends only download</h3>
          {tracks.map((track) => (
            <div key={track.id} className="p-4 bg-zinc-900 rounded border border-zinc-800">
              <p className="font-mono text-sm truncate">{track.file_name}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded">{getDAW(track.file_name)}</span>
                <span className="text-[10px] px-2 py-0.5 bg-green-900/50 rounded">{privacy}</span>
              </div>
              <audio controls src={track.file_url} className="w-full mt-3" />
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 bg-white text-black rounded text-xs font-bold">Download friends only</button>
                <button className="px-3 py-1 bg-zinc-800 rounded text-xs">Comment</button>
                <button className="px-3 py-1 bg-zinc-800 rounded text-xs">Branch</button>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">{new Date(track.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
