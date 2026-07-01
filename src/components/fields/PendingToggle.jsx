import { Check } from 'lucide-react'
import { cx } from '../../lib/cx'

// Botão "Ainda não tenho" — marca um item como pendência (não bloqueia o envio).
export default function PendingToggle({ checked, onChange, label = 'Ainda não tenho' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cx(
        'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
        checked
          ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-400'
          : 'border-stone-300 text-stone-500 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800',
      )}
    >
      <span
        className={cx(
          'grid h-3.5 w-3.5 place-items-center rounded border transition-colors',
          checked ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-400 dark:border-stone-500',
        )}
      >
        {checked && <Check size={10} />}
      </span>
      {label}
    </button>
  )
}
