import mongoose from 'mongoose'
import { env } from './env.js'
import { buildApp } from './app.js'

async function main() {
  await mongoose.connect(env.mongodbUri)
  console.log('[lume-server] MongoDB conectado')
  const app = buildApp({ jwtSecret: env.jwtSecret, corsOrigin: env.corsOrigin })
  app.listen(env.port, () => {
    console.log(`[lume-server] ouvindo em http://localhost:${env.port}`)
  })
}

main().catch((err) => {
  console.error('[lume-server] falha ao iniciar:', err)
  process.exit(1)
})
