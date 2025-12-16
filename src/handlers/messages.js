export async function handleMessage({ socket, msg, accountId }) {
  const from = msg.key.remoteJid
  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text

  if (!text) return

  console.log(`📩 [${accountId}] ${from}: ${text}`)

  if (text === 'ping') {
    await socket.sendMessage(from, {
      text: `pong 🏓 (conta: ${accountId})`
    })
  }
}

