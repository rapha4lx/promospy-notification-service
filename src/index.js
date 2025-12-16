import { loadAccountsFromSessions } from './config/loadAccounts.js'
import { createSocket } from './socket/createSocket.js'
import { registerSocket, waitForSocket } from './config/socketRegistry.js'

async function start() {
  const accounts = loadAccountsFromSessions()

  if (accounts.length === 0) {
    console.log('⚠️ Nenhuma conta encontrada em /sessions')
    return 
  }
  
  console.log(accounts)
  // for (const account of accounts) {
  //   createSocket(account)
  //     .then(socket => {
  //       registerSocket(account.id, socket)
  //     })
  //     .catch(err => {
  //       console.error(`Erro ao conectar ${account.id}`, err)
  //     })
  // }
}

start()

