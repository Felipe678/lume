import { NavLink } from 'react-router'
import { CalendarDays, Flame, Target } from 'lucide-react'

const links = [
  { to: '/', label: 'Painel', Icon: Flame },
  { to: '/grade', label: 'Grade', Icon: CalendarDays },
  { to: '/objetivos', label: 'Objetivos', Icon: Target },
]

export default function NavBar() {
  return (
    <nav className="flex items-center gap-1 border-b border-ink-3 bg-ink-2/60 px-4 py-2">
      <span className="mr-3 flex items-center gap-1.5 text-lg font-bold tracking-tight">
        <Flame size={20} className="text-flame" fill="currentColor" />
        Lume
      </span>
      {links.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              isActive ? 'bg-flame/15 text-flame' : 'text-muted hover:text-paper'
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
