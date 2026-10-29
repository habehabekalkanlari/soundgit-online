/**
 * PondOS v25 - Self Healing
 */
import { cliAgent, TerminalResult } from './cliAgent'
export type HealingReport = {
  command: string
  success: boolean
  logs: string[]
  criticalCount: number
  warningCount: number
  errors: { file?: string, line?: number, message: string, criticality: string }[]
  fixes: { file: string, action: string, healed: boolean, suggestion?: string }[]
  summary: string
}
export class SelfHealingAgent {
  private layaAnalyze(log: string) {
    const lower = log.toLowerCase()
    let criticality: 'critical' | 'warning' | 'info' | 'success' = 'info'
    let score = 0
    if (lower.includes('error') || lower.includes('failed') || lower.includes('cannot') || lower.includes('module not found')) {
      criticality = 'critical'; score = 90
    } else if (lower.includes('warning') || lower.includes('warn')) {
      criticality = 'warning'; score = 50
    } else if (lower.includes('compiled successfully') || lower.includes('ready')) {
      criticality = 'success'; score = 0
    }
    const fileMatch = log.match(/(app|lib|components)\/[^\s:]+\.(ts|tsx|js|jsx)/)
    const lineMatch = log.match(/:(\d+):(\d+)/)
    return { criticality, score, file: fileMatch?.[0], line: lineMatch ? parseInt(lineMatch[1]) : undefined }
  }
  private pandasParse(logs: string[]) {
    const parsed = logs.map((log, index) => {
      const analysis = this.layaAnalyze(log)
      return { index, log: log.substring(0, 300), ...analysis }
    })
    const critical = parsed.filter(p => p.criticality === 'critical')
    const warnings = parsed.filter(p => p.criticality === 'warning')
    return { total: parsed.length, critical: critical.length, warnings: warnings.length, criticalLogs: critical, all: parsed }
  }
  async runWithHealing(command: string): Promise<HealingReport> {
    const result: TerminalResult = await cliAgent.run(command)
    const parsed = this.pandasParse(result.logs)
    const errors = parsed.criticalLogs.map(c => ({ file: c.file, line: c.line, message: c.log, criticality: c.criticality }))
    const summary = result.success 
      ? `Basarili - ${parsed.total} log, ${parsed.critical} kritik, ${parsed.warnings} uyari, ${result.duration}ms`
      : `Basarisiz - ${parsed.critical} kritik hata`
    return {
      command, success: result.success, logs: result.logs,
      criticalCount: parsed.critical, warningCount: parsed.warnings,
      errors, fixes: [], summary
    }
  }
  async buildTest(): Promise<HealingReport> { return this.runWithHealing('npm run build') }
}
export const selfHealingAgent = new SelfHealingAgent()
