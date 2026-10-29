/**
 * Meta Collab İyileştirici - PondOS v24 Havuz Mantığı
 * Laya'nın raporuna göre collab daveti oluşturur
 * Para yok, vesile oluyoruz!
 */
import { CollabReport } from './layaCollab'
export type CollabFixResult = {
  originalFile: string
  collabTitle: string
  collabDescription: string
  collabTags: string[]
  fixesApplied: string[]
  newScore: number
  report: CollabReport
  invite: string
}
export class MetaCollabFixer {
  // Collab daveti oluştur
  createInvite(report: CollabReport): string {
    const needsText = report.needs.map(n => {
      if (n === 'vocal') return '🎤 Vocal'
      if (n === 'energy') return '🔥 Enerji/Drop'
      if (n === 'danceability') return '💃 Hi-hat/Groove'
      if (n === 'bass') return '🎸 Bass'
      if (n === 'drums') return '🥁 Drums'
      if (n === 'drop') return '💥 Drop'
      return n
    }).join(', ')
    return `[COLLAB AÇIK] ${report.genre.toUpperCase()} ${report.bpm} BPM - ${needsText} Aranıyor!
Havuz Mantığı: Biri yazıyor, diğeri üstüne ekliyor, parça oluşuyor! Para yok, vesile oluyoruz!
Senin yeteneğinle bu parça tamamlanacak!`
  }
  // Collab başlığı oluştur
  createTitle(report: CollabReport): string {
    const needs = report.needs.slice(0, 2).map(n => n.toUpperCase()).join(' + ')
    const status = report.score < 50 ? 'ACİL' : report.score < 80 ? 'AÇIK' : 'TAMAMLANMAK ÜZERE'
    return `[COLLAB ${status}] ${report.genre} ${report.bpm} BPM - ${needs} Lazım! - ${report.daw} - Skor ${report.score}/100`
  }
  // Collab açıklaması oluştur
  createDescription(report: CollabReport): string {
    const needsList = report.needs.map(n => {
      if (n === 'vocal') return '- 🎤 Vocal: Yok! %0, lazım! Adana Twins tarzı vocal chop ekle'
      if (n === 'energy') return '- 🔥 Enerji: Düşük, 50%, drop lazım! 45. saniyeye drop ekle'
      if (n === 'danceability') return '- 💃 Danceability: Düşük, hi-hat lazım! Groove ekle'
      if (n === 'bass') return '- 🎸 Bass: Zayıf, güçlendir! Sub bass ekle'
      if (n === 'drums') return '- 🥁 Drums: Yok, lazım! Kick + snare ekle'
      if (n === 'drop') return '- 💥 Drop: Yok, lazım! 45. saniyeye marker koy'
      return `- ${n}: Lazım!`
    }).join('\n')
    const checksList = report.checks.map(c => `${c.icon} ${c.name}: ${c.value} ${c.status === 'has' ? '✅' : c.status === 'missing' ? '❌' : '⚠️'}`).join('\n')
    return `## Proje Hakkında
- **Dosya:** ${report.fileName}
- **Genre:** ${report.genre} ${report.bpm} BPM ${report.key}
- **DAW:** ${report.daw}
- **Durum:** Unreleased, WIP, Havuzda
- **Skor:** ${report.score}/100 - ${report.collabOpen ? 'Collab Açık!' : 'Tamamlanmak Üzere'}
## 🔍 Laya Collab Raporu
${checksList}
## ❌ Eksikler
${needsList}
## 💡 Öneri
${report.issues.filter(i => i.type === 'good').map(i => `${i.icon} ${i.message}`).join('\n') || 'Vocal eklenirse 90/100 olur!'}
## 🌊 Havuz Mantığı - Nasıl Katılırım?
1. **Dinle:** Timeline'da akıyor, nereye tıklarsan oraya gider, projeyi dinle
2. **Üstüne Ekle:** ${report.needs.join(', ')} ekle, ne yapabiliyorsan
3. **Tekrar Paylaş:** Kiminse onunla paylaş, havuza ekle, branch oluştur
4. **Parça Oluşsun:** Birlikte üretelim, 【entity-GitHub¦canonical_name=GitHub】 gibi!
**Para yok, vesile oluyoruz!** Biri yazıyor, diğeri üstüne ekliyor, parça oluşuyor! İnsanlar bir şeyler üretiyor!
## 📝 Katkıda Bulun
- 🎤 Vocal Ekle: Vocal ekleyeceğim butonuna tıkla
- 🥁 Drums Ekle: Drums ekleyeceğim butonuna tıkla
- 💬 Yorum Yap: Timeline'da marker'a yorum ekle
- 🔗 Paylaş: Arkadaşımla paylaş
## Skor: ${report.score}/100 - Collab ${report.collabOpen ? 'Lazım!' : 'Tamamlanmak Üzere!'}
${report.summary}
`
  }
  // Tag'ler oluştur
  createTags(report: CollabReport): string[] {
    const tags = [
      '#collab-açık',
      `#${report.genre}`,
      `#${report.bpm}bpm`,
      `#${report.daw.toLowerCase()}`,
      '#unreleased',
      '#havuz',
      '#para-yok',
      '#vesile'
    ]
    report.needs.forEach(n => tags.push(`#${n}-aranıyor`))
    if (report.score < 50) tags.push('#acil-collab')
    return tags
  }
  // Ana fonksiyon - Laya raporuna göre collab oluştur
  fix(report: CollabReport): CollabFixResult {
    const collabTitle = this.createTitle(report)
    const collabDescription = this.createDescription(report)
    const collabTags = this.createTags(report)
    const invite = this.createInvite(report)
    const fixesApplied = [
      `Başlık: Collab başlığı oluşturuldu - ${collabTitle}`,
      `Açıklama: ${report.needs.length} eksik için collab daveti yazıldı`,
      `Tag'ler: ${collabTags.join(', ')}`,
      `Davet: ${invite}`,
      `Skor: ${report.score}/100 - ${report.collabOpen ? 'Collab açık, havuza eklendi!' : 'Tamamlanmak üzere'}`
    ]
    const newScore = report.score < 80 ? Math.min(92, report.score + 30) : report.score
    return {
      originalFile: report.fileName,
      collabTitle,
      collabDescription,
      collabTags,
      fixesApplied,
      newScore,
      report,
      invite
    }
  }
  // Dosyadan collab oluştur
  fixFile(fileName: string, genre?: string, bpm?: number): CollabFixResult {
    const { layaCollab } = require('./layaCollab')
    const report = layaCollab.audit(fileName, genre, bpm)
    return this.fix(report)
  }
}
export const metaCollab = new MetaCollabFixer()
