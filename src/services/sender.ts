import { waitForSocket } from '../config/socketRegistry.js'

export interface SendTextParams {
  accountId: string
  to: string
  text: string
}

export async function sendText({ accountId, to, text }: SendTextParams): Promise<void> {
  const socket = await waitForSocket(accountId)

  if (!socket) {
    throw new Error(`Socket da conta ${accountId} não encontrado`)
  }

  const jid = to.includes('@')
    ? to
    : `${to}@s.whatsapp.net`

  await socket.sendMessage(jid, { text })
}
