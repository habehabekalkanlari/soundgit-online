/**
 * Chroma Hafıza Havuzu Popülasyon Scripti
 * Çalıştır: npx tsx lib/vector/populate.ts
 */
import { memoryPool } from './chromaPool'
async function main() {
  console.log('🧠 SoundGit Hafıza Havuzu oluşturuluyor...\n')
  await memoryPool.init()
  const memories = await memoryPool.populate()
  console.log('\n🔍 Test query: "knolli"')
  const res1 = await memoryPool.query('knolli')
  console.log(res1)
  console.log('\n🔍 Test query: "timeline akıyor"')
  const res2 = await memoryPool.query('timeline')
  console.log(res2)
  console.log('\n🔍 Test query: "daw"')
  const res3 = await memoryPool.query('daw')
  console.log(res3)
  console.log(`\n✅ Hafıza havuzu hazır! ${memories.length} item - Kod yazmadan, direkt hafıza!`)
}
main()
