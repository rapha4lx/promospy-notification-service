import { getSocket } from '../config/socketRegistry.js'

export interface GroupInfo {
  id: string
  subject: string | undefined
  owner: string | undefined
  size: number
  creation: number | undefined
}

export async function listGroups(accountId: string): Promise<GroupInfo[]> {
  const socket = getSocket(accountId)

  if (!socket) {
    throw new Error(`Socket da conta ${accountId} não encontrado`)
  }

  const groups = await socket.groupFetchAllParticipating()

  return Object.values(groups).map(group => ({
    id: group.id,
    subject: group.subject,
    owner: group.owner,
    size: group.participants?.length ?? 0,
    creation: group.creation
  }))
}
