export type MemoryItem = { id: string, content: string, type: string, version: string, tags: string[] }
class SoundGitMemoryPool {
  private localMemories: MemoryItem[] = []
  async init() { console.log('✅ Hafıza havuzu init - local memory') }
  getDefaultMemories(): MemoryItem[] {
    return [
      { id: 'v16-real-audio', content: 'PondOS v16 Real Audio - BPM Waveform genre techno 72.7% Web Audio API', type: 'code', version: 'v16', tags: ['bpm','waveform'] },
      { id: 'laya-322m', content: 'Laya 322M - Genre techno trap house BPM Key energy', type: 'laya', version: 'v19', tags: ['laya','genre','bpm'] },
      { id: 'knolli-store', content: 'Knolli Store - Laya Meta tek store auto sync useKnolli setLayaFromFile', type: 'knolli', version: 'v19', tags: ['knolli','store','sync'] },
      { id: 'daw-support', content: 'DAW - 【entity-Ableton¦canonical_name=Ableton】 .als 【entity-Logic¦canonical_name=Logic】 .logicx FL .flp Cubase .cpr', type: 'daw', version: 'v19.2', tags: ['daw','als'] },
      { id: 'timeline-player', content: 'Timeline Player - Canvas waveform real time playhead seek on click marker comments', type: 'timeline', version: 'v21.2', tags: ['timeline','waveform'] },
      { id: 'auth-guard', content: 'Auth Guard - Google OAuth localStorage soundgit_user redirect', type: 'auth', version: 'v18.1', tags: ['auth','google'] },
      { id: 'ui-tone', content: 'UI Tone in Tone - siyah zinc-900 beyaz rounded-full #00ff88 #0088ff #ff0088', type: 'ui', version: 'v21.1', tags: ['ui','tone'] },
    ]
  }
  async populate() {
    const memories = this.getDefaultMemories()
    this.localMemories = memories
    console.log('✅ Hafıza havuzu: '+memories.length+' item')
    return memories
  }
  async query(q: string, n=3) {
    const lower = q.toLowerCase()
    if (this.localMemories.length === 0) await this.populate()
    return this.localMemories.filter(m => m.content.toLowerCase().includes(lower) || m.tags.some(t=>lower.includes(t.toLowerCase())) || m.type.toLowerCase().includes(lower)).slice(0,n)
  }
  async getAll() {
    if (this.localMemories.length === 0) await this.populate()
    return this.localMemories
  }
}
export const memoryPool = new SoundGitMemoryPool()
