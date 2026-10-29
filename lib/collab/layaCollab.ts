/**
 * Laya Collab Denetçisi - PondOS v24 Havuz Mantığı
 * Projede ne eksik? Vocal, enerji, danceability, drop?
 * Para yok, vesile oluyoruz!
 */
export type CollabReport = {
  fileName: string
  genre: string
  bpm: number
  key: string
  daw: string
  score: number // 0-100 collab skoru
  issues: CollabIssue[]
  checks: CollabCheck[]
  summary: string
  collabOpen: boolean
  needs: string[]
}
export type CollabIssue = {
  type: 'missing' | 'low' | 'good'
  field: 'vocal' | 'drums' | 'bass' | 'energy' | 'danceability' | 'drop' | 'melody' | 'mix'
  message: string
  current?: string | number
  expected?: string
  fix?: string
  icon: string
}
export type CollabCheck = {
  name: string
  status: 'has' | 'missing' | 'low'
  value: string
  icon: string
}
export class LayaCollabAuditor {
  // Laya gibi analiz et, ama collab için!
  audit(fileName: string, genre?: string, bpm?: number, key?: string, daw?: string, existingBranches?: string[]): CollabReport {
    const lower = fileName.toLowerCase()
    const issues: CollabIssue[] = []
    const checks: CollabCheck[] = []
    let score = 100
    const needs: string[] = []
    // Genre algıla
    let detectedGenre = genre || 'other'
    if (lower.includes('techno')) detectedGenre = 'techno'
    else if (lower.includes('trap')) detectedGenre = 'trap'
    else if (lower.includes('house')) detectedGenre = 'house'
    // 1. Vocal var mı?
    const hasVocal = lower.includes('vocal') || existingBranches?.includes('vocal')
    if (!hasVocal) {
      issues.push({
        type: 'missing',
        field: 'vocal',
        message: 'Vocal: Yok! %0, lazım!',
        current: '%0',
        expected: 'Vocal olmalı',
        fix: 'Vocal ekle, Adana Twins tarzı chop',
        icon: '🎤'
      })
      checks.push({ name: 'Vocal', status: 'missing', value: 'Yok %0', icon: '🎤' })
      needs.push('vocal')
      score -= 25
    } else {
      checks.push({ name: 'Vocal', status: 'has', value: 'Var %80', icon: '🎤' })
    }
    // 2. Enerji düşük mü?
    const hasEnergy = lower.includes('drop') || lower.includes('energetic') || lower.includes('peak')
    if (!hasEnergy) {
      issues.push({
        type: 'low',
        field: 'energy',
        message: 'Enerji: Düşük, 50%, drop lazım!',
        current: '50%',
        expected: '80%+ olmalı',
        fix: '45. saniyeye drop ekle, enerji yükselt',
        icon: '🔥'
      })
      checks.push({ name: 'Enerji', status: 'low', value: '50% Düşük', icon: '🔥' })
      needs.push('energy')
      score -= 15
    } else {
      checks.push({ name: 'Enerji', status: 'has', value: '80% İyi', icon: '🔥' })
    }
    // 3. Danceability düşük mü?
    const hasDance = lower.includes('hihat') || lower.includes('groove') || lower.includes('dance')
    if (!hasDance) {
      issues.push({
        type: 'low',
        field: 'danceability',
        message: 'Danceability: Düşük, hi-hat lazım!',
        current: '40%',
        expected: '70%+ olmalı',
        fix: 'Hi-hat ekle, groove ekle, danceability yükselt',
        icon: '💃'
      })
      checks.push({ name: 'Danceability', status: 'low', value: '40% Düşük', icon: '💃' })
      needs.push('danceability')
      score -= 15
    } else {
      checks.push({ name: 'Danceability', status: 'has', value: '70% İyi', icon: '💃' })
    }
    // 4. Drop var mı?
    const hasDrop = lower.includes('drop')
    if (!hasDrop) {
      issues.push({
        type: 'missing',
        field: 'drop',
        message: 'Drop: Yok, lazım!',
        current: 'Yok',
        expected: 'Drop olmalı, 45. saniyede',
        fix: 'Drop ekle, 45. saniyeye marker koy',
        icon: '💥'
      })
      checks.push({ name: 'Drop', status: 'missing', value: 'Yok', icon: '💥' })
      needs.push('drop')
      score -= 10
    } else {
      checks.push({ name: 'Drop', status: 'has', value: 'Var', icon: '💥' })
    }
    // 5. Bass var mı?
    const hasBass = lower.includes('bass') || existingBranches?.includes('bass')
    if (!hasBass) {
      issues.push({
        type: 'low',
        field: 'bass',
        message: 'Bass: Zayıf, güçlendir!',
        current: 'Zayıf',
        expected: 'Güçlü bass olmalı',
        fix: 'Bass ekle, sub bass güçlendir',
        icon: '🎸'
      })
      checks.push({ name: 'Bass', status: 'low', value: 'Zayıf', icon: '🎸' })
      needs.push('bass')
      score -= 5
    } else {
      checks.push({ name: 'Bass', status: 'has', value: 'Var', icon: '🎸' })
    }
    // 6. Drums var mı?
    const hasDrums = lower.includes('drum') || existingBranches?.includes('drums')
    if (!hasDrums) {
      issues.push({
        type: 'missing',
        field: 'drums',
        message: 'Drums: Yok, lazım!',
        current: 'Yok',
        expected: 'Drums olmalı',
        fix: 'Drums ekle, kick + snare',
        icon: '🥁'
      })
      checks.push({ name: 'Drums', status: 'missing', value: 'Yok', icon: '🥁' })
      needs.push('drums')
      score -= 10
    } else {
      checks.push({ name: 'Drums', status: 'has', value: 'Var', icon: '🥁' })
    }
    const collabOpen = score < 80
    let summary = ''
    if (score >= 90) summary = `Skor: ${score}/100 - Mükemmel! Collab tamamlandı!`
    else if (score >= 70) summary = `Skor: ${score}/100 - İyi, ama ${needs.join(', ')} eklenirse 90/100 olur!`
    else if (score >= 50) summary = `Skor: ${score}/100 - Orta, collab lazım! ${needs.join(', ')} lazım!`
    else summary = `Skor: ${score}/100 - Collab lazım! ${needs.join(', ')} yok!`
    // Öneri ekle
    if (!hasVocal && needs.includes('vocal')) {
      issues.push({
        type: 'good',
        field: 'vocal',
        message: 'Öneri: Vocal eklenirse 90/100 olur!',
        expected: 'Vocal ekle, 90/100',
        fix: 'Vocal ekle, havuza katkıda bulun',
        icon: '💡'
      })
    }
    return {
      fileName,
      genre: detectedGenre,
      bpm: bpm || 126,
      key: key || 'F#m',
      daw: daw || '【entity-Ableton¦canonical_name=Ableton】',
      score: Math.max(0, score),
      issues,
      checks,
      summary,
      collabOpen,
      needs
    }
  }
  // Toplu denetim
  auditBatch(files: { fileName: string, genre?: string }[]): CollabReport[] {
    return files.map(f => this.audit(f.fileName, f.genre))
  }
}
export const layaCollab = new LayaCollabAuditor()
