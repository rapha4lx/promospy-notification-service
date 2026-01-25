import type { WASocket, proto } from '@whiskeysockets/baileys'

export interface HandleMessageParams {
  socket: WASocket
  msg: proto.IWebMessageInfo
  accountId: string
}

export async function handleMessage({ socket, msg, accountId }: HandleMessageParams): Promise<void> {
  const from = msg.key?.remoteJid
  if (!from) return

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text

  if (!text) return

  console.log(`📩 [${accountId}] ${from}: ${text}`)

  if (text === 'ping') {
    await socket.sendMessage(from, {
      text: `pong 🏓 (conta: ${accountId})`
    })
  }
}
