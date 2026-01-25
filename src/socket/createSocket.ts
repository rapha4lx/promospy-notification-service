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
      logger: pino({ level: 'silent' })
    })

    socket.ev.on('creds.update', saveCreds)

    socket.ev.on('connection.update', (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        setAccountState(id, 'waiting_qr', { qr })
      }

      if (connection === 'open') {
        setAccountState(id, 'connected')
        resolve(socket)
      }

      if (connection === 'close') {
        const error = lastDisconnect?.error
        const statusCode = error && 'output' in error
          ? (error as { output?: { statusCode?: number } }).output?.statusCode
          : undefined

        if (statusCode === DisconnectReason.loggedOut) {
          setAccountState(id, 'logged_out')
        } else {
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
