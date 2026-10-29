import { memoryPool } from '@/lib/vector/chromaPool'
import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  await memoryPool.init()
  const all = await memoryPool.getAll()
  if (all.length === 0) await memoryPool.populate()
  if (q) {
    const results = await memoryPool.query(q)
    return NextResponse.json({ query: q, results, count: results.length })
  }
  const memories = await memoryPool.getAll()
  return NextResponse.json({ memories, count: memories.length, info: 'SoundGit Hafıza Havuzu - PondOS v16-v21.2 - Kod yazmadan!' })
}
