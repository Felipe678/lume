import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { buildApp } from './app.js'

let mongod: MongoMemoryServer
let app: ReturnType<typeof buildApp>

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  app = buildApp({ jwtSecret: 'segredo-de-teste', corsOrigin: '*' })
}, 120_000)

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

const credentials = { email: 'felipe@teste.com', password: 'senha-forte-123' }

describe('auth', () => {
  it('registra, recusa duplicado (409) e loga', async () => {
    const reg = await request(app).post('/auth/register').send(credentials)
    expect(reg.status).toBe(201)
    expect(reg.body.token).toBeTruthy()
    expect(reg.body.userId).toMatch(/[0-9a-f-]{36}/)

    const dup = await request(app).post('/auth/register').send(credentials)
    expect(dup.status).toBe(409)

    const login = await request(app).post('/auth/login').send(credentials)
    expect(login.status).toBe(200)
    expect(login.body.userId).toBe(reg.body.userId)
  })

  it('valida e-mail e senha curta (edge 49)', async () => {
    expect((await request(app).post('/auth/register').send({ email: 'x', password: 'senha-forte-123' })).status).toBe(400)
    expect((await request(app).post('/auth/register').send({ email: 'ok@ok.com', password: 'curta' })).status).toBe(400)
  })

  it('senha errada → 401; rota protegida sem token → 401', async () => {
    expect((await request(app).post('/auth/login').send({ ...credentials, password: 'errada-12345' })).status).toBe(401)
    expect((await request(app).get('/state')).status).toBe(401)
    expect((await request(app).get('/state').set('Authorization', 'Bearer lixo')).status).toBe(401)
  })
})

describe('state sync (LWW com conflito)', () => {
  let token: string
  const auth = () => ({ Authorization: `Bearer ${token}` })
  const stateA = { schemaVersion: 3, goals: [], blocks: [], checkIns: {}, rewards: [], profile: { name: 'A', avatarEmoji: '🔥' }, workSchedule: { mode: 'none' } }

  beforeAll(async () => {
    const login = await request(app).post('/auth/login').send(credentials)
    token = login.body.token
  })

  it('GET sem estado → 204; PUT inicial → 200; GET devolve', async () => {
    expect((await request(app).get('/state').set(auth())).status).toBe(204)

    const put = await request(app).put('/state').set(auth()).send({ data: stateA, baseUpdatedAt: null })
    expect(put.status).toBe(200)
    expect(put.body.updatedAt).toBeTruthy()

    const get = await request(app).get('/state').set(auth())
    expect(get.status).toBe(200)
    expect(get.body.data.profile.name).toBe('A')
  })

  it('PUT com baseUpdatedAt velho → 409 com a versão do servidor (edge 52)', async () => {
    const get = await request(app).get('/state').set(auth())
    const current = get.body.updatedAt

    // "outro aparelho" salva por cima
    const other = await request(app)
      .put('/state')
      .set(auth())
      .send({ data: { ...stateA, profile: { name: 'Tablet', avatarEmoji: '🔥' } }, baseUpdatedAt: current })
    expect(other.status).toBe(200)

    // este aparelho tenta salvar com a base antiga
    const stale = await request(app)
      .put('/state')
      .set(auth())
      .send({ data: { ...stateA, profile: { name: 'Celular', avatarEmoji: '🔥' } }, baseUpdatedAt: current })
    expect(stale.status).toBe(409)
    expect(stale.body.data.profile.name).toBe('Tablet')

    // com a base atualizada, passa
    const retry = await request(app)
      .put('/state')
      .set(auth())
      .send({ data: stale.body.data, baseUpdatedAt: stale.body.updatedAt })
    expect(retry.status).toBe(200)
  })

  it('PUT sem data → 400', async () => {
    expect((await request(app).put('/state').set(auth()).send({ baseUpdatedAt: null })).status).toBe(400)
  })

  it('estados são isolados por usuário (tenant)', async () => {
    const other = { email: 'outra@pessoa.com', password: 'outra-senha-123' }
    const reg = await request(app).post('/auth/register').send(other)
    const res = await request(app).get('/state').set('Authorization', `Bearer ${reg.body.token}`)
    expect(res.status).toBe(204) // não enxerga o estado do Felipe
  })
})
