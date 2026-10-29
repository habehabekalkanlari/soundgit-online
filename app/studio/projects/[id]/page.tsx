'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

type Commit = { id: string, message: string, parent_id: string, created_at: string }
type Stem = { id: string, name: string, s3_key: string, commit_id: string, size_bytes: number }

export default function ProjectDetail() {
  const { id } = useParams() as { id: string }
  const [project, setProject] = useState<any>(null)
  const [commits, setCommits] = useState<Commit[]>([])
  const [stems, setStems] = useState<Record<string, Stem[]>>({})
  const [msg, setMsg] = useState('first commit')
  const [uploading, setUploading] = useState(false)

  const loadAll = async () => {
    const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single()
    if(proj) setProject(proj)
    const { data: comm } = await supabase.from('commits').select('*').eq('project_id', id).order('created_at', { ascending: false })
    if(comm) {
      setCommits(comm)
      const { data: stemData } = await supabase.from('stems').select('*').in('commit_id', comm.map((c:any)=>c.id))
      if(stemData){
        const grouped: any = {}
        stemData.forEach((s:any)=>{
          if(!grouped[s.commit_id]) grouped[s.commit_id]=[]
          grouped[s.commit_id].push(s)
        })
        setStems(grouped)
      }
    }
  }

  useEffect(()=>{ loadAll() },[id])

  const createCommit = async (files: FileList) => {
    if(!files.length) return
    setUploading(true)
    const parent_id = commits[0]?.id || null
    const { data: commit, error } = await supabase.from('commits').insert([{
      project_id: id,
      parent_id,
      message: msg,
      manifest: { count: files.length }
    }]).select().single()
    if(error || !commit){ alert(error?.message); setUploading(false); return }
    for(let i=0; i<files.length; i++){
      const file = files[i]
      const key = `${id}/${commit.id}/${Date.now()}-${file.name.replace(/\s+/g,'-')}`
      const { error: upErr } = await supabase.storage.from('stems').upload(key, file)
      if(upErr) continue
      await supabase.from('stems').insert([{ commit_id: commit.id, name: file.name, s3_key: key, size_bytes: file.size }])
    }
    setUploading(false)
    setMsg('')
    loadAll()
  }

  if(!project) return <div className="min-h-screen bg-black text-white p-10">Loading project...</div>

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/studio/projects" className="text- text-zinc-500 hover:text-white">← PROJECTS</Link>
        <div className="flex justify-between items-end mt-2 mb-6">
          <div>
            <h1 className="text-3xl font-black">{project.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">{project.description} • {project.genre} • {project.bpm} BPM • {project.daw}</p>
          </div>
          <div className="text- text-zinc-600 font-mono">{commits.length} commits</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8">
          <p className="text- text-zinc-500 tracking-widest mb-2">NEW COMMIT</p>
          <div className="flex gap-2">
            <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="kick louder, bass sidechain" className="flex-1 p-3 bg-black border border-zinc-800 rounded-xl text-sm focus:border-white outline-none" />
            <label className="px-5 py-3 bg-white text-black font-bold rounded-xl text-sm cursor-pointer hover:bg-zinc-200">
              {uploading?'UPLOADING...':'ADD STEMS'}
              <input type="file" multiple accept="audio/*,.wav,.mp3" hidden onChange={e=> e.target.files && createCommit(e.target.files)} />
            </label>
          </div>
        </div>
        <div className="space-y-4">
          {commits.map((c,i)=>(
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${i===0?'bg-white':'bg-zinc-600'}`} />
                  <div className="w-px flex-1 bg-zinc-800 mt-2" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{c.message} <span className="text-zinc-600 font-mono text-xs">• {c.id.slice(0,7)} {c.parent_id?`← ${c.parent_id.slice(0,6)}`:''}</span></p>
                  <p className="text- text-zinc-500 font-mono mt-1">{new Date(c.created_at).toLocaleString('tr-TR')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    {(stems[c.id]||[]).map((s:Stem)=>{
                      const { data } = supabase.storage.from('stems').getPublicUrl(s.s3_key)
                      return (
                        <div key={s.id} className="bg-black border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                          <div><p className="text-xs font-bold truncate">{s.name}</p><p className="text- text-zinc-600">{Math.round(s.size_bytes/1024/1024*10)/10} MB</p></div>
                          <div className="flex gap-2"><audio controls src={data.publicUrl} className="w-24 h-6" /><a href={data.publicUrl} download className="text- px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-full">DL</a></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}