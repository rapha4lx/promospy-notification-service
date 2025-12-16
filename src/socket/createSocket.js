import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
// @ts-ignore
} from '@whiskeysockets/baileys'
// @ts-ignore
import P from 'pino'

export async function createSocket({ id, sessionPath }) {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  return new Promise((resolve, reject) => {
    const socket = makeWASocket({
      auth: state,
      logger: P({ level: 'silent' })
    })

    socket.ev.on('creds.update', saveCreds)

    socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        console.log(`📱 [${id}] Escaneie o QR Code`)
      }

      if (connection === 'open') {
        console.log(`✅ [${id}] Conectado`)
        resolve(socket) // 🔑 GARANTIA
      }

      if (connection === 'close') {
        const statusCode =
          lastDisconnect?.error?.output?.statusCode

        if (statusCode !== DisconnectReason.loggedOut) {
          reject(new Error('Conexão fechada antes de abrir'))
        }
      }
    })
  })
}
