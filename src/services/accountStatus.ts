import { getAccountState } from '../config/accountState.js'

export interface AccountStatusResponse {
  status?: string
  qr?: string | null
  error?: string | null
  updatedAt?: number
}

export function getAccountStatus(accountId: string): AccountStatusResponse {
  const state = getAccountState(accountId)

  if (!state) {
    return {
      status: 'not_found'
    }
  }

  return state
}
