/**
 * Meta SEO İyileştirici - PondOS v23
 * Laya'nın raporuna göre blog/ürün açıklamalarını otomatik SEO uyumlu yapar
 * Meta = Fixer, Laya'nın bulduğu hataları düzeltir!
 */
import { SeoAuditReport, SeoIssue } from './layaSeo'
export type SeoFixResult = {
  originalTitle: string
  fixedTitle: string
  originalContent: string
  fixedContent: string
  originalMeta?: string
  fixedMeta: string
  fixesApplied: string[]
  newScore: number
  report: SeoAuditReport
}
export class MetaSeoFixer {
  // Başlığı düzelt
  fixTitle(original: string, keyword: string, issues: SeoIssue[]): string {
    let title = original.trim()
    // Anahtar kelime yoksa ekle
    if (!title.toLowerCase().includes(keyword.toLowerCase())) {
      // Başa ekle
      title = `${keyword} - ${title}`
    }
    // Çok kısa ise uzat
    if (title.length < 30) {
      title = `${title} | En İyi ${keyword} Rehberi 2024`
    }
    // Çok uzun ise kısalt
    if (title.length > 60) {
      title = title.substring(0, 57) + '...'
    }
    // İlk harf büyük
    title = title.charAt(0).toUpperCase() + title.slice(1)
    return title
  }
  // İçeriği düzelt
  fixContent(original: string, keyword: string, issues: SeoIssue[], targetWordCount = 800): string {
    let content = original
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    const lowerKeyword = keyword.toLowerCase()
    // Yoğunluk düşükse ekle
    const densityIssue = issues.find(i => i.field === 'keyword_density' && i.message.includes('düşük'))
    if (densityIssue) {
      // İlk paragrafa ekle
      const firstParagraphEnd = content.indexOf('\n\n') > 0 ? content.indexOf('\n\n') : content.indexOf('. ') + 1
      if (!content.toLowerCase().substring(0, 200).includes(lowerKeyword)) {
        content = `${keyword} hakkında detaylı bilgi arıyorsan doğru yerdesin. ${content}`
      }
      // Orta ve sona ekle
      if (wordCount > 200) {
        const midPoint = Math.floor(content.length / 2)
        content = content.slice(0, midPoint) + ` ${keyword} ile ilgili en önemli nokta, kaliteli ve özgün olmasıdır. ` + content.slice(midPoint)
      }
    }
    // Yoğunluk yüksekse eş anlamlı kullan (basit)
    const highDensity = issues.find(i => i.field === 'keyword_density' && i.message.includes('yüksek'))
    if (highDensity) {
      // Her 3. keyword'ü eş anlamlı ile değiştir
      let count = 0
      content = content.replace(new RegExp(keyword, 'gi'), (match) => {
        count++
        if (count % 3 === 0) {
          return keyword + ' (alternatif)'
        }
        return match
      })
    }
    // İçerik kısa ise uzat
    if (wordCount < 300) {
      content += `\n\n## ${keyword} Nedir?\n\n${keyword}, günümüzde en çok aranan konulardan biridir. Kaliteli ${keyword} seçimi yaparken dikkat etmen gerekenler: özgünlük, kalite, ve kullanıcı deneyimi. ${keyword} ile ilgili detaylı rehberimizde, en iyi örnekleri ve ipuçlarını bulabilirsin.\n\n## Neden ${keyword} Önemli?\n\n${keyword} sayesinde daha iyi sonuçlar alabilirsin. Özellikle ${keyword} kullananlar, %30 daha fazla verim elde ediyor. ${keyword} ile ilgili en son trendleri takip etmek, seni bir adım öne çıkarır.\n\n## ${keyword} Nasıl Seçilir?\n\n1. **Kalite:** ${keyword} kaliteli olmalı\n2. **Özgünlük:** ${keyword} özgün olmalı\n3. **SEO Uyumu:** ${keyword} SEO uyumlu olmalı\n\nSonuç olarak, ${keyword} doğru kullanıldığında harika sonuçlar verir.`
    }
    // H2 yoksa ekle
    const h2Issue = issues.find(i => i.field === 'h2')
    if (h2Issue && !content.includes('## ')) {
      content += `\n\n## En İyi ${keyword} Örnekleri\n\nBurada ${keyword} ile ilgili en iyi örnekleri bulabilirsin.`
      content += `\n\n## ${keyword} Fiyatları ve Karşılaştırma\n\n${keyword} fiyatları, kalitesine göre değişir. En uygun ${keyword} için karşılaştırma yap.`
    }
    return content
  }
  // Meta description düzelt
  fixMeta(title: string, content: string, keyword: string, originalMeta?: string): string {
    let meta = originalMeta || ''
    if (!meta || meta.length < 120 || !meta.toLowerCase().includes(keyword.toLowerCase())) {
      // İçeriğin ilk 2 cümlesinden + keyword ile oluştur
      const firstSentences = content.split('. ').slice(0, 2).join('. ').substring(0, 120)
      meta = `${firstSentences} ${keyword} hakkında detaylı rehber. En iyi ${keyword} örnekleri burada!`.substring(0, 155)
    }
    if (meta.length > 160) {
      meta = meta.substring(0, 157) + '...'
    }
    return meta
  }
  // Ana fonksiyon - Laya raporuna göre düzelt
  fix(report: SeoAuditReport): SeoFixResult {
    const fixesApplied: string[] = []
    // Title düzelt
    const titleIssues = report.issues.filter(i => i.field === 'title')
    const fixedTitle = this.fixTitle(report.title, report.targetKeyword, titleIssues)
    if (fixedTitle !== report.title) {
      fixesApplied.push(`Başlık düzeltildi: "${report.title}" -> "${fixedTitle}"`)
    }
    // Content düzelt
    const contentIssues = report.issues.filter(i => ['keyword_density', 'content_length', 'h2'].includes(i.field))
    const fixedContent = this.fixContent(report.content, report.targetKeyword, contentIssues)
    if (fixedContent !== report.content) {
      fixesApplied.push(`İçerik düzeltildi: ${report.content.split(/\s+/).length} -> ${fixedContent.split(/\s+/).length} kelime, yoğunluk ayarlandı`)
    }
    // Meta düzelt
    const fixedMeta = this.fixMeta(fixedTitle, fixedContent, report.targetKeyword)
    fixesApplied.push(`Meta oluşturuldu: ${fixedMeta.length} karakter`)
    // Yeni skor hesapla (basit)
    const newScore = Math.min(95, report.score + fixesApplied.length * 8)
    return {
      originalTitle: report.title,
      fixedTitle,
      originalContent: report.content,
      fixedContent,
      fixedMeta,
      fixesApplied,
      newScore,
      report
    }
  }
  // Blog için otomatik
  fixBlog(title: string, content: string, keyword: string): SeoFixResult {
    const { layaSeo } = require('./layaSeo')
    const report = layaSeo.audit(content, title, keyword)
    return this.fix(report)
  }
  // Ürün açıklaması için otomatik
  fixProduct(title: string, description: string, keyword: string): SeoFixResult {
    const { layaSeo } = require('./layaSeo')
    const report = layaSeo.audit(description, title, keyword)
    // Ürün için daha kısa içerik hedefi
    const result = this.fix(report)
    // Ürün açıklamasını 300 kelimeye ayarla
    if (result.fixedContent.split(/\s+/).length > 400) {
      result.fixedContent = result.fixedContent.split(/\s+/).slice(0, 350).join(' ') + '...'
    }
    return result
  }
}
export const metaSeo = new MetaSeoFixer()
