import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import Field from './Field'
import { inputBase, inputError } from './styles'
import { cx } from '../../lib/cx'

// Dropdown 100% próprio (não usa <select> nativo). O popup nativo do
// navegador renderiza fora do controle do CSS/tema e, com listas longas,
// pode "vazar" um retângulo claro por cima do conteúdo abaixo dele —
// esse componente evita o problema de vez, sempre no tema certo.
// options: [{ value, label }]
export default function Select({ label, value, onChange, options, placeholder = 'Selecione…', error, help, required }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <Field label={label} htmlFor={id} required={required} help={help} error={error}>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setOpen((o) => !o)}
          className={cx(
            inputBase,
            'flex cursor-pointer items-center justify-between gap-2 text-left',
            !selected && 'text-stone-400',
            error && inputError,
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronDown
            size={16}
            className={cx('shrink-0 text-stone-400 transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto scrollbar-thin rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange?.(o.value)
                  setOpen(false)
                }}
                className={cx(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm',
                  o.value === value
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                    : 'text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800',
                )}
              >
                <span className="truncate">{o.label}</span>
                {o.value === value && <Check size={14} className="shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </Field>
  )
}
