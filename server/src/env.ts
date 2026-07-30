import 'dotenv/config'

/** Falha cedo e com mensagem clara quando faltar configuração (edge 61). */
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`[lume-server] Variável de ambiente ${name} ausente. Copie server/.env.example para server/.env e preencha.`)
    process.exit(1)
  }
  return value
}

export const env = {
  mongodbUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
