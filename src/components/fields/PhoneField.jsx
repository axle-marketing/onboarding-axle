import { useId } from 'react'
import Field from './Field'
import { inputError } from './styles'
import { cx } from '../../lib/cx'

function formatNational(digits) {
  const d = digits.slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`
}

// Extrai só os 10 dígitos do número americano, ignorando o "1" do
// código de país se ele vier embutido (ex.: valor pré-preenchido de outro passo).
function digitsOnly(value) {
  let d = (value || '').replace(/\D/g, '')
  if (d.length > 10 && d.startsWith('1')) d = d.slice(1)
  return d.slice(0, 10)
}

// Telefone com código de país fixo (+1 US) e formatação (111) 111-1111
// enquanto o cliente digita. Guarda o valor completo (ex.: "+1 (617) 555-0148").
export default function PhoneField({
  label,
  value,
  onChange,
  error,
  help,
  required,
  placeholder = '(617) 555-0148',
}) {
  const id = useId()
  const display = formatNational(digitsOnly(value))

  function handleChange(e) {
    const digits = digitsOnly(e.target.value)
    onChange?.(digits ? `+1 ${formatNational(digits)}` : '')
  }

  return (
    <Field label={label} htmlFor={id} required={required} help={help} error={error}>
      <div
        className={cx(
          'flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/25 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100',
          error && inputError,
        )}
      >
        <span className="flex shrink-0 items-center gap-1 text-stone-500 dark:text-stone-400" aria-hidden>
          🇺🇸 +1
        </span>
        <span className="h-4 w-px shrink-0 bg-stone-300 dark:bg-stone-700" />
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={display}
          placeholder={placeholder}
          onChange={handleChange}
          className="w-full min-w-0 bg-transparent outline-none placeholder:text-stone-400"
        />
      </div>
    </Field>
  )
}
