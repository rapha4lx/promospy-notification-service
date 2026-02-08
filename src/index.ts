import { createServer } from './api/server.js'
import { listAccountsFromSessions } from './config/accountRegistry.js'
import { createAccount } from './services/accounts/accounts.js'
import accountsRouter from './api/routes/accounts.js'
// import groupsRouter from './api/routes/groups.js'

async function start(): Promise<void> {
  const accounts = listAccountsFromSessions()
  console.log(`🔍 Encontradas ${accounts.length} conta(s) para carregar`)

  for (const { userId, accountName, accountKey } of accounts) {
    createAccount(userId, accountName)
      .then(() => console.log(`✅ Conta carregada: ${accountKey}`))
      .catch((err) => console.error(`❌ Erro ao carregar ${accountKey}:`, err))
  }
}

start()

const app = createServer()

app.use('/accounts', accountsRouter)
// app.use('/accounts', groupsRouter)

const PORT = 3001

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`)
})
