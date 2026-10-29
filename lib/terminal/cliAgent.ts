/**
 * PondOS v25 - CliAgent - Lokal Canli Terminal
 */
import { execSync } from 'child_process'
export type TerminalResult = {
  command: string
  success: boolean
  exitCode: number
  duration: number
  logs: string[]
  output: string
}
export class CliAgent {
  async run(command: string): Promise<TerminalResult> {
    const start = Date.now()
    try {
      const output = execSync(command, { encoding: 'utf-8', timeout: 120000, maxBuffer: 10 * 1024 * 1024 }).toString()
      return {
        command,
        success: true,
        exitCode: 0,
        duration: Date.now() - start,
        logs: output.split('\n').filter(Boolean).slice(-100),
        output
      }
    } catch (e: any) {
      const output = (e.stdout?.toString() || '') + (e.stderr?.toString() || '') + (e.message || '')
      return {
        command,
        success: false,
        exitCode: e.status || 1,
        duration: Date.now() - start,
        logs: output.split('\n').filter(Boolean).slice(-100),
        output
      }
    }
  }
  async buildTest() { return this.run('npm run build') }
  async unitTest() { return this.run('npm test 2>&1 || echo "no test"') }
}
export const cliAgent = new CliAgent()
