/**
 * Laya SEO Denetçisi - PondOS v23
 * Anahtar kelime yoğunluğu, başlık uzunluğu, H1 H2 denetimi, eksiklik raporu
 * Laya = Analyzer, Genre gibi SEO'yu analiz ediyor!
 */
export type SeoAuditReport = {
  url?: string
  targetKeyword: string
  title: string
  content: string
  score: number // 0-100
  issues: SeoIssue[]
  checks: SeoCheck[]
  summary: string
}
export type SeoIssue = {
  type: 'critical' | 'warning' | 'info'
  field: 'title' | 'h1' | 'h2' | 'meta' | 'keyword_density' | 'content_length' | 'readability'
  message: string
  current?: string | number
  expected?: string
  fix?: string
}
export type SeoCheck = {
  name: string
  status: 'pass' | 'fail' | 'warn'
  value: string | number
  ideal: string
}
export class LayaSeoAuditor {
  // Laya gibi analiz et!
  audit(content: string, title: string, targetKeyword: string, metaDesc?: string, h1?: string, h2s?: string[]): SeoAuditReport {
    const issues: SeoIssue[] = []
    const checks: SeoCheck[] = []
    let score = 100
    const lowerContent = content.toLowerCase()
    const lowerKeyword = targetKeyword.toLowerCase()
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    const keywordCount = (lowerContent.match(new RegExp(lowerKeyword, 'g')) || []).length
    const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0
    // 1. Başlık Uzunluğu (Title) - 50-60 ideal
    const titleLen = title.length
    if (titleLen < 30) {
      issues.push({ type: 'critical', field: 'title', message: `Başlık çok kısa: ${titleLen} karakter`, current: titleLen, expected: '50-60 karakter', fix: `Başlığı uzat, anahtar kelimeyi ekle: "${targetKeyword}"` })
      checks.push({ name: 'Başlık Uzunluğu', status: 'fail', value: `${titleLen} karakter`, ideal: '50-60 karakter' })
      score -= 15
    } else if (titleLen > 70) {
      issues.push({ type: 'warning', field: 'title', message: `Başlık çok uzun: ${titleLen} karakter`, current: titleLen, expected: '50-60 karakter', fix: 'Başlığı kısalt, 60 karaktere indir' })
      checks.push({ name: 'Başlık Uzunluğu', status: 'warn', value: `${titleLen} karakter`, ideal: '50-60 karakter' })
      score -= 8
    } else {
      checks.push({ name: 'Başlık Uzunluğu', status: 'pass', value: `${titleLen} karakter`, ideal: '50-60 karakter' })
    }
    // Title'da anahtar kelime var mı?
    if (!title.toLowerCase().includes(lowerKeyword)) {
      issues.push({ type: 'critical', field: 'title', message: `Başlıkta anahtar kelime yok: "${targetKeyword}"`, fix: `Başlığa "${targetKeyword}" ekle, başta olsun` })
      score -= 15
    } else {
      const pos = title.toLowerCase().indexOf(lowerKeyword)
      if (pos > 20) {
        issues.push({ type: 'warning', field: 'title', message: 'Anahtar kelime başlıkta geç ama sonda', fix: 'Anahtar kelimeyi başa al' })
        score -= 5
      }
      checks.push({ name: 'Başlıkta Anahtar Kelime', status: 'pass', value: `"${targetKeyword}" var`, ideal: 'Başta olmalı' })
    }
    // 2. H1 Denetimi - 1 tane, 20-70 karakter, keyword içermeli
    if (!h1) {
      issues.push({ type: 'critical', field: 'h1', message: 'H1 başlık yok!', expected: '1 adet H1, anahtar kelime içermeli', fix: `H1 ekle: "${targetKeyword} ile ilgili başlık"` })
      score -= 15
    } else {
      const h1Len = h1.length
      checks.push({ name: 'H1 Var mı?', status: h1Len >= 20 ? 'pass' : 'warn', value: `${h1Len} karakter: ${h1}`, ideal: '1 adet, 20-70 karakter' })
      if (!h1.toLowerCase().includes(lowerKeyword)) {
        issues.push({ type: 'critical', field: 'h1', message: `H1'de anahtar kelime yok`, current: h1, fix: `H1'e "${targetKeyword}" ekle` })
        score -= 10
      }
    }
    // 3. H2 Denetimi - en az 2, keyword varyasyonları
    const h2Count = h2s?.length || 0
    if (h2Count < 2) {
      issues.push({ type: 'warning', field: 'h2', message: `H2 az: ${h2Count} adet`, expected: 'En az 2-3 H2, anahtar kelime varyasyonları', fix: 'H2 ekle: "En iyi...", "Nasıl yapılır...", "Fiyatları..." gibi' })
      score -= 8
    }
    checks.push({ name: 'H2 Sayısı', status: h2Count >= 2 ? 'pass' : 'warn', value: `${h2Count} adet`, ideal: '2-4 adet' })
    // 4. Anahtar Kelime Yoğunluğu - %0.5 - %2.5 ideal
    if (density < 0.5) {
      issues.push({ type: 'critical', field: 'keyword_density', message: `Anahtar kelime yoğunluğu düşük: %${density.toFixed(2)} (${keywordCount}/${wordCount})`, expected: '%0.5 - %2.5', fix: `İçeriğe ${Math.ceil(wordCount*0.01)} kez daha "${targetKeyword}" ekle` })
      score -= 15
    } else if (density > 3) {
      issues.push({ type: 'critical', field: 'keyword_density', message: `Anahtar kelime yoğunluğu yüksek: %${density.toFixed(2)} - Keyword stuffing!`, expected: '%0.5 - %2.5', fix: 'Bazı anahtar kelimeleri sil, eş anlamlı kullan' })
      score -= 12
    } else {
      checks.push({ name: 'Anahtar Kelime Yoğunluğu', status: 'pass', value: `%${density.toFixed(2)} (${keywordCount} kez)`, ideal: '%0.5 - %2.5' })
    }
    // 5. İçerik Uzunluğu
    if (wordCount < 300) {
      issues.push({ type: 'critical', field: 'content_length', message: `İçerik çok kısa: ${wordCount} kelime`, expected: 'Blog için 800+, ürün için 300+', fix: 'İçeriği uzat, detay ekle, Laya gibi analiz et' })
      score -= 15
    } else if (wordCount < 600) {
      checks.push({ name: 'İçerik Uzunluğu', status: 'warn', value: `${wordCount} kelime`, ideal: '800+ blog, 300+ ürün' })
      score -= 5
    } else {
      checks.push({ name: 'İçerik Uzunluğu', status: 'pass', value: `${wordCount} kelime`, ideal: '800+ blog, 300+ ürün' })
    }
    // 6. Meta Description
    if (!metaDesc) {
      issues.push({ type: 'warning', field: 'meta', message: 'Meta description yok!', expected: '150-160 karakter, anahtar kelime içermeli', fix: `Meta ekle: "${targetKeyword} ile ilgili 155 karakter açıklama"` })
      score -= 8
    } else {
      const metaLen = metaDesc.length
      if (metaLen < 120 || metaLen > 170) {
        issues.push({ type: 'warning', field: 'meta', message: `Meta uzunluğu ideal değil: ${metaLen}`, expected: '150-160 karakter', fix: 'Meta\'yı 155 karaktere ayarla' })
        score -= 5
      }
      if (!metaDesc.toLowerCase().includes(lowerKeyword)) {
        issues.push({ type: 'warning', field: 'meta', message: 'Meta\'da anahtar kelime yok', fix: `Meta'ya "${targetKeyword}" ekle` })
        score -= 5
      }
    }
    // 7. İlk 100 kelimede anahtar kelime
    const first100 = words.slice(0, 100).join(' ').toLowerCase()
    if (!first100.includes(lowerKeyword)) {
      issues.push({ type: 'warning', field: 'keyword_density', message: 'Anahtar kelime ilk 100 kelimede yok', fix: 'İlk paragrafta anahtar kelimeyi geçir' })
      score -= 7
    }
    const criticalCount = issues.filter(i => i.type === 'critical').length
    const summary = `SEO Skoru: ${Math.max(0, score)}/100 - ${criticalCount} kritik, ${issues.length - criticalCount} uyarı. ${score >= 80 ? 'İyi!' : score >= 50 ? 'Orta, düzeltme lazım' : 'Kötü, acil düzelt!'}`
    return {
      targetKeyword,
      title,
      content,
      score: Math.max(0, score),
      issues,
      checks,
      summary
    }
  }
  // Toplu denetim - birden fazla sayfa
  auditBatch(pages: { title: string, content: string, keyword: string }[]): SeoAuditReport[] {
    return pages.map(p => this.audit(p.content, p.title, p.keyword))
  }
}
export const layaSeo = new LayaSeoAuditor()
