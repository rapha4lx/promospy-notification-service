import {
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    makeWASocket
} from '@whiskeysockets/baileys'
import path from 'path'
import pino from 'pino'
import { handleEvents } from '@/socket/event.js'

import type { WASocket } from '@whiskeysockets/baileys'

async function createSocket(userId: string, accountName: string): Promise<{ socket: WASocket, saveCreds: any }> {
    const { state, saveCreds } = await useMultiFileAuthState(path.join('sessions', userId, accountName))
    const { version, isLatest } = await fetchLatestBaileysVersion()

    if (!isLatest) {
        console.error('Versão do Baileys não é a mais recente')
        throw new Error('Versão do Baileys não é a mais recente')
    }

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys)
        },
        generateHighQualityLinkPreview: true,
        logger: pino({ level: 'info' })
    })

    return { socket: sock, saveCreds }
}

export async function createAccount(userId: string, accountName: string): Promise<WASocket> {
    const { socket: sock, saveCreds } = await createSocket(userId, accountName)
    
    // Função de reconexão
    const reconnectFn = async () => {
        return await createSocket(userId, accountName)
    }

    await handleEvents(sock, saveCreds, {
        userId,
        accountName,
        reconnectFn
    })

    return sock
}



