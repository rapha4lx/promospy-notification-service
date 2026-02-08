import fs from 'fs'
import path from 'path'
import { SESSIONS_DIR } from './sessions.js'
import type { WASocket } from '@whiskeysockets/baileys'

export type AccountStatus =
  | 'not_loaded'
  | 'loading'
  | 'waiting_qr'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'logged_out'

export interface AccountInfo {
  userId: string
  accountName: string
  accountKey: string
  status: AccountStatus
  qr?: string | null
  socket?: WASocket
  error?: string | null
}

const statusByAccount = new Map<string, { status: AccountStatus; qr?: string | null; error?: string | null; socket?: WASocket }>()

export function setAccountStatus(
  accountKey: string,
  status: AccountStatus,
  extra?: { qr?: string | null; error?: string | null; socket?: WASocket }
): void {
  const current = statusByAccount.get(accountKey) || { status: 'not_loaded' as AccountStatus }
  statusByAccount.set(accountKey, {
    ...current,
    status,
    ...(extra?.qr !== undefined && { qr: extra.qr }),
    ...(extra?.error !== undefined && { error: extra.error }),
    ...(extra?.socket !== undefined && { socket: extra.socket })
  })
}

export function getAccountStatus(accountKey: string): AccountInfo | null {
  const [userId, ...accountNameParts] = accountKey.split(':')
  const accountName = accountNameParts.join(':')
  if (!userId || !accountName) return null
  const data = statusByAccount.get(accountKey)
  return {
    userId,
    accountName,
    accountKey,
    status: data?.status ?? 'not_loaded',
    qr: data?.qr ?? null,
    error: data?.error ?? null
  }
}

export function getAccountSocket(accountKey: string): WASocket | null {
  const [userId, ...accountNameParts] = accountKey.split(':')
  const accountName = accountNameParts.join(':')
  if (!userId || !accountName) return null
  const data = statusByAccount.get(accountKey)
  return data?.socket as WASocket | null
}

/** Verifica se a conta existe (pasta de sessão ou registrada em memória). */
export function accountExists(userId: string, accountName: string): boolean {
  const accountKey = `${userId}:${accountName}`
  if (statusByAccount.has(accountKey)) return true
  const userPath = path.join(SESSIONS_DIR, userId, accountName)
  return fs.existsSync(userPath)
}

/**
 * Lista todas as contas de um usuário (uuid).
 * Inclui contas que estão na pasta de sessões (sessions/{userId}/{accountName})
 * e contas só em memória (ex.: status 'loading' ainda sem pasta).
 */
export function listAccountsByUserId(userId: string): AccountInfo[] {
  const byKey = new Map<string, AccountInfo>()
  const userPath = path.join(SESSIONS_DIR, userId)

  if (fs.existsSync(userPath)) {
    const accountNames = fs.readdirSync(userPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const accountName of accountNames) {
      const accountKey = `${userId}:${accountName}`
      const data = statusByAccount.get(accountKey)
      byKey.set(accountKey, {
        userId,
        accountName,
        accountKey,
        status: data?.status ?? 'not_loaded',
        qr: data?.qr ?? null,
        error: data?.error ?? null
      })
    }
  }

  for (const [accountKey, data] of statusByAccount) {
    const [uid, ...accountNameParts] = accountKey.split(':')
    if (uid !== userId) continue
    const accountName = accountNameParts.join(':')
    if (!accountName) continue
    if (!byKey.has(accountKey)) {
      byKey.set(accountKey, {
        userId: uid,
        accountName,
        accountKey,
        status: data.status,
        qr: data.qr ?? null,
        error: data.error ?? null
      })
    } else {
      const existing = byKey.get(accountKey)!
      existing.status = data.status
      existing.qr = data.qr ?? existing.qr
      existing.error = data.error ?? existing.error
    }
  }

  return Array.from(byKey.values())
}

/**
 * Lista todas as contas que existem na pasta de sessões (por userId/accountName).
 * Para cada uma, retorna o status atual (do registry ou 'not_loaded' se nunca foi carregada nesta execução).
 */
export function listAccountsFromSessions(): AccountInfo[] {
  const result: AccountInfo[] = []
  if (!fs.existsSync(SESSIONS_DIR)) return result

  const userIds = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const userId of userIds) {
    const userPath = path.join(SESSIONS_DIR, userId)
    const accountNames = fs.readdirSync(userPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const accountName of accountNames) {
      const accountKey = `${userId}:${accountName}`
      const data = statusByAccount.get(accountKey)
      result.push({
        userId,
        accountName,
        accountKey,
        status: data?.status ?? 'not_loaded',
        qr: data?.qr ?? null,
        error: data?.error ?? null
      })
    }
  }

  return result
}

/**
 * Retorna a lista de contas com status, incluindo contas que foram registradas
 * nesta execução mas ainda não têm pasta em sessions (ex.: loading).
 * Útil para ter uma visão única: sessões no disco + contas em memória.
 */
export function listAccountsWithStatus(): AccountInfo[] {
  const fromSessions = listAccountsFromSessions()
  const byKey = new Map(fromSessions.map(a => [a.accountKey, a]))

  for (const [accountKey, data] of statusByAccount) {
    if (byKey.has(accountKey)) {
      const existing = byKey.get(accountKey)!
      existing.status = data.status
      existing.qr = data.qr ?? existing.qr
      existing.error = data.error ?? existing.error
    } else {
      const [userId, ...accountNameParts] = accountKey.split(':')
      const accountName = accountNameParts.join(':')
      if (userId && accountName) {
        byKey.set(accountKey, {
          userId,
          accountName,
          accountKey,
          status: data.status,
          qr: data.qr ?? null,
          error: data.error ?? null
        })
      }
    }
  }

  return Array.from(byKey.values())
}
