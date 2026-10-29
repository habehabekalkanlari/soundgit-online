import { NextRequest, NextResponse } from 'next/server'
import { pondosLoop } from '@/lib/pondos/loop'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET() {
  return NextResponse.json({
    info: 'PondOS v26.1 Autonomous Loop - Tam Otomasyon!',
    flow: ['1. PANDAS', '2. ChromaDB - Memory feedback loop', '3. LAYA - Hata mi? Tasarim mi? SEO mu? Collab mi?', '4. 【entity-META¦canonical_name=META】', '5. Playwright & Qwen-VL', '6. Feedback -> USER'],
    version: 'v26.1', status: 'LIVE'
  })
}
export async function POST(req: NextRequest) {
  try {
    const { request = '' } = await req.json()
    if (!request) return NextResponse.json({ error: 'request gerekli' }, { status: 400 })
    const result = await pondosLoop.run(request)
    return NextResponse.json({
      ...result,
      summary: `OK ${result.stats.totalTime} - ${result.steps.length} adim - Karar: ${result.decision.type} - ${result.finalResult.summary}`,
      pondos: 'v26.1 Autonomous Loop',
      havuz: 'Biri yaziyor, digeri ustune ekliyor, parca olusuyor! Para yok, vesile!'
    })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
