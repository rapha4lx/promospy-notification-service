import fs from 'fs'
import path from 'path'
import { SESSIONS_DIR } from '@/config/sessions.js'
import { removeAccount } from '@/config/accountRegistry.js'
import { clearReconnectAttempts } from '@/socket/event.js'

/**
 * Deleta a sessão (pasta completa) de uma conta
 * @param accountKey Caminho completo da pasta da sessão
 */
export function deleteSession(accountKey: string): void {
  try {
    const [userId, accountName] = accountKey.split(':')
    const sessionPath = path.join(SESSIONS_DIR, userId, accountName)
  
    if (fs.existsSync(sessionPath)) {
      console.log(`🗑️  Deletando sessão: ${sessionPath}`)
      fs.rmSync(sessionPath, { recursive: true, force: true })
      removeAccount(accountKey)
      clearReconnectAttempts(accountKey)
      console.log(`✅ Sessão deletada com sucesso: ${sessionPath}`)
    } else {
      console.warn(`⚠️  Sessão não encontrada para deletar: ${sessionPath}`)
    }
  } catch (error) {
    console.error(`❌ Erro ao deletar sessão ${accountKey}:`, error)
    throw error
  }
}
