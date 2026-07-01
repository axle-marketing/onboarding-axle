import PendingToggle from './PendingToggle'

// Bloco de campo com um toggle "Ainda não tenho". Quando marcado, esconde o
// input e mostra um aviso de pendência (não bloqueia o envio).
export default function PendingField({
  label,
  required,
  pending,
  onPendingChange,
  pendingLabel = 'Ainda não tenho',
  pendingNote = 'Marcado como pendência — a equipe acompanha isso com você depois.',
  help,
  children,
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </span>
        <PendingToggle checked={pending} onChange={onPendingChange} label={pendingLabel} />
      </div>
      {pending ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          {pendingNote}
        </p>
      ) : (
        <>
          {children}
          {help && <p className="text-xs text-stone-400">{help}</p>}
        </>
      )}
    </div>
  )
}
