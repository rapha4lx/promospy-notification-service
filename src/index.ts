import { createServer } from './api/server.js'


import accountsRouter from './api/routes/accounts.js'
// import groupsRouter from './api/routes/groups.js'

async function start(): Promise<void> {
  // const accounts = loadAccountsFromSessions()

  // console.log(`🔍 Encontradas ${accounts.length} contas`)
  
  // if (accounts.length === 0) {
  //   return
  // }


}

start()

const app = createServer()

app.use('/accounts', accountsRouter)
// app.use('/accounts', groupsRouter)

const PORT = 3001

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`)
})
