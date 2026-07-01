import Field from './Field'
import { cx } from '../../lib/cx'

// Seleção única em "cards" (yes/no e variações). options: [{ value, label, hint? }]
export default function Choice({ label, value, onChange, options, error, help, required, columns }) {
  const cols = columns || (options.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')
  return (
    <Field label={label} required={required} help={help} error={error}>
      <div className={cx('grid grid-cols-1 gap-2', cols)}>
        {options.map((o) => {
          const active = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange?.(o.value)}
              className={cx(
                'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-all',
                active
                  ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-500/20 dark:bg-sky-500/10'
                  : 'border-stone-300 bg-white hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600',
              )}
            >
              <span
                className={cx(
                  'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors',
                  active ? 'border-sky-500' : 'border-stone-300 dark:border-stone-600',
                )}
              >
                {active && <span className="h-2 w-2 rounded-full bg-sky-500" />}
              </span>
              <span className="min-w-0">
                <span
                  className={cx(
                    'block text-sm font-medium',
                    active ? 'text-sky-700 dark:text-sky-300' : 'text-stone-700 dark:text-stone-200',
                  )}
                >
                  {o.label}
                </span>
                {o.hint && <span className="mt-0.5 block text-xs text-stone-400">{o.hint}</span>}
              </span>
            </button>
          )
        })}
      </div>
    </Field>
  )
}
