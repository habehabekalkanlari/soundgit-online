/**
 * SoundGit Hafıza Havuzu - Yerel, Kod yazmadan!
 * PondOS v22 - Chroma olmadan local memory, build geçer!
 */
export type MemoryItem = { id: string, content: string, type: string, version: string, tags: string[] }
class SoundGitMemoryPool {
  private localMemories: MemoryItem[] = []
  private collectionName = 'soundgit_memory'
  async init() {
    console.log('✅ Hafıza havuzu init - local memory mod')
  }
  getDefaultMemories(): MemoryItem[] {
    return [
      { id: 'v16-real-audio', content: 'PondOS v16 Real Audio - BPM Waveform genre techno 72.7% Web Audio API', type: 'code', version: 'v16', tags: ['bpm','waveform','webaudio'] },
      { id: 'laya-322m', content: 'Laya 322M - Genre techno trap house, BPM Key energy danceability, analyzeLocal()', type: 'laya', version: 'v19', tags: ['laya','genre','bpm','322m'] },
      { id: 'knolli-store', content: 'Knolli Store - Laya Meta tek store auto sync, useKnolli() hook, setLayaFromFile() setPrivacy setFriends', type: 'knolli', version: 'v19', tags: ['knolli','store','sync','state'] },
      { id: 'daw-support', content: 'DAW Support - 【entity-Ableton¦canonical_name=Ableton】 .als 【entity-Logic¦canonical_name=Logic】 .logicx 【entity-FL¦canonical_name=FL Studio】 .flp Cubase .cpr Reaper .rpp Stems .zip Audio wav mp3', type: 'daw', version: 'v19.2', tags: ['daw','als','logicx','flp','cpr'] },
      { id: 'timeline-player', content: 'Timeline Player - Canvas waveform real time playhead, seek on click anywhere, hover time, comments markers, freq, color #00ff88 #0088ff #ff0088', type: 'timeline', version: 'v21.2', tags: ['timeline','waveform','playhead','seek'] },
      { id: 'auth-guard', content: 'Auth Guard - Google OAuth localStorage soundgit_user hash access_token redirect to / if no login', type: 'auth', version: 'v18.1', tags: ['auth','google','oauth'] },
      { id: 'ui-tone', content: 'UI Tone in Tone - siyah bg black zinc-900 cards beyaz buttons rounded-full sine colors #00ff88 #0088ff #ff0088 minimal 【entity-SoundCloud¦canonical_name=SoundCloud】 layout', type: 'ui', version: 'v21.1', tags: ['ui','tone','black','minimal'] },
      { id: '【entity-soundcloud¦canonical_name=SoundCloud】-exact', content: '【entity-SoundCloud¦canonical_name=SoundCloud】 Exact Clone - Play left waveform middle cover right likes plays reposts share copy link playlist comment at time timeline akıyor nereye tıklarsan', type: 'ui', version: 'v21', tags: ['【entity-soundcloud¦canonical_name=SoundCloud】','waveform','cover','stats'] },
    ]
  }
  async populate() {
    const memories = this.getDefaultMemories()
    this.localMemories = memories
    console.log('✅ Hafıza havuzu: '+memories.length+' item - kod yazmadan!')
    return memories
  }
  async query(q: string, n=3) {
    const lower = q.toLowerCase()
    if (this.localMemories.length === 0) await this.populate()
    return this.localMemories.filter(m => 
      m.content.toLowerCase().includes(lower) || 
      m.tags.some(t => lower.includes(t.toLowerCase()) || t.toLowerCase().includes(lower)) || 
      m.type.toLowerCase().includes(lower)
    ).slice(0,n)
  }
  async getAll() {
    if (this.localMemories.length === 0) await this.populate()
    return this.localMemories
  }
}
export const memoryPool = new SoundGitMemoryPool()
import { useEffect, useState } from 'react'
export const useMemoryPool = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { memoryPool.init().then(()=>memoryPool.populate()).then(m=>{ setMemories(m); setLoading(false) }) }, [])
  return { memories, loading, query: (q: string)=>memoryPool.query(q), getAll: ()=>memoryPool.getAll() }
}
