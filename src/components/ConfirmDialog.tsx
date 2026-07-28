import Modal from './Modal'

export interface ConfirmAction {
  label: string
  onClick: () => void
  variant?: 'danger' | 'primary' | 'neutral'
}

const variantClass: Record<NonNullable<ConfirmAction['variant']>, string> = {
  danger: 'bg-red-600/90 hover:bg-red-600 text-white',
  primary: 'bg-flame hover:bg-flame-deep text-ink font-semibold',
  neutral: 'bg-ink-3 hover:bg-ink-3/70 text-paper',
}

export default function ConfirmDialog({
  title,
  message,
  actions,
  onClose,
}: {
  title: string
  message: string
  actions: ConfirmAction[]
  onClose: () => void
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="mb-5 text-sm text-muted">{message}</p>
      <div className="flex flex-col gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${variantClass[a.variant ?? 'neutral']}`}
          >
            {a.label}
          </button>
        ))}
        <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm text-muted hover:text-paper">
          Cancelar
        </button>
      </div>
    </Modal>
  )
}
