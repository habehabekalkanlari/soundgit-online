import { useEffect, useState } from 'react'
export type LayaState = { genre: string; prob: number; bpm: number; key: string; daw: string; energy: number; danceability: number }
export type MetaState = { file_name: string; file_url: string; privacy: 'private' | 'friends_only' | 'public'; owner: string; friends: string[]; branch: string }
export type KnolliState = { laya: LayaState; meta: MetaState; isSyncing: boolean }
class KnolliStore {
  private state: KnolliState = {
    laya: { genre: 'other', prob: 0.5, bpm: 124, key: 'F#m', daw: 'WAV', energy: 0.5, danceability: 0.5 },
    meta: { file_name: '', file_url: '', privacy: 'friends_only', owner: '', friends: ['habehabe', 'pondos'], branch: 'main' },
    isSyncing: false
  }
  private listeners: Set<(s: KnolliState) => void> = new Set()
  setLayaFromFile(fileName: string, fileUrl: string = ''): KnolliState {
    this.state.isSyncing = true
    const lower = fileName.toLowerCase()
    if (lower.endsWith('.als')) this.state.laya.daw = ' Ableton'
    else if (lower.endsWith('.logicx')) this.state.laya.daw = ' Logic'
    else if (lower.endsWith('.flp')) this.state.laya.daw = 'FL'
    else if (lower.endsWith('.zip')) this.state.laya.daw = 'Stems'
    else this.state.laya.daw = 'WAV'
    if (lower.includes('techno') || lower.includes('strange') || lower.includes('adana')) {
      this.state.laya.genre = 'techno'
      this.state.laya.prob = 0.727
      this.state.laya.bpm = 124
      this.state.laya.key = 'F#m'
    }
    this.state.meta.file_name = fileName
    this.state.meta.file_url = fileUrl
    this.state.meta.branch = lower.includes('vocal') ? 'vocal' : 'main'
    this.state.isSyncing = false
    this.notify()
    return this.state
  }
  setPrivacy(p: MetaState['privacy']) { this.state.meta.privacy = p; this.notify(); return this }
  setFriends(f: string[]) { this.state.meta.friends = f; this.notify(); return this }
  setOwner(email: string) { this.state.meta.owner = email; this.notify(); return this }
  subscribe(fn: (s: KnolliState) => void) { 
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }
  get() { return this.state }
  private notify() { this.listeners.forEach(fn => fn({ ...this.state })) }
}
export const knolli = new KnolliStore()
export const useKnolli = () => {
  const [state, setState] = useState<KnolliState>(knolli.get())
  useEffect(() => knolli.subscribe(setState), [])
  return {
    ...state,
    setLayaFromFile: (n: string, u?: string) => knolli.setLayaFromFile(n, u),
    setPrivacy: (p: MetaState['privacy']) => knolli.setPrivacy(p),
    setFriends: (f: string[]) => knolli.setFriends(f),
    setOwner: (e: string) => knolli.setOwner(e),
  }
}
