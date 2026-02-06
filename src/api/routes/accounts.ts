import { createAccount } from '@/services/accounts/accounts.js'
import { Router, type Request, type Response } from 'express'


const router = Router()

interface SendTextBody {
  to: string
  text: string
}

router.post('/', async (req: Request, res: Response) => {
  const userId = req.body?.userId
  const accountName = req.body?.accountName

  if (!userId || !accountName) {
    return res.status(400).json({ error: 'userId e accountName são obrigatórios' })
  }


  const account = await createAccount(userId, accountName)
  return res.status(201).json(account)
})

router.get('/', (req: Request, res: Response) => {
  const userId = req.query?.userId
  const accountName = req.query?.accountName

  if (!userId || !accountName) {
    return res.status(400).json({ error: 'userId e accountName são obrigatórios' })
  }

  const result = getAccountStatus(`${userId}:${accountName}`)

  if (!result) {
    return res.status(404).json({ error: 'conta não encontrada' })
  }

  return res.status(200).json(result)
})

router.post('/:id/send', async (req: Request<{ id: string }, unknown, SendTextBody>, res: Response) => {
  if (!req?.body) {
    return res.status(400).json({ error: 'body is null' })
  }

  const { to, text } = req.body

  if (!to || !text) {
    return res.status(400).json({ error: 'to e text são obrigatórios' })
  }

  const id = req.params.id
  await sendText({ accountId: id, to, text })

  return res.json({ success: true })
})

export default router
