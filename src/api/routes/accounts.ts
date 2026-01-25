import { Router, type Request, type Response } from 'express'
import { createAccount } from '../../services/accountManager.js'
import { getAccountStatus } from '../../services/accountStatus.js'
import { sendText } from '../../services/sender.js'

const router = Router()

interface SendTextBody {
  to: string
  text: string
}

router.post('/', async (req: Request, res: Response) => {
  const accountId = req.body?.accountId || `account_${Date.now()}`
  const result = await createAccount(accountId)
  res.status(201).json(result)
})

router.get('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const state = getAccountStatus(id)
  res.json(state)
})

router.post('/:id/send', async (req: Request<{ id: string }, unknown, SendTextBody>, res: Response) => {
  if (!req?.body) {
    return res.status(400).json({ error: 'body is null' })
  }

  const { to, text } = req.body

  if (!to || !text) {
    return res.status(400).json({ error: 'to e text são obrigatórios' })
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  await sendText({ accountId: id, to, text })

  return res.json({ success: true })
})

export default router
