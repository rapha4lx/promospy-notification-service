export type AccountStatus = 'creating' | 'waiting_qr' | 'authenticated' | 'connected' | 'logged_out' | 'error'

interface AccountStateExtra {
  qr?: string
  error?: string
}

interface AccountState {
  status: AccountStatus
  qr: string | null
  error: string | null
  updatedAt: number
}

const states = new Map<string, AccountState>()

export function setAccountState(accountId: string, status: AccountStatus, extra: AccountStateExtra = {}): void {
  states.set(accountId, {
    status,
    qr: extra.qr ?? null,
    error: extra.error ?? null,
    updatedAt: Date.now()
  })
}

export function getAccountState(accountId: string): AccountState | null {
  return states.get(accountId) ?? null
}

export function listAccountStates(): Array<{ accountId: string } & AccountState> {
  return Array.from(states.entries()).map(([id, state]) => ({
    accountId: id,
    ...state
  }))
}
