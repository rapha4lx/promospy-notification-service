import { createAccount } from '@/services/accounts/accounts.js'
import {
  getAccountStatus,
  listAccountsByUserId,
  accountExists
} from '@/config/accountRegistry.js'
import { Router, type Request, type Response } from 'express'
import { listGroups } from '@/services/groups/groups.js'

const router = Router()

interface SendTextBody {
  to: string
  text: string
}

/** Cria uma conta: body { userId (uuid), accountName } */
router.post('/', async (req: Request, res: Response) => {
  const userId = req.body?.userId
  const accountName = req.body?.accountName

  if (!userId || !accountName) {
    return res.status(400).json({ error: 'userId e accountName são obrigatórios' })
  }

  await createAccount(userId, accountName)
  return res.status(201).json({ success: true })
})

/**
 * GET /accounts?userId=uuid → lista todas as contas desse usuário (uuid).
 * GET /accounts?userId=uuid&accountName=nome → status da conta específica.
 */
router.get('/', (req: Request, res: Response) => {
  const userId = req.query?.userId as string | undefined
  const accountName = req.query?.accountName as string | undefined

  if (!userId) {
    return res.status(400).json({ error: 'userId (uuid do usuário) é obrigatório' })
  }

  if (accountName) {
    if (!accountExists(userId, accountName)) {
      return res.status(404).json({ error: 'conta não encontrada' })
    }
    const result = getAccountStatus(`${userId}:${accountName}`)
    return res.status(200).json(result)
  }

  const accounts = listAccountsByUserId(userId)
  return res.status(200).json({ accounts })
})

/**
 * GET /accounts/groups?userId=uuid&accountName=nome → lista os grupos dessa conta.
 * A conta precisa estar conectada.
 */
router.get('/groups', async (req: Request, res: Response) => {
  const userId = req.query?.userId as string | undefined
  const accountName = req.query?.accountName as string | undefined

  if (!userId || !accountName) {
    return res.status(400).json({ error: 'userId e accountName são obrigatórios' })
  }

  try {
    const groups = await listGroups(userId, accountName)
    return res.status(200).json({ groups })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'erro ao listar grupos'
    if (message.includes('não encontrada')) {
      return res.status(404).json({ error: message })
    }
    if (message.includes('não está conectada') || message.includes('não disponível')) {
      return res.status(409).json({ error: message })
    }
    return res.status(500).json({ error: message })
  }
})

router.post('/:id/send', async (req: Request<{ id: string }, unknown, SendTextBody>, res: Response) => {
  if (!req?.body) {
    return res.status(400).json({ error: 'body is null' })
  }

  const { to, text } = req.body

  if (!to || !text) {
    return res.status(400).json({ error: 'to e text são obrigatórios' })
  }

  // TODO: implementar sendText quando existir serviço de envio
  return res.status(501).json({ error: 'sendText não implementado' })
})

export default router
