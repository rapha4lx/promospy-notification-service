import type { WASocket } from '@whiskeysockets/baileys'

const sockets = new Map<string, WASocket>()

type SocketWaiter = (socket: WASocket) => void
const waiters = new Map<string, SocketWaiter>()

export function registerSocket(accountId: string, socket: WASocket): void {
  sockets.set(accountId, socket)

  const waiter = waiters.get(accountId)
  if (waiter) {
    waiter(socket)
    waiters.delete(accountId)
  }
}

export function getSocket(accountId: string): WASocket | undefined {
  return sockets.get(accountId)
}

export function waitForSocket(accountId: string): Promise<WASocket> {
  const socket = sockets.get(accountId)
  if (socket) return Promise.resolve(socket)

  return new Promise<WASocket>(resolve => {
    waiters.set(accountId, resolve)
  })
}
