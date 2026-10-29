import { NextRequest, NextResponse } from 'next/server'
import { layaSeo } from '@/lib/seo/layaSeo'
import { metaSeo } from '@/lib/seo/metaSeo'
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  const type = req.nextUrl.searchParams.get('type') || 'info'
  if (type === 'info') {
    return NextResponse.json({
      info: 'SoundGit Laya SEO Denetçisi + Meta SEO İyileştirici v23',
      usage: {
        'POST /api/seo': {
          body: { title: 'Başlık', content: 'İçerik...', keyword: 'anahtar kelime', type: 'blog | product', autoFix: true },
          response: 'audit report + fixed content'
        },
        'GET /api/seo?q=keyword&type=info': 'Bu bilgi'
      },
      laya: 'SEO denetçisi - keyword yoğunluğu, başlık uzunluğu, H1 H2, meta, eksiklik raporu',
      meta: 'SEO iyileştirici - Laya raporuna göre blog/ürün açıklamalarını otomatik SEO uyumlu yapar',
      version: 'v23'
    })
  }
  return NextResponse.json({ query: q, message: 'POST ile denetim yap' })
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, content, keyword, h1, h2s, metaDesc, type = 'blog', autoFix = true } = body
    if (!title || !content || !keyword) {
      return NextResponse.json({ error: 'title, content, keyword gerekli' }, { status: 400 })
    }
    // Laya denetim
    const report = layaSeo.audit(content, title, keyword, metaDesc, h1, h2s)
    if (!autoFix) {
      return NextResponse.json({ report, laya: 'Denetim tamamlandı' })
    }
    // Meta düzeltme
    let fixed
    if (type === 'product') {
      fixed = metaSeo.fixProduct(title, content, keyword)
    } else {
      fixed = metaSeo.fixBlog(title, content, keyword)
    }
    return NextResponse.json({
      report,
      fixed,
      summary: `Laya denetledi: ${report.score}/100 -> Meta düzeltti: ${fixed.newScore}/100`,
      laya: `Denetim: ${report.issues.length} sorun bulundu`,
      meta: `İyileştirme: ${fixed.fixesApplied.length} düzeltme uygulandı`
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
