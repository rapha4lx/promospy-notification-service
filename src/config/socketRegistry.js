// @ts-nocheck
/** @typedef {import('@whiskeysockets/baileys').WASocket} WASocket */

/** @type {Map<string, WASocket>} */
const sockets = new Map()

/** @type {Map<string, (socket: WASocket) => void>} */
const waiters = new Map()

/**
 * @param {string} accountId
 * @param {WASocket} socket
 */
export function registerSocket(accountId, socket) {
  sockets.set(accountId, socket)

  if (waiters.has(accountId)) {
    waiters.get(accountId)(socket)
    waiters.delete(accountId)
  }
}

export function getSocket(accountId) {
  return sockets.get(accountId)
}

/**
 * @param {string} accountId
 * @returns {Promise<WASocket>}
 */
export function waitForSocket(accountId) {
  const socket = sockets.get(accountId)
  if (socket) return Promise.resolve(socket)

  return new Promise(resolve => {
    waiters.set(accountId, resolve)
  })
}