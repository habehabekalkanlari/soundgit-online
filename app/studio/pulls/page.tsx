'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type PR = { id: string, title: string, description: string, status: string, source_project_id: string, target_project_id: string, created_at: string }
type Project = { id: string, name: string }

export default function Pulls() {
  const [prs, setPrs] = useState<PR[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState({ title: '', description: '', source: '', target: '' })
  const load = async () => {
    const { data: prData } = await supabase.from('pull_requests').select('*').order('created_at', {ascending:false})
    if(prData) setPrs(prData)
    const { data: projData } = await supabase.from('projects').select('id,name').order('created_at', {ascending:false})
    if(projData) setProjects(projData as Project[])
  }
  useEffect(()=>{load()},[])
  const createPR = async () => {
    if(!form.title || !form.source || !form.target) return alert('title + source + target gerekli')
    const { error } = await supabase.from('pull_requests').insert([{ title: form.title, description: form.description, source_project_id: form.source, target_project_id: form.target, status: 'open' }])
    if(error) alert(error.message)
    else { setForm({ title: '', description: '', source: '', target: '' }); load() }
  }
  const setStatus = async (id: string, status: string) => { await supabase.from('pull_requests').update({ status }).eq('id', id); load() }
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">PULL REQUESTS</h1>
          <div className="flex gap-2"><Link href="/studio/projects" className="text-xs px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">PROJECTS</Link><Link href="/studio" className="text-xs px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">JAM</Link></div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8">
          <div className="grid grid-cols-2 gap-2">
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title: add 808 + vocal chop" className="col-span-2 p-3 bg-black border border-zinc-800 rounded-xl text-sm" />
            <select value={form.source} onChange={e=>setForm({...form, source:e.target.value})} className="p-3 bg-black border border-zinc-800 rounded-xl text-sm"><option value="">Source</option>{projects.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <select value={form.target} onChange={e=>setForm({...form, target:e.target.value})} className="p-3 bg-black border border-zinc-800 rounded-xl text-sm"><option value="">Target</option>{projects.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="col-span-2 p-3 bg-black border border-zinc-800 rounded-xl text-sm" />
            <button onClick={createPR} className="col-span-2 p-3 bg-white text-black font-bold rounded-xl text-sm">CREATE PR</button>
          </div>
        </div>
        <div className="space-y-3">
          {prs.map(pr=>{
            const sourceName = projects.find(p=>p.id===pr.source_project_id)?.name || pr.source_project_id.slice(0,6)
            const targetName = projects.find(p=>p.id===pr.target_project_id)?.name || pr.target_project_id.slice(0,6)
            return (
              <div key={pr.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center">
                <div><p className="font-bold text-sm">{pr.title} <span className="ml-2 text- px-2 py-0.5 rounded-full border">{pr.status.toUpperCase()}</span></p><p className="text- text-zinc-500 mt-1 font-mono">{sourceName} → {targetName}</p></div>
                <div className="flex gap-1">{pr.status==='open' && <><button onClick={()=>setStatus(pr.id,'merged')} className="text- px-3 py-1.5 bg-purple-600 rounded-full font-bold">MERGE</button><button onClick={()=>setStatus(pr.id,'closed')} className="text- px-3 py-1.5 bg-zinc-800 rounded-full">CLOSE</button></>}</div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}