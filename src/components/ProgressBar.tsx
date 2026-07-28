export default function ProgressBar({
  fraction,
  color = '#f59e0b',
  className = '',
}: {
  /** 0..1 */
  fraction: number
  color?: string
  className?: string
}) {
  const pct = Math.round(Math.min(1, Math.max(0, fraction)) * 100)
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-ink-3 ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}
