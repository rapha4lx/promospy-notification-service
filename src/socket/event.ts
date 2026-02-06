import type { WASocket, ConnectionState } from '@whiskeysockets/baileys'
import { DisconnectReason } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'

interface ReconnectOptions {
    userId: string
    accountName: string
    reconnectFn: () => Promise<{ socket: WASocket, saveCreds: any }>
}

let reconnectAttempts = new Map<string, number>()
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_BASE = 5000 // 5 segundos

export async function handleEvents(
    socket: WASocket, 
    saveCreds: any,
    options?: ReconnectOptions
): Promise<void> {
    const accountKey = options ? `${options.userId}:${options.accountName}` : 'unknown'
    
    socket.ev.on('creds.update', saveCreds)

    socket.ev.on("messages.upsert", async ({ messages, type }) => {
        console.log('messages.upsert', messages, type)
    })

    socket.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;
        console.log(`[${accountKey}] connection.update:`, { connection, hasQR: !!qr })

        if (qr) {
            console.log(`[${accountKey}] 📱 QR Code gerado:`)
            qrcode.generate(qr, { small: true }, (qr) => {
                console.log(qr)
            });
        }
        
        if (connection === "open") {
            console.log(`[${accountKey}] ✅ Conexão aberta`)
            // Reset contador de tentativas quando conecta
            reconnectAttempts.set(accountKey, 0)
        }

        if (connection === "close") {
            const error = lastDisconnect?.error
            const statusCode = error && 'output' in error
                ? (error as { output?: { statusCode?: number } }).output?.statusCode
                : undefined

            console.log(`[${accountKey}] 🔌 Conexão fechada. Status code: ${statusCode}`)

            // Verifica se deve tentar reconectar
            if (shouldReconnect(statusCode) && options) {
                await attemptReconnect(accountKey, options, statusCode)
            } else if (!shouldReconnect(statusCode)) {
                console.log(`[${accountKey}] ❌ Não será possível reconectar (código: ${statusCode})`)
            }
        }
    })
}

function shouldReconnect(statusCode?: number): boolean {
    if (statusCode === undefined) return true

    // Códigos que NÃO devem tentar reconectar
    const nonRecoverableReasons = [
        DisconnectReason.loggedOut,
        DisconnectReason.badSession,
        DisconnectReason.multideviceMismatch
    ]

    return !nonRecoverableReasons.includes(statusCode)
}

async function attemptReconnect(
    accountKey: string, 
    options: ReconnectOptions,
    statusCode?: number
): Promise<void> {
    const attempts = reconnectAttempts.get(accountKey) || 0

    if (attempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error(`[${accountKey}] ❌ Máximo de tentativas de reconexão atingido (${MAX_RECONNECT_ATTEMPTS})`)
        return
    }

    const delay = RECONNECT_DELAY_BASE * Math.pow(2, attempts) // Backoff exponencial
    reconnectAttempts.set(accountKey, attempts + 1)

    console.log(`[${accountKey}] 🔄 Tentando reconectar em ${delay / 1000}s... (tentativa ${attempts + 1}/${MAX_RECONNECT_ATTEMPTS})`)

    setTimeout(async () => {
        try {
            console.log(`[${accountKey}] 🔄 Iniciando reconexão...`)
            const { socket: newSocket, saveCreds: newSaveCreds } = await options.reconnectFn()
            console.log(`[${accountKey}] ✅ Reconexão bem-sucedida!`)
            
            // Reconfigura os eventos no novo socket
            await handleEvents(newSocket, newSaveCreds, options)
        } catch (error) {
            console.error(`[${accountKey}] ❌ Erro na reconexão:`, error)
            // Tenta novamente se ainda não atingiu o máximo
            if (attempts + 1 < MAX_RECONNECT_ATTEMPTS) {
                await attemptReconnect(accountKey, options, statusCode)
            }
        }
    }, delay)
}