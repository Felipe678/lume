import { NavLink } from 'react-router'
import { CalendarDays, Flame, LayoutGrid, Plus, Target, Trophy } from 'lucide-react'
import { useOverlays } from '../store/useOverlays'

const links = [
  { to: '/', label: 'Home', Icon: LayoutGrid },
  { to: '/foco', label: 'Foco', Icon: Flame },
  { to: '/grade', label: 'Grade', Icon: CalendarDays },
  { to: '/objetivos', label: 'Objetivos', Icon: Target },
  { to: '/conquistas', label: 'Conquistas', Icon: Trophy },
]

export default function NavBar() {
  const openWizard = useOverlays((s) => s.openWizard)
  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-ink-3 bg-ink-2/60 px-4 py-2">
      <NavLink to="/" className="mr-3 flex shrink-0 items-center gap-1.5 text-lg font-bold tracking-tight">
        <Flame size={20} className="text-flame" fill="currentColor" />
        Lume
      </NavLink>
      {links.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              isActive ? 'bg-flame/15 text-flame' : 'text-muted hover:text-paper'
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
      <button
        onClick={openWizard}
        className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-flame px-3.5 py-1.5 text-sm font-semibold text-ink"
      >
        <Plus size={16} /> Objetivo
      </button>
    </nav>
  )
}
