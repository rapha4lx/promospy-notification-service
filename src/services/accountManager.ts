import fs from 'fs'
import path from 'path'
import { createSocket } from '../socket/createSocket.js'
import { registerSocket } from '../config/socketRegistry.js'
import { getAccountState } from '../config/accountState.js'

const SESSIONS_DIR = path.resolve('sessions')

export interface CreateAccountResult {
  accountKey: string
  state: ReturnType<typeof getAccountState>
}

export async function createAccount(userId: string, accountName: string): Promise<CreateAccountResult> {
  const accountKey = `${userId}:${accountName}`
  
  const sessionPath = path.join(SESSIONS_DIR, accountKey)

  // Verifica se já existem credenciais
  const credsPath = path.join(sessionPath, 'creds.json')
  const hasExistingCreds = fs.existsSync(credsPath)

  fs.mkdirSync(sessionPath, { recursive: true })

  console.log(`🔧 Criando socket para ${accountKey} (credenciais existentes: ${hasExistingCreds})`)

  createSocket({ id: accountKey, sessionPath })
    .then(socket => {
      console.log(`✅ Socket registrado para ${accountKey}`)
      registerSocket(accountKey, socket)
    })
    .catch((err) => {
      console.error(`❌ Erro ao criar socket para ${accountKey}:`, err)
      // estado já tratado no createSocket
    })

  // Aguarda um pouco para o estado ser atualizado (especialmente para QR code)
  await new Promise(resolve => setTimeout(resolve, 500))

  return {
    accountKey,
    state: getAccountState(accountKey)
  }
}
