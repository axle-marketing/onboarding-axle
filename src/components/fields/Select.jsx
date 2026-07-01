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
        className={cx(inputBase, 'cursor-pointer', !value && 'text-stone-400', error && inputError)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-stone-900">
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
