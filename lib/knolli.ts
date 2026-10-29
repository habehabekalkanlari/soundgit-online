/**
 * Knolli - Laya <-> 【entity-Meta¦canonical_name=Meta】 State Manager
 * PondOS v19 - Tek store, auto sync!
 */
export type LayaState = { genre: string; prob: number; bpm: number; key: string; daw: string; energy: number; danceability: number }
export type MetaState = { file_name: string; file_url: string; privacy: 'private' | 'friends_only' | 'public'; owner: string; friends: string[]; branch: string }
export type KnolliState = { laya: LayaState; 【entity-meta¦canonical_name=Meta】: MetaState; isSyncing: boolean }
class KnolliStore {
  private state: KnolliState = {
    laya: { genre: 'other', prob: 0.5, bpm: 124, key: 'F#m', daw: 'WAV', energy: 0.5, danceability: 0.5 },
    【entity-meta¦canonical_name=Meta】: { file_name: '', file_url: '', privacy: 'friends_only', owner: '', friends: ['habehabe', 'pondos', 'adana_twins'], branch: 'main' },
    isSyncing: false
  }
  private listeners: Set<(s: KnolliState) => void> = new Set()
  setLayaFromFile(fileName: string, fileUrl: string = ''): KnolliState {
    this.state.isSyncing = true
    const lower = fileName.toLowerCase()
    if (lower.endsWith('.als') || lower.endsWith('.alp')) this.state.laya.daw = ' 【entity-Ableton¦canonical_name=Ableton】'
    else if (lower.endsWith('.logicx')) this.state.laya.daw = ' 【entity-Logic¦canonical_name=Logic】'
    else if (lower.endsWith('.flp')) this.state.laya.daw = '【entity-FL Studio¦canonical_name=FL Studio】'
    else if (lower.endsWith('.zip')) this.state.laya.daw = 'Stems'
    else this.state.laya.daw = 'WAV'
    if (lower.includes('techno') || lower.includes('strange') || lower.includes('adana')) {
      this.state.laya.genre = 'techno'; this.state.laya.prob = 0.727; this.state.laya.bpm = 124; this.state.laya.key = 'F#m'; this.state.laya.energy = 0.9; this.state.laya.danceability = 0.85
    } else if (lower.includes('trap')) {
      this.state.laya.genre = 'trap'; this.state.laya.prob = 0.85; this.state.laya.bpm = 140; this.state.laya.key = 'Dm'; this.state.laya.energy = 0.8
    } else if (lower.includes('house')) {
      this.state.laya.genre = 'house'; this.state.laya.prob = 0.75; this.state.laya.bpm = 126; this.state.laya.key = 'Am'
    } else {
      this.state.laya.genre = 'other'; this.state.laya.prob = 0.5
    }
    this.state.【entity-meta¦canonical_name=Meta】.file_name = fileName
    this.state.【entity-meta¦canonical_name=Meta】.file_url = fileUrl
    if (lower.includes('vocal')) this.state.【entity-meta¦canonical_name=Meta】.branch = 'vocal'
    else if (lower.includes('drum') || lower.includes('kick')) this.state.【entity-meta¦canonical_name=Meta】.branch = 'drums'
    else if (lower.includes('bass')) this.state.【entity-meta¦canonical_name=Meta】.branch = 'bass'
    else this.state.【entity-meta¦canonical_name=Meta】.branch = 'main'
    this.state.isSyncing = false
    this.notify()
    return this.state
  }
  setPrivacy(p: MetaState['privacy']) { this.state.【entity-meta¦canonical_name=Meta】.privacy = p; this.notify(); return this }
  setFriends(f: string[]) { this.state.【entity-meta¦canonical_name=Meta】.friends = f; this.notify(); return this }
  setOwner(email: string) { this.state.【entity-meta¦canonical_name=Meta】.owner = email; this.notify(); return this }
  subscribe(fn: (s: KnolliState) => void) { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  get() { return this.state }
  private notify() { this.listeners.forEach(fn => fn({ ...this.state })) }
}
export const knolli = new KnolliStore()
import { useEffect, useState } from 'react'
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
