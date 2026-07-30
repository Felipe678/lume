import { randomUUID } from 'node:crypto'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from './models/User.js'
import { StateDoc } from './models/StateDoc.js'
import { makeRequireAuth, type AuthedRequest } from './middleware/requireAuth.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface AppConfig {
  jwtSecret: string
  corsOrigin: string
}

/** App Express sem listen — o index.ts sobe, os testes usam com supertest. */
export function buildApp({ jwtSecret, corsOrigin }: AppConfig) {
  const app = express()
  app.use(cors({ origin: corsOrigin }))
  app.use(express.json({ limit: '2mb' }))
  const requireAuth = makeRequireAuth(jwtSecret)

  const issueToken = (userId: string) => jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '30d' })

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'lume-server' })
  })

  app.post('/auth/register', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const password = String(req.body?.password ?? '')
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'E-mail inválido.' })
      return
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'A senha precisa de pelo menos 8 caracteres.' })
      return
    }
    if (await User.exists({ email })) {
      res.status(409).json({ error: 'Este e-mail já tem conta — tente entrar.' })
      return
    }
    const user = await User.create({
      _id: randomUUID(),
      email,
      passwordHash: await bcrypt.hash(password, 10),
    })
    res.status(201).json({ token: issueToken(user._id), userId: user._id, email: user.email })
  })

  app.post('/auth/login', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const password = String(req.body?.password ?? '')
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' })
      return
    }
    res.json({ token: issueToken(user._id), userId: user._id, email: user.email })
  })

  app.get('/state', requireAuth, async (req: AuthedRequest, res) => {
    const doc = await StateDoc.findOne({ userId: req.userId })
    if (!doc) {
      res.status(204).end()
      return
    }
    res.json({ data: doc.data, updatedAt: doc.updatedAt.toISOString() })
  })

  // Sync last-write-wins com detecção de conflito:
  // o cliente manda baseUpdatedAt (o updatedAt que ele conhecia); se o servidor
  // tem algo mais novo, devolve 409 com a versão do servidor e o cliente decide.
  app.put('/state', requireAuth, async (req: AuthedRequest, res) => {
    const { data, baseUpdatedAt } = req.body ?? {}
    if (typeof data !== 'object' || data === null) {
      res.status(400).json({ error: 'Corpo inválido: esperado { data, baseUpdatedAt }.' })
      return
    }
    const existing = await StateDoc.findOne({ userId: req.userId })
    if (existing) {
      const base = baseUpdatedAt ? new Date(String(baseUpdatedAt)).getTime() : 0
      if (existing.updatedAt.getTime() > base) {
        res.status(409).json({ data: existing.data, updatedAt: existing.updatedAt.toISOString() })
        return
      }
    }
    const updatedAt = new Date()
    await StateDoc.updateOne({ userId: req.userId }, { $set: { data, updatedAt } }, { upsert: true })
    res.json({ updatedAt: updatedAt.toISOString() })
  })

  return app
}
