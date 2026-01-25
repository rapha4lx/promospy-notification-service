import { createServer } from './api/server.js'
import { loadAccountsFromSessions } from './config/loadAccounts.js'
import { createSocket } from './socket/createSocket.js'
import { registerSocket } from './config/socketRegistry.js'

import accountsRouter from './api/routes/accounts.js'
import groupsRouter from './api/routes/groups.js'

async function start(): Promise<void> {
  const accounts = loadAccountsFromSessions()

  if (accounts.length === 0) {
    console.log('⚠️ Nenhuma conta encontrada em /sessions')
    return
  }

  for (const account of accounts) {
    createSocket(account)
      .then(socket => {
        console.log(`Success login: ✅${account.id}`)
        registerSocket(account.id, socket)
      })
      .catch(err => {
        console.error(`Erro ao conectar ${account.id}`, err)
      })
  }
}

start()

const app = createServer()

app.use('/accounts', accountsRouter)
app.use('/accounts', groupsRouter)

const PORT = 3000

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`)
})
