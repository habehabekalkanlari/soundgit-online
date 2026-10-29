'use client'
import { useState } from 'react'
export default function PondOSPage() {
  const [req, setReq] = useState('Adana Twins - Dark Techno 126 BPM vocal yok, collab lazım')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const runLoop = async () => {
    setLoading(true)
    const res = await fetch('/api/loop', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ request: req }) })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono">
      <h1 className="text-3xl mb-2">PondOS v26.1 Autonomous Loop</h1>
      <p className="text-zinc-400 mb-6">PANDAS → ChromaDB → LAYA (Hata mı? Tasarım mı? SEO mu? Collab mı?) → 【entity-META¦canonical_name=META】 → Playwright & Qwen-VL → USER</p>
      <div className="flex gap-2 mb-4">
        <input value={req} onChange={e=>setReq(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 p-3 rounded" placeholder="İstek yaz..." />
        <button onClick={runLoop} disabled={loading} className="bg-white text-black px-6 py-3 rounded font-bold disabled:opacity-50">{loading?'...':'ÇALIŞTIR'}</button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {['Adana Twins - Dark Techno 126 BPM vocal yok, collab lazım','npm run build error var','Studio sayfası tasarım kontrol et','SEO score nasıl 87 oldu'].map(ex=>(
          <button key={ex} onClick={()=>setReq(ex)} className="text-left text-xs bg-zinc-900 p-2 rounded border border-zinc-800 hover:border-white">{ex}</button>
        ))}
      </div>
      {result && (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
            <div className="text-green-400">✅ {result.summary}</div>
            <div className="text-xs text-zinc-500 mt-2">{result.havuz}</div>
          </div>
          <div className="grid gap-2">
            {result.steps?.map((s:any)=>(
              <div key={s.id} className="bg-zinc-900 p-3 rounded border border-zinc-800 flex gap-3">
                <div className="text-xs bg-zinc-800 px-2 py-1 rounded h-fit">{s.id}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{s.name} <span className="text-zinc-500 text-xs">- {s.time}</span></div>
                  <pre className="text-xs text-zinc-400 mt-1 whitespace-pre-wrap">{JSON.stringify(s.data, null, 2).slice(0,500)}</pre>
                </div>
                <div className="text-green-400 text-xs">{s.status}</div>
              </div>
            ))}
          </div>
          <div className="bg-white text-black p-4 rounded">
            <div className="font-bold">Final: {result.finalResult?.type} - {result.finalResult?.summary}</div>
            <div className="text-xs mt-2 font-mono">{result.finalResult?.code || result.finalResult?.invite || ''}</div>
          </div>
        </div>
      )}
    </div>
  )
}
