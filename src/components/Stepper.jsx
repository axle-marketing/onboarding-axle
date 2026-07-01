import { Check } from 'lucide-react'
import { cx } from '../lib/cx'

// Stepper responsivo: barra de progresso no mobile, trilha clicável no desktop.
export default function Stepper({ steps, current, onJump, invalid = [] }) {
  const pct = steps.length > 1 ? Math.round((current / (steps.length - 1)) * 100) : 0

  return (
    <div>
      {/* Mobile */}
      <div className="md:hidden">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-600 dark:text-stone-300">
            Passo {current + 1} de {steps.length}
          </span>
          <span className="truncate pl-2 text-stone-400">{steps[current].title}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden md:flex md:items-center">
        {steps.map((s, i) => {
          const done = i < current
          const isCurrent = i === current
          const hasError = invalid.includes(s.id) && !isCurrent
          return (
            <li key={s.id} className="flex flex-1 items-center last:flex-none">
              <button
                onClick={() => onJump?.(i)}
                className="group flex items-center gap-2"
                title={s.title}
              >
                <span
                  className={cx(
                    'grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold transition-colors',
                    isCurrent && 'bg-sky-500 text-white ring-4 ring-sky-500/20',
                    done && 'bg-sky-500 text-white',
                    !done && !isCurrent && 'bg-stone-200 text-stone-500 group-hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-400',
                    hasError && 'bg-rose-500 text-white',
                  )}
                >
                  {done ? <Check size={13} /> : i + 1}
                </span>
                <span
                  className={cx(
                    'whitespace-nowrap text-xs font-medium transition-colors',
                    isCurrent ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300',
                  )}
                >
                  {s.short}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span
                  className={cx(
                    'mx-2 h-px flex-1 transition-colors',
                    i < current ? 'bg-sky-400' : 'bg-stone-200 dark:bg-stone-800',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
