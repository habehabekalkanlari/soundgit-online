import { NextRequest, NextResponse } from 'next/server'
import { pondosLoop } from '@/lib/pondos/loop'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET() {
  return NextResponse.json({
    info: 'PondOS v26.1 Autonomous Loop - Tam Otomasyon! Hepsi Entegre!',
    flow: ['1. PANDAS (Data & Flow)', '2. ChromaDB (Code and Component Memory) - Memory feedback loop', '3. LAYA (Decision/Speed) - Hata mı? Tasarım mı? SEO mu? Collab mı?', '4. META (Code Generation)', '5. Playwright & Qwen-VL (Visual Feedback)', '6. Feedback -> refocus & retry -> USER REQUEST'],
    version: 'v26.1', status: 'LIVE', endpoints: { GET: '/api/loop info', POST: '/api/loop {request}' },
    examples: ['Adana Twins - Dark Techno 126 BPM vocal yok, collab lazım', 'npm run build error var', 'Studio sayfası tasarım kontrol et', 'SEO score 17 nasıl 87 oldu']
  })
}
export async function POST(req: NextRequest) {
  try {
    const { request = '' } = await req.json()
    if (!request) return NextResponse.json({ error: 'request gerekli' }, { status: 400 })
    const result = await pondosLoop.run(request)
    return NextResponse.json({ ...result, summary: `✅ ${result.stats.totalTime} - ${result.steps.length} adım - Karar: ${result.decision.type} (${(result.decision.confidence*100).toFixed(0)}%) - ${result.finalResult.summary}`, pondos: 'v26.1 Autonomous Loop', havuz: 'Biri yazıyor, diğeri üstüne ekliyor, parça oluşuyor! Para yok, vesile!' })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
