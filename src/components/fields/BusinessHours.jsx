import { Copy } from 'lucide-react'
import { DAYS } from '../../state/draft'
import { useOnboarding } from '../../state/onboarding'
import { cx } from '../../lib/cx'
import { inputBase } from './styles'

// Grade de horário de funcionamento (um por dia): aberto/fechado, 24h, ou faixa.
export default function BusinessHours() {
  const { draft, set, merge } = useOnboarding()
  const hours = draft.gbp.hours

  // Copia a faixa de Seg para os outros dias úteis (conveniência).
  function copyMonToWeekdays() {
    const mon = hours.mon
    for (const id of ['tue', 'wed', 'thu', 'fri']) {
      merge(`gbp.hours.${id}`, { open: mon.open, close: mon.close, closed: mon.closed, is_24h: mon.is_24h })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          Horário de funcionamento
        </span>
        <button
          type="button"
          onClick={copyMonToWeekdays}
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          <Copy size={12} /> Copiar Seg → Sex
        </button>
      </div>

      <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
        {DAYS.map((d) => {
          const h = hours[d.id]
          const open = !h.closed
          return (
            <div key={d.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
              <span className="w-9 text-sm font-semibold text-stone-600 dark:text-stone-300">{d.label}</span>

              <button
                type="button"
                onClick={() => set(`gbp.hours.${d.id}.closed`, open)}
                className={cx(
                  'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors',
                  open
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-stone-300 bg-stone-50 text-stone-400 dark:border-stone-700 dark:bg-stone-800',
                )}
              >
                {open ? 'Aberto' : 'Fechado'}
              </button>

              {open && (
                <>
                  {h.is_24h ? (
                    <span className="text-sm text-stone-500 dark:text-stone-400">24 horas</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) => set(`gbp.hours.${d.id}.open`, e.target.value)}
                        className={cx(inputBase, 'w-auto px-2 py-1 text-sm')}
                      />
                      <span className="text-stone-400">–</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) => set(`gbp.hours.${d.id}.close`, e.target.value)}
                        className={cx(inputBase, 'w-auto px-2 py-1 text-sm')}
                      />
                    </div>
                  )}

                  <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <input
                      type="checkbox"
                      checked={h.is_24h}
                      onChange={(e) => set(`gbp.hours.${d.id}.is_24h`, e.target.checked)}
                      className="h-3.5 w-3.5 accent-sky-500"
                    />
                    24h
                  </label>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
