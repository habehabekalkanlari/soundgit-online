import { NextRequest, NextResponse } from 'next/server'
import { layaCollab } from '@/lib/collab/layaCollab'
import { metaCollab } from '@/lib/collab/metaCollab'
export async function GET(req: NextRequest) {
  return NextResponse.json({
    info: 'SoundGit Laya Collab + Meta Collab v24 - Havuz Mantığı',
    usage: {
      'POST /api/collab': {
        body: { fileName: 'track.wav', genre: 'techno', bpm: 126, key: 'F#m', daw: 'Ableton' },
        response: 'Laya collab raporu + Meta collab daveti'
      }
    },
    laya: 'Collab denetçisi - Vocal, enerji, danceability, drop, bass, drums eksik mi?',
    meta: 'Collab daveti oluşturur - Havuz mantığı, para yok, vesile oluyoruz!',
    version: 'v24'
  })
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fileName, genre, bpm, key, daw, branches } = body
    if (!fileName) {
      return NextResponse.json({ error: 'fileName gerekli' }, { status: 400 })
    }
    // Laya collab denetim
    const report = layaCollab.audit(fileName, genre, bpm, key, daw, branches)
    // Meta collab daveti
    const fixed = metaCollab.fix(report)
    return NextResponse.json({
      report,
      fixed,
      summary: `Laya: ${report.score}/100 - ${report.summary} -> Meta: Collab daveti oluşturuldu, yeni skor ${fixed.newScore}/100`,
      laya: `Denetim: ${report.needs.length} eksik bulundu - ${report.needs.join(', ')}`,
      meta: `Davet: ${fixed.invite}`,
      havuz: 'Para yok, vesile oluyoruz! Biri yazıyor, diğeri üstüne ekliyor, parça oluşuyor!'
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
