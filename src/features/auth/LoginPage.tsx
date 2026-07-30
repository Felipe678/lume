import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Cloud, LogIn, UserPlus } from 'lucide-react'
import NavBar from '../../components/NavBar'
import StreakFlame from '../../components/StreakFlame'
import { apiFetch } from '../../lib/api'
import { selectAppState, useAppStore } from '../../store/useAppStore'
import { useAuth } from '../../store/useAuth'
import { adoptFromServer, forcePush, setBaseUpdatedAt } from '../../store/sync'

const inputClass = 'w-full rounded-lg bg-ink-3 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-flame'

interface AuthPayload {
  token: string
  userId: string
  email: string
  error?: string
}

interface StatePayload {
  data: unknown
  updatedAt: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuth((s) => s.setSession)
  const [tab, setTab] = useState<'entrar' | 'criar'>('entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [choice, setChoice] = useState<StatePayload | null>(null)

  const localHasData = () => {
    const s = selectAppState(useAppStore.getState())
    return s.goals.length > 0 || s.blocks.length > 0 || Object.keys(s.checkIns).length > 0
  }

  const submit = async () => {
    setError(null)
    if (!email.trim() || password.length < 8) {
      setError('Preencha o e-mail e uma senha de pelo menos 8 caracteres.')
      return
    }
    setBusy(true)
    try {
      const path = tab === 'entrar' ? '/auth/login' : '/auth/register'
      const res = await apiFetch<AuthPayload>(path, {
        method: 'POST',
        body: { email: email.trim(), password },
      })
      if (res.status !== 200 && res.status !== 201) {
        setError(res.body?.error ?? 'Não deu certo — tente de novo.')
        return
      }
      setSession({ token: res.body!.token, userId: res.body!.userId, email: res.body!.email })

      // primeira sincronização (edges 53–55)
      const remote = await apiFetch<StatePayload>('/state', { token: res.body!.token })
      if (remote.status === 204 || !remote.body) {
        if (localHasData()) await forcePush(null)
        else setBaseUpdatedAt(null)
        navigate('/')
        return
      }
      if (!localHasData()) {
        adoptFromServer(remote.body)
        navigate('/')
        return
      }
      // dados dos dois lados: o usuário decide — nunca mesclar sozinho
      setChoice(remote.body)
    } catch {
      setError('Não consegui falar com o servidor. Ele está rodando? (npm run dev:server)')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh">
      <NavBar />
      <main className="mx-auto max-w-sm p-4 pt-10">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <StreakFlame lit size={56} />
          <h1 className="text-xl font-bold">Sua conta Lume</h1>
          <p className="text-sm text-muted">
            Entre para sincronizar entre o tablet da parede e o celular. Sem conta, tudo continua
            funcionando só neste aparelho.
          </p>
        </div>

        <div className="mb-4 flex gap-1 rounded-full bg-ink-3 p-1">
          <button
            onClick={() => setTab('entrar')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold ${tab === 'entrar' ? 'bg-flame text-ink' : 'text-muted'}`}
          >
            <LogIn size={15} /> Entrar
          </button>
          <button
            onClick={() => setTab('criar')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold ${tab === 'criar' ? 'bg-flame text-ink' : 'text-muted'}`}
          >
            <UserPlus size={15} /> Criar conta
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            className={inputClass}
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            className={inputClass}
            placeholder="senha (mínimo 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={tab === 'entrar' ? 'current-password' : 'new-password'}
            onKeyDown={(e) => e.key === 'Enter' && void submit()}
          />
          {error && <p className="rounded-lg bg-red-950/50 p-3 text-xs text-red-300">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={busy}
            onClick={() => void submit()}
            className="rounded-full bg-flame py-2.5 text-sm font-bold text-ink disabled:opacity-50"
          >
            {busy ? 'Conectando…' : tab === 'entrar' ? 'Entrar' : 'Criar conta e sincronizar'}
          </motion.button>
        </div>
      </main>

      {choice && (
        <FirstSyncChoice
          onUseCloud={() => {
            try {
              localStorage.setItem(
                'lume:backup:pre-login',
                JSON.stringify(selectAppState(useAppStore.getState())),
              )
            } catch {
              // sem storage — segue
            }
            adoptFromServer(choice)
            setChoice(null)
            navigate('/')
          }}
          onUseLocal={async () => {
            await forcePush(choice.updatedAt) // base = versão atual do servidor ⇒ sobrescreve
            setChoice(null)
            navigate('/')
          }}
        />
      )}
    </div>
  )
}

/** Dados na nuvem E neste aparelho: o usuário escolhe — nunca mesclamos sozinhos (edge 55). */
function FirstSyncChoice({
  onUseCloud,
  onUseLocal,
}: {
  onUseCloud: () => void
  onUseLocal: () => void | Promise<void>
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-ink-3 bg-ink-2 p-7 text-center"
      >
        <Cloud className="mx-auto text-flame" size={40} />
        <h2 className="text-xl font-extrabold">Dois conjuntos de dados</h2>
        <p className="text-sm text-muted">
          Sua conta já tem dados na nuvem e este aparelho também tem dados locais. Qual dos dois vale?
          O outro será substituído (um backup local é mantido).
        </p>
        <button onClick={onUseCloud} className="rounded-full bg-flame px-6 py-3 text-sm font-bold text-ink">
          Usar os dados da nuvem
        </button>
        <button
          onClick={() => void onUseLocal()}
          className="rounded-full bg-ink-3 px-6 py-3 text-sm font-semibold text-paper"
        >
          Enviar os dados deste aparelho
        </button>
      </motion.div>
    </div>
  )
}
