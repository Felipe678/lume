import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import NavBar from '../../components/NavBar'
import StreakFlame from '../../components/StreakFlame'
import WorkScheduleEditor from './WorkScheduleEditor'
import { selectAppState, useAppStore } from '../../store/useAppStore'
import { useNow } from '../../store/useClock'
import { computeStreak } from '../../domain/streak'
import { investedMinutes, longestStreak } from '../../domain/stats'
import { unlockedBadges } from '../../domain/achievements'
import { formatHours, toISODate } from '../../domain/dates'

const inputClass = 'rounded-lg bg-ink-3 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-flame'

export default function PerfilPage() {
  const now = useNow()
  const store = useAppStore()
  const setProfile = useAppStore((s) => s.setProfile)
  const state = useMemo(
    () => selectAppState(store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.goals, store.blocks, store.checkIns, store.rewards, store.profile],
  )
  const [name, setName] = useState(state.profile.name)
  const [avatarEmoji, setAvatarEmoji] = useState(state.profile.avatarEmoji)

  const today = toISODate(now)
  const streak = useMemo(() => computeStreak(state, today), [state, today])
  const longest = useMemo(() => Math.max(longestStreak(state), streak), [state, streak])
  const totalCheckIns = Object.keys(state.checkIns).length
  const totalHours = investedMinutes(state)
  const completedGoals = state.goals.filter((g) => g.completedAt).length
  const badges = unlockedBadges(state, now)

  const dirty = name !== state.profile.name || avatarEmoji !== state.profile.avatarEmoji

  const records = [
    { label: 'Sequência atual', value: `${streak} ${streak === 1 ? 'dia' : 'dias'}` },
    { label: 'Maior sequência', value: `${longest} ${longest === 1 ? 'dia' : 'dias'}` },
    { label: 'Check-ins', value: String(totalCheckIns) },
    { label: 'Horas investidas', value: formatHours(totalHours) },
    { label: 'Objetivos concluídos', value: String(completedGoals) },
    { label: 'Medalhas', value: String(badges.length) },
  ]

  return (
    <div className="min-h-dvh">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4">
        <h1 className="mb-4 text-xl font-bold">Perfil</h1>

        <section className="mb-6 flex items-center gap-4 rounded-2xl border border-ink-3 bg-ink-2/60 p-5">
          <motion.div
            className="flex size-20 items-center justify-center rounded-full bg-ink-3 text-4xl"
            whileTap={{ scale: 0.9 }}
          >
            {avatarEmoji || '🔥'}
          </motion.div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex gap-2">
              <input
                className={`${inputClass} w-16 text-center text-lg`}
                value={avatarEmoji}
                onChange={(e) => setAvatarEmoji(e.target.value)}
                maxLength={8}
                title="Emoji do avatar"
              />
              <input
                className={`${inputClass} flex-1`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Seu nome"
              />
            </div>
            {dirty && (
              <button
                onClick={() => setProfile({ name: name.trim(), avatarEmoji: avatarEmoji.trim() || '🔥' })}
                className="self-start rounded-full bg-flame px-4 py-1.5 text-xs font-bold text-ink"
              >
                Salvar perfil
              </button>
            )}
          </div>
          <div className="flex flex-col items-center">
            <StreakFlame lit={streak > 0} size={44} />
            <span className="text-lg font-bold tabular-nums">{streak}</span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {records.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-ink-3 bg-ink-2/60 p-4"
            >
              <div className="text-2xl font-extrabold tabular-nums">{r.value}</div>
              <div className="mt-0.5 text-xs text-muted">{r.label}</div>
            </motion.div>
          ))}
        </section>

        <WorkScheduleEditor />
      </main>
    </div>
  )
}
