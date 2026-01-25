import express, { type Express } from 'express'
import cors from 'cors'

export function createServer(): Express {
  const app = express()

  app.use(cors())
  app.use(express.json())

  return app
}
