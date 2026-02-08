import {
  getAccountSocket
} from '@/config/accountRegistry.js'

export interface GroupInfo {
  id: string
  subject: string
  subjectOwner?: string
  subjectTime?: number
  creation?: number
  owner?: string
  desc?: string
  participants: Array<{ id: string; rank?: string }>
  participantCount?: number
}

/**
 * Lista todos os grupos em que a conta participa.
 * Requer conta identificada por userId (uuid) e accountName.
 * Retorna erro se a conta não existir, não tiver socket ou não estiver conectada.
 */
export async function listGroups(userId: string, accountName: string): Promise<GroupInfo[]> {
  const accountKey = `${userId}:${accountName}`

  const socket = getAccountSocket(accountKey)
  if (!socket) {
    throw new Error('conta não encontrada')
  }

  await socket.waitForSocketOpen()

  const groups = await socket.groupFetchAllParticipating()
  console.log('groups', groups)


  return Object.values(groups)
}
