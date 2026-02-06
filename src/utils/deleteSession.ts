import fs from 'fs'

/**
 * Deleta a sessão (pasta completa) de uma conta
 * @param sessionPath Caminho completo da pasta da sessão
 */
export function deleteSession(sessionPath: string): void {
  try {
    if (fs.existsSync(sessionPath)) {
      console.log(`🗑️  Deletando sessão: ${sessionPath}`)
      fs.rmSync(sessionPath, { recursive: true, force: true })
      console.log(`✅ Sessão deletada com sucesso: ${sessionPath}`)
    } else {
      console.warn(`⚠️  Sessão não encontrada para deletar: ${sessionPath}`)
    }
  } catch (error) {
    console.error(`❌ Erro ao deletar sessão ${sessionPath}:`, error)
    throw error
  }
}
