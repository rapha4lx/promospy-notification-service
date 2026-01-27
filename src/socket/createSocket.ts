import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
  type ConnectionState,
  type BaileysEventMap
} from '@whiskeysockets/baileys'
import { setAccountState } from '../config/accountState.js'
import pino from 'pino'

export interface CreateSocketParams {
  id: string
  sessionPath: string
}

export async function createSocket({ id, sessionPath }: CreateSocketParams): Promise<WASocket> {
  setAccountState(id, 'creating')

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  return new Promise<WASocket>((resolve, reject) => {
    const socket = makeWASocket({
      auth: state,
      logger: pino({ level: 'info' })
    })

    socket.ev.on('creds.update', saveCreds)

    socket.ev.on('connection.update', (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect, qr, isNewLogin, receivedPendingNotifications } = update

      // Log detalhado para debug
      if (qr || connection || isNewLogin !== undefined) {
        console.log(`[${id}] Connection update:`, {
          connection,
          hasQR: !!qr,
          isNewLogin,
          receivedPendingNotifications
        })
      }

      if (qr) {
        setAccountState(id, 'waiting_qr', { qr })
      }

      if (connection === 'open') {
        console.log(`✅ Conectado: ${id}`)
        setAccountState(id, 'connected')
        resolve(socket)
      }

      if (connection === 'close') {
        const error = lastDisconnect?.error
        const statusCode = error && 'output' in error
          ? (error as { output?: { statusCode?: number } }).output?.statusCode
          : undefined

        if (statusCode === DisconnectReason.loggedOut) {
          console.log(`🚪 Desconectado (logged out): ${id}`)
          setAccountState(id, 'logged_out')
        } else {
          console.error(`❌ Erro de conexão: ${id}`, error)
          setAccountState(id, 'error', {
            error: 'connection_closed'
          })
          reject(new Error('Connection closed'))
        }
      }
    })

    socket.ev.on('messages.upsert', async (update: BaileysEventMap['messages.upsert']) => {
      const { type } = update
      if (type === 'notify') {
        // Handle messages here if needed
      }
    })
  })
}
