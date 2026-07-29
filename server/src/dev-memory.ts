import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { buildApp } from './app.js'

/**
 * Sobe a API com MongoDB EM MEMÓRIA — zero configuração, dados somem ao parar.
 * Útil para testar o fluxo de conta/sync sem criar o cluster no Atlas.
 * Uso: npm run dev:memory (na pasta server) — depois configure o Atlas no .env.
 */
async function main() {
  const mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  console.log('[lume-server] MongoDB EM MEMÓRIA (dados temporários!)')
  const app = buildApp({ jwtSecret: 'dev-memory-secret', corsOrigin: '*' })
  const port = Number(process.env.PORT ?? 4000)
  app.listen(port, () => console.log(`[lume-server] ouvindo em http://localhost:${port}`))
}

main().catch((err) => {
  console.error('[lume-server] falha ao iniciar:', err)
  process.exit(1)
})
