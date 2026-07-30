import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthedRequest extends Request {
  userId?: string
}

export function makeRequireAuth(jwtSecret: string) {
  return function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Não autenticado.' })
      return
    }
    try {
      const payload = jwt.verify(header.slice(7), jwtSecret) as { sub?: string }
      if (!payload.sub) throw new Error('sem sub')
      req.userId = payload.sub
      next()
    } catch {
      res.status(401).json({ error: 'Sessão inválida ou expirada.' })
    }
  }
}
