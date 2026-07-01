import { useId } from 'react'
import Field from './Field'
import { inputBase, inputError } from './styles'
import { cx } from '../../lib/cx'

// options: [{ value, label }]
export default function Select({ label, value, onChange, options, placeholder = 'Selecione…', error, help, required }) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} required={required} help={help} error={error}>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        // colorScheme:'light' força o dropdown nativo a renderizar claro
        // mesmo com o SO em modo escuro — sem isso, o texto das <option>
        // (sempre escuro) fica ilegível num popup nativo escuro.
        style={{ colorScheme: 'light' }}
        className={cx(inputBase, 'cursor-pointer', !value && 'text-stone-400', error && inputError)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-stone-900">
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
