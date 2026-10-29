import { NextRequest, NextResponse } from 'next/server'
import { pondosLoop } from '@/lib/pondos/loop'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET() {
  return NextResponse.json({
    info: 'PondOS v26 Autonomous Loop - Tam Otomasyon! Hepsi Entegre!',
    flow: [
      '1. PANDAS (Data & Flow) - Veriyi işler',
      '2. ChromaDB (Code and Component Memory) - Hafızadan kod çeker, Memory feedback loop',
      '3. LAYA (Decision/Speed) - Hata mı? Tasarım mı? SEO mu? Collab mı?',
      '4. 【entity-META¦canonical_name=META】 (Code Generation) - Kodu üretir/yamalar',
      '5. Playwright & Qwen-VL (Visual Feedback) - Screenshot + gözünle gör',
      '6. Feedback -> refocus & retry -> USER REQUEST'
    ],
    usage: 'POST /api/loop { request: "Studio sayfasına collab ekle" }',
    version: 'v26',
    status: 'LIVE - Hepsi entegre otomasyon!'
  })
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { request = '' } = body
    if (!request) return NextResponse.json({ error: 'request gerekli' }, { status: 400 })
    const result = await pondosLoop.run(request)
    return NextResponse.json({
      ...result,
      summary: `Otomasyon tamam! ${result.steps.length} adım, karar: ${result.steps[2]?.data?.decision?.type}, ${result.finalResult?.summary}`,
      pondos: 'v26 Autonomous Loop - Hepsi entegre!',
      havuz: 'Biri yazıyor, diğeri üstüne ekliyor, parça oluşuyor! Para yok, vesile!'
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
