'use client'
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Invite = any

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [invites, setInvites] = useState<Invite[]>([])
  const [generating, setGenerating] = useState(false)

  const ADMIN_PASS = 'cigaw2024'

  const load = async () => {
    const { data } = await supabase.from('invites').select('*').order('created_at', {ascending:false}).limit(100)
    if(data) setInvites(data)
  }

  useEffect(()=>{ if(auth) load() },[auth])

  const generate = async () => {
    setGenerating(true)
    const code = Math.random().toString(36).substring(2,8).toUpperCase() + '-' + Math.random().toString(36).substring(2,5).toUpperCase()
    let res = await supabase.from('invites').insert([{ invite_code: code }]).select()
    if(res.error){
      res = await supabase.from('invites').insert([{ code: code }]).select()
    }
    if(res.error){
      alert('Hata: ' + res.error.message)
    } else {
      navigator.clipboard.writeText(code)
      load()
    }
    setGenerating(false)
  }

  const del = async (id: string) => {
    if(!confirm('Silinsin mi?')) return
    await supabase.from('invites').delete().eq('id', id)
    load()
  }

  if(!auth){
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
          <h1 className="font-black text-xl mb-1">ADMIN</h1>
          <p className="text-xs text-zinc-500 mb-4">SoundGit invite üret</p>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="şifre" className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-sm mb-3" />
          <button onClick={()=>{ if(pw===ADMIN_PASS) setAuth(true); else alert('yanlış') }} className="w-full p-3 bg-white text-black font-bold rounded-xl text-sm">GİR</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">ADMIN • INVITES</h1>
          <button onClick={generate} disabled={generating} className="px-5 py-2.5 bg-white text-black font-bold rounded-xl text-sm">
            {generating?'ÜRETİLİYOR...':'+ KOD ÜRET'}
          </button>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {invites.map((inv:any)=>{
            const code = inv.invite_code || inv.code || '—'
            return (
              <div key={inv.id} className="flex justify-between p-3 border-b border-zinc-800/50 text-sm">
                <span className="font-mono font-bold">{code}</span>
                <div className="flex gap-2">
                  <button onClick={()=>navigator.clipboard.writeText(code)} className="text- px-2 py-1 bg-black border border-zinc-800 rounded-full">COPY</button>
                  <button onClick={()=>del(inv.id)} className="text- px-2 py-1 bg-red-900/20 border border-red-800/30 rounded-full text-red-400">DELETE</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}