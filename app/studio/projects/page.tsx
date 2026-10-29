'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Project = { id: string, name: string, description: string, genre: string, bpm: number, daw: string, is_private: boolean, created_at: string }

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState({ name: '', description: '', genre: 'hip-hop', bpm: 90, daw: ' 【entity-FL Studio¦canonical_name=FL Studio】', is_private: true })
  const load = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', {ascending:false})
    if(data) setProjects(data as Project[])
  }
  useEffect(()=>{load()},[])
  const create = async () => {
    if(!form.name) return
    const { error } = await supabase.from('projects').insert([{...form, quota_used_mb:0}])
    if(error) alert(error.message)
    else { setForm({ name: '', description: '', genre: 'hip-hop', bpm: 90, daw: ' 【entity-FL Studio¦canonical_name=FL Studio】', is_private: true }); load() }
  }
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">PROJECTS</h1>
          <Link href="/studio" className="text-xs px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">← GLOBAL JAM</Link>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8 grid grid-cols-2 gap-3 max-w-2xl">
          <input placeholder="Proje adı: Midnight Tape" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="col-span-2 p-3 bg-black border border-zinc-800 rounded-xl text-sm" />
          <input placeholder="Açıklama" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="col-span-2 p-3 bg-black border border-zinc-800 rounded-xl text-sm" />
          <select value={form.genre} onChange={e=>setForm({...form, genre:e.target.value})} className="p-3 bg-black border border-zinc-800 rounded-xl text-sm">
            <option>hip-hop</option><option>trap</option><option>drill</option><option>r&b</option><option>underground</option>
          </select>
          <input type="number" value={form.bpm} onChange={e=>setForm({...form, bpm:parseInt(e.target.value)||90})} className="p-3 bg-black border border-zinc-800 rounded-xl text-sm" />
          <button onClick={create} className="col-span-2 p-3 bg-white text-black font-bold rounded-xl text-sm">CREATE PROJECT</button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p=>(
            <Link key={p.id} href={`/studio/projects/${p.id}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{p.description||'no desc'}</p>
              <div className="flex gap-2 mt-3 text-"><span className="px-2 py-1 bg-black border border-zinc-800 rounded-full">{p.genre}</span><span className="px-2 py-1 bg-black border border-zinc-800 rounded-full">{p.bpm} BPM</span></div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}