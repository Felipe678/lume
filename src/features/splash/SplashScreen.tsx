import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toISODate } from '../../domain/dates'
import { useClock } from '../../store/useClock'
import { useFocusSession } from '../../store/useFocusSession'
import flameAnim from './flame.webp'

/** Paleta do fogo — tirada do próprio gif. */
const GOLD = ['#fbbf24', '#f59e0b', '#ea580c', '#ff9a3c']

const pick = () => GOLD[Math.floor(Math.random() * GOLD.length)]

/* ---------- brasas ambientes: pontos incandescentes que sobem tremulando ---------- */

interface Rising {
  left: number
  size: number
  color: string
  rise: number
  wob1: number
  wob2: number
  wob3: number
  duration: number
  delay: number
  peak: number
}

function makeRising(count: number): Rising[] {
  return Array.from({ length: count }, () => {
    // o expoente concentra os valores baixos: a base fica densa,
    // mas uma boa parte das brasas alcança o alto da tela
    const rise = 16 + Math.random() ** 1.5 * 92
    return {
      left: Math.random() * 100,
      size: 0.35 + Math.random() * 0.55,
      color: pick(),
      rise,
      // pontos de oscilação lateral — cada brasa desenha um caminho próprio
      wob1: (Math.random() - 0.5) * 6,
      wob2: (Math.random() - 0.5) * 9,
      wob3: (Math.random() - 0.5) * 12,
      duration: 2.2 + rise / 14 + Math.random() * 2,
      delay: Math.random() * 6,
      peak: 0.45 + Math.random() * 0.5,
    }
  })
}

function RisingParticles() {
  const parts = useMemo(() => makeRising(72), [])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}vw`,
            bottom: '-3vh',
            width: `${p.size}vmin`,
            height: `${p.size}vmin`,
            // brasa: núcleo claro que esfria pra cor do fogo e some
            background: `radial-gradient(circle, #fef3c7 0%, ${p.color} 45%, transparent 72%)`,
            mixBlendMode: 'screen',
          }}
          initial={{ opacity: 0 }}
          animate={{
            y: ['0vh', `-${p.rise * 0.35}vh`, `-${p.rise * 0.7}vh`, `-${p.rise}vh`],
            x: ['0vw', `${p.wob1}vw`, `${p.wob2}vw`, `${p.wob3}vw`],
            // acende, tremula no meio do caminho e apaga na subida
            opacity: [0, p.peak, p.peak * 0.45, p.peak * 0.8, 0],
            scale: [1, 0.9, 0.75, 0.45],
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            opacity: {
              repeat: Infinity,
              duration: p.duration,
              delay: p.delay,
              times: [0, 0.2, 0.5, 0.75, 1],
            },
          }}
        />
      ))}
    </div>
  )
}

/* ---------- explosão: física de partículas em canvas ---------- */

interface BurstState {
  cx: number
  cy: number
}

/**
 * Explosão com física de verdade, simulada em canvas: ~860 partículas com
 * velocidade inicial violenta + arrasto exponencial (a "pancada" acontece nos
 * primeiros 100ms), gravidade, turbulência, resfriamento de cor
 * (branco-quente → laranja → vermelho-escuro) e motion blur nos estilhaços.
 * Blending aditivo ('lighter'): onde a matéria se acumula, a luz estoura.
 */
function ExplosionCanvas({ cx, cy }: { cx: number; cy: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const W = window.innerWidth
    const H = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const vmax = Math.max(W, H) / 100
    const rnd = (a: number, b: number) => a + Math.random() * (b - a)

    // sprites de luz pré-renderizados, um por faixa de temperatura
    const sprite = (stops: Array<[number, string]>) => {
      const s = document.createElement('canvas')
      s.width = s.height = 64
      const c = s.getContext('2d')!
      const g = c.createRadialGradient(32, 32, 0, 32, 32, 32)
      for (const [o, col] of stops) g.addColorStop(o, col)
      c.fillStyle = g
      c.fillRect(0, 0, 64, 64)
      return s
    }
    const HOT = sprite([[0, 'rgba(255,244,214,1)'], [0.3, 'rgba(255,196,96,0.85)'], [1, 'rgba(255,130,20,0)']])
    const MID = sprite([[0, 'rgba(255,190,110,1)'], [0.4, 'rgba(249,115,22,0.8)'], [1, 'rgba(205,65,10,0)']])
    const COOL = sprite([[0, 'rgba(235,110,35,0.9)'], [0.45, 'rgba(190,65,15,0.55)'], [1, 'rgba(110,28,5,0)']])
    const SMOKE = sprite([[0, 'rgba(46,30,22,0.5)'], [0.5, 'rgba(36,25,19,0.28)'], [1, 'rgba(28,20,15,0)']])

    // jatos: numa explosão real a matéria não sai uniforme — aglomera em
    // direções aleatórias. Cada detonação sorteia seus próprios jatos.
    const jets = Array.from({ length: 6 + Math.floor(Math.random() * 3) }, () => ({
      a: Math.random() * Math.PI * 2,
      w: 0.4 + Math.random(),
      spread: 0.1 + Math.random() * 0.3,
    }))
    const totalW = jets.reduce((s, j) => s + j.w, 0)
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
    const sampleAngle = () => {
      if (Math.random() < 0.25) return Math.random() * Math.PI * 2
      let r = Math.random() * totalW
      for (const j of jets) {
        r -= j.w
        if (r <= 0) return j.a + gauss() * j.spread * 3
      }
      return jets[0].a
    }

    interface P {
      x: number; y: number; vx: number; vy: number
      age: number; life: number; size: number; grow: number
      kind: number; drag: number; grav: number; flick: number
      curl: number; heat: number
    }
    const parts: P[] = []
    const spawn = (
      kind: number, n: number,
      spMin: number, spMax: number,
      lifeMin: number, lifeMax: number,
      szMin: number, szMax: number,
      drag: number, grav: number,
    ) => {
      for (let i = 0; i < n; i++) {
        const a = sampleAngle()
        // expoente: maioria lenta, poucos fragmentos realmente violentos
        const sp = (spMin + (spMax - spMin) * Math.random() ** 1.4) * vmax
        parts.push({
          x: cx + Math.cos(a) * rnd(0, 2) * vmax,
          y: cy + Math.sin(a) * rnd(0, 2) * vmax,
          vx: Math.cos(a) * sp,
          // viés pra cima: explosão sobe, não espalha simétrica como fogos
          vy: Math.sin(a) * sp - rnd(0, 14) * vmax,
          // fumaça entra atrasada, quando o clarão já passou
          age: kind === 4 ? -rnd(0.15, 0.6) : 0,
          life: rnd(lifeMin, lifeMax),
          size: rnd(szMin, szMax) * vmax,
          grow: kind === 0 ? rnd(1.5, 2.8) : kind === 4 ? rnd(2.5, 4.5) : rnd(0.2, 0.6),
          kind,
          drag,
          grav: grav * vmax,
          flick: rnd(10, 30),
          curl: rnd(-1.4, 1.4),
          // temperatura acompanha a velocidade: só o mais rápido nasce branco
          heat: Math.min(1, sp / vmax / spMax),
        })
      }
    }
    spawn(0, 150, 25, 140, 0.45, 1.0, 3, 8, 6, -6) // bola de fogo que rola e sobe
    spawn(1, 320, 120, 430, 0.6, 1.3, 0.5, 1.1, 5, 34) // fragmentos rápidos
    spawn(2, 230, 60, 280, 1.2, 2.3, 0.7, 1.6, 4, 50) // brasas que caem queimando
    spawn(4, 55, 12, 45, 1.6, 2.8, 5, 11, 2.2, -16) // fumaça subindo atrás do fogo
    let shedBudget = 380 // micro-brasas que os fragmentos soltam no caminho

    let raf = 0
    // o relógio zera no PRIMEIRO callback do rAF — o timestamp dele pode ser
    // anterior a um performance.now() lido no setup, e tempo negativo aqui
    // vira raio negativo no arc() (exceção que mata o loop)
    let t0 = -1
    let last = 0
    const frame = (nowMs: number) => {
      if (t0 < 0) {
        t0 = nowMs
        last = nowMs
      }
      const dt = Math.min((nowMs - last) / 1000, 0.033)
      last = nowMs
      const t = (nowMs - t0) / 1000
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      // estouro de exposição: a tela "cega" por um instante
      if (t < 0.09) {
        ctx.globalAlpha = (1 - t / 0.09) * 0.7
        ctx.fillStyle = 'rgb(255,205,140)'
        ctx.fillRect(0, 0, W, H)
      }
      ctx.globalAlpha = 1

      let alive = 0
      for (const p of parts) {
        p.age += dt
        if (p.age >= p.life) continue
        alive++
        if (p.age < 0) continue // fumaça ainda não entrou
        const decay = Math.exp(-p.drag * dt)
        p.vx *= decay
        p.vy = p.vy * decay + p.grav * dt
        if (p.kind === 1 || p.kind === 2) {
          // curl: a trajetória curva, nada voa em linha reta até o fim
          const ca = Math.cos(p.curl * dt)
          const sa = Math.sin(p.curl * dt)
          const nvx = p.vx * ca - p.vy * sa
          p.vy = p.vx * sa + p.vy * ca
          p.vx = nvx
        }
        if (p.kind === 2) {
          // turbulência: brasa lenta não voa reto
          p.vx += rnd(-30, 30) * vmax * dt
          p.vy += rnd(-24, 18) * vmax * dt
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        // fragmento quente solta micro-brasas pelo caminho
        if (p.kind === 1 && shedBudget > 0 && p.age < p.life * 0.6 && Math.random() < dt * 12) {
          shedBudget--
          parts.push({
            x: p.x, y: p.y,
            vx: p.vx * 0.1 + rnd(-14, 14) * vmax,
            vy: p.vy * 0.1 + rnd(-10, 16) * vmax,
            age: 0, life: rnd(0.2, 0.55),
            size: rnd(0.35, 0.7) * vmax, grow: 0.3,
            kind: 3, drag: 3, grav: 40 * vmax, flick: rnd(14, 30),
            curl: 0, heat: 0.4,
          })
        }
        const u = p.age / p.life
        let alpha = (1 - u) * Math.min(1, p.age / 0.04)
        if (p.kind === 2 || p.kind === 3) alpha *= 0.72 + 0.28 * Math.sin(p.age * p.flick)
        // temperatura individual: só fragmento veloz passa pela fase branca
        const hotCut = 0.08 + p.heat * 0.3
        const midCut = 0.5 + p.heat * 0.2
        if (p.kind === 4) continue // fumaça desenha na segunda passada
        if (p.kind === 1) {
          // fragmento: risco do frame anterior até aqui = motion blur real
          alpha *= 0.85 + 0.15 * Math.sin(p.age * p.flick * 2)
          const col =
            u < hotCut && p.heat > 0.72
              ? 'rgba(255,238,200,'
              : u < midCut
                ? 'rgba(255,150,55,'
                : 'rgba(205,80,22,'
          ctx.strokeStyle = col + alpha.toFixed(3) + ')'
          ctx.lineWidth = p.size * 0.5
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
        } else {
          const img = u < hotCut && p.heat > 0.6 ? HOT : u < midCut ? MID : COOL
          const s = p.size * (1 + u * p.grow) * 2
          ctx.globalAlpha = alpha * (p.kind === 0 ? 0.6 : p.kind === 3 ? 0.85 : 1)
          ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s)
          ctx.globalAlpha = 1
        }
      }

      // segunda passada: fumaça por CIMA do fogo (oclui, não soma luz)
      ctx.globalCompositeOperation = 'source-over'
      for (const p of parts) {
        if (p.kind !== 4 || p.age < 0 || p.age >= p.life) continue
        const u = p.age / p.life
        const s = p.size * (1 + u * p.grow) * 2
        // entra devagar, sai devagar
        ctx.globalAlpha = Math.min(1, p.age / 0.5) * (1 - u) * 0.8
        ctx.drawImage(SMOKE, p.x - s / 2, p.y - s / 2, s, s)
      }
      ctx.globalAlpha = 1

      if (alive > 0 || t < 0.4) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [cx, cy])
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

/**
 * A chama: animação real de fogo (webp animado, render 3D) interpolada na tela —
 * mix-blend "screen" soma a luz sobre o preto (o fundo escuro do vídeo desaparece).
 * A máscara é redonda mas imperceptível: duas camadas radiais idênticas
 * intersectadas = decaimento quadrático, sem contorno visível. Ao redor, um halo
 * laranja-fogo pulsa devagar, nas cores do próprio gif.
 */
function LivingFlame({ size }: { size: number }) {
  const box = size * 2.3
  const featherR =
    'radial-gradient(ellipse 52% 52% at center, black 30%, rgba(0,0,0,0.72) 50%, rgba(0,0,0,0.32) 66%, transparent 82%)'
  const feather = `${featherR}, ${featherR}`
  return (
    <div className="relative" style={{ width: box, height: box }}>
      {/* halo pulsante: luz que o fogo joga no ambiente */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: box * 1.35,
          height: box * 1.35,
          x: '-50%',
          y: '-50%',
          background:
            'radial-gradient(circle, rgba(255,145,45,0.16) 0%, rgba(249,115,22,0.1) 26%, rgba(234,88,12,0.05) 46%, rgba(194,65,12,0.015) 62%, transparent 74%)',
        }}
        animate={{ opacity: [0.5, 1, 0.65, 1, 0.5], scale: [1, 1.07, 1.02, 1.09, 1] }}
        transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
      />
      <img
        src={flameAnim}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          mixBlendMode: 'screen',
          maskImage: feather,
          WebkitMaskImage: feather,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      />
    </div>
  )
}

/**
 * Ritual de abertura: fundo preto, fogo real, brasas subindo pela tela e o
 * convite para mais um dia. O clique acende o dia (persistido em useFocusSession)
 * e detona uma explosão que parte do centro do fogo e toma a tela inteira.
 */
export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [burst, setBurst] = useState<BurstState | null>(null)
  const fired = useRef(false)
  const flameRef = useRef<HTMLDivElement>(null)
  const bursting = burst !== null

  const ignite = () => {
    if (fired.current) return
    fired.current = true
    const { devOffsetMs } = useClock.getState()
    const now = new Date(Date.now() + devOffsetMs)
    useFocusSession.getState().startDay(toISODate(now), now.toISOString())
    // a explosão nasce do centro real da imagem do fogo
    const rect = flameRef.current?.getBoundingClientRect()
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
    setBurst({ cx, cy })
    window.setTimeout(onDone, 2100)
  }

  // DEV: ?boom dispara a explosão sozinho — permite inspecionar/screenshotar
  useEffect(() => {
    if (import.meta.env.DEV && window.location.search.includes('boom')) {
      const id = window.setTimeout(ignite, 600)
      return () => window.clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex cursor-pointer select-none flex-col items-center justify-center bg-black"
      onClick={ignite}
      // tremor de câmera: a pancada sacode a tela inteira
      animate={bursting ? { x: [0, -14, 11, -7, 4, -2, 0], y: [0, 9, -8, 5, -3, 1, 0] } : { x: 0, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="button"
      aria-label="Iniciar mais um dia"
    >
      <RisingParticles />

      <div className="relative flex flex-col items-center">
        <motion.div
          ref={flameRef}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={bursting ? { opacity: 0, scale: 1.35 } : { opacity: 1, scale: 1 }}
          transition={bursting ? { duration: 0.4, ease: 'easeOut' } : { duration: 1.4 }}
        >
          <LivingFlame size={150} />
        </motion.div>

        {/* pl compensa o tracking que sobra depois da última letra */}
        <motion.h1
          className="mt-[3vmin] pl-[0.45em] text-[5vmin] font-light uppercase tracking-[0.45em] text-paper"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: bursting ? 0 : 1, y: 0 }}
          transition={{ duration: bursting ? 0.3 : 1.2, delay: bursting ? 0 : 0.4 }}
        >
          Lume
        </motion.h1>
      </div>

      {/* explosão simulada em canvas, ancorada no centro do fogo */}
      {burst && <ExplosionCanvas cx={burst.cx} cy={burst.cy} />}

      <motion.p
        className="absolute bottom-[14vmin] text-[2.4vmin] text-muted"
        initial={{ opacity: 0 }}
        animate={bursting ? { opacity: 0 } : { opacity: [0.55, 1, 0.55], y: [0, -6, 0] }}
        transition={
          bursting
            ? { duration: 0.25 }
            : { repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.8 }
        }
      >
        Podemos iniciar mais um dia?
      </motion.p>
    </motion.div>
  )
}
