import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/** Donut ("pizza") de progresso — mesmo para anel do dia, objetivos e detalhe. */
export default function DonutChart({
  fraction,
  color = '#f59e0b',
  size = 72,
  thickness = 7,
  children,
}: {
  /** 0..1 */
  fraction: number
  color?: string
  size?: number
  thickness?: number
  children?: ReactNode
}) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, fraction))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#292524" strokeWidth={thickness} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  )
}
