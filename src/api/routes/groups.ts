import { Router, type Request, type Response } from 'express'
import { listGroups } from '../../services/groups.js'

const router = Router()

router.get('/:id/groups', async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const groups = await listGroups(id)
  return res.json(groups)
})

export default router
