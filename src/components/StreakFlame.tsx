import { useId } from 'react'

/** A chama do Lume — o coração da marca. Acesa quando o streak está vivo. */
export default function StreakFlame({ lit, size = 32 }: { lit: boolean; size?: number }) {
  const gradId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="12" y1="2" x2="12" y2="22">
          <stop stopColor="#fbbf24" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.8c.5 2.6.2 4.7-.7 6.4-.5-.9-1.2-1.6-2-2.1.2 1.9-.8 3.3-1.9 4.9-1 1.5-1.6 2.8-1.6 4.3 0 3.9 2.8 6.9 6.2 6.9s6.2-3 6.2-6.9c0-2.5-1.3-4.7-2.7-6.6C14.3 6.6 12.8 4.4 12 1.8Z"
        fill={lit ? `url(#${gradId})` : '#3f3a36'}
        className={lit ? 'drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]' : ''}
      />
      <path
        d="M12 12.5c.3 1.3.1 2.3-.4 3.2-.3-.4-.6-.8-1-1-.1 1-.9 1.9-.9 3 0 1.4 1 2.5 2.3 2.5s2.3-1.1 2.3-2.5c0-1.9-1.6-3.5-2.3-5.2Z"
        fill={lit ? '#fef3c7' : '#57534e'}
      />
    </svg>
  )
}
