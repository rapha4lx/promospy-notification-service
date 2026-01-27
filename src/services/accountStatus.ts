import { getAccountState } from '../config/accountState.js'

export interface AccountStatusResponse {
  status?: string
  qr?: string | null
  error?: string | null
  updatedAt?: number
}

export function getAccountStatus(accountId: string): AccountStatusResponse | null {
  return getAccountState(accountId)
}
