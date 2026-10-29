
import { ChromaClient } from 'chromadb'
export type MemoryItem = { id: string, content: string, type: string, version: string, tags: string[] }
class SoundGitMemoryPool {
  private client: ChromaClient
  private collectionName = 'soundgit_memory'
  private localMemories: MemoryItem[] = []
  constructor() { this.client = new ChromaClient() }
  async init() { try { await this.client.getOrCreateCollection({ name: this.collectionName }); console.log('✅ Chroma hazır') } catch { console.log('⚠️ Chroma server yok, local memory kullanılıyor') } }
  getDefaultMemories(): MemoryItem[] {
    return [
      { id: 'v16-real-audio', content: 'PondOS v16 Real Audio - BPM Waveform genre techno 72.7%', type: 'code', version: 'v16', tags: ['bpm','waveform'] },
      { id: 'laya-322m', content: 'Laya 322M - Genre techno trap house, BPM Key energy, analyzeLocal()', type: 'laya', version: 'v19', tags: ['laya','genre','bpm'] },
      { id: 'knolli-store', content: 'Knolli Store - Laya Meta tek store auto sync, useKnolli() setLayaFromFile()', type: 'knolli', version: 'v19', tags: ['knolli','store','sync'] },
      { id: 'daw-support', content: 'DAW - 【entity-Ableton¦canonical_name=Ableton】 .als Logic .logicx FL .flp Cubase .cpr Reaper .rpp', type: 'daw', version: 'v19.2', tags: ['daw','als','logicx'] },
      { id: 'timeline-player', content: 'Timeline Player - Canvas waveform real time playhead seek on click marker comments freq', type: 'timeline', version: 'v21.2', tags: ['timeline','waveform','playhead'] },
      { id: 'auth-guard', content: 'Auth Guard - Google OAuth localStorage soundgit_user redirect', type: 'auth', version: 'v18.1', tags: ['auth','google'] },
      { id: 'ui-tone', content: 'UI Tone in Tone - siyah zinc-900 beyaz rounded-full #00ff88 #0088ff #ff0088', type: 'ui', version: 'v21.1', tags: ['ui','tone','minimal'] },
    ]
  }
  async populate() {
    const memories = this.getDefaultMemories()
    this.localMemories = memories
    console.log('✅ Hafıza havuzu: '+memories.length+' item')
    memories.forEach(m => console.log('  - '+m.id+' ['+m.type+'] '+m.version))
    try {
      const col = await this.client.getOrCreateCollection({ name: this.collectionName })
      await col.add({ ids: memories.map(m=>m.id), metadatas: memories.map(m=>({ type: m.type, version: m.version })), documents: memories.map(m=>m.content) })
      console.log('✅ Chroma DB yazıldı')
    } catch { console.log('ℹ️ Local memory kullanılıyor') }
    return memories
  }
  async query(q: string, n=3) {
    const lower = q.toLowerCase()
    return this.localMemories.filter(m => m.content.toLowerCase().includes(lower) || m.tags.some(t=>lower.includes(t)) || m.type.includes(lower)).slice(0,n)
  }
  async getAll() { return this.localMemories.length ? this.localMemories : this.getDefaultMemories() }
}
export const memoryPool = new SoundGitMemoryPool()
import { useEffect, useState } from 'react'
export const useMemoryPool = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { memoryPool.init().then(()=>memoryPool.populate()).then(m=>{ setMemories(m); setLoading(false) }) }, [])
  return { memories, loading, query: (q: string)=>memoryPool.query(q), getAll: ()=>memoryPool.getAll() }
}
