"use client"
import { useEffect, useState } from 'react'
import { memoryPool, MemoryItem } from './chromaPool'
export const useMemoryPool = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { memoryPool.init().then(()=>memoryPool.populate()).then(m=>{ setMemories(m); setLoading(false) }) }, [])
  return { memories, loading, query: (q: string)=>memoryPool.query(q), getAll: ()=>memoryPool.getAll() }
}
