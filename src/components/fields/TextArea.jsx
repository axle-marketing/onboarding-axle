import { useId } from 'react'
import Field from './Field'
import { inputBase, inputError } from './styles'
import { cx } from '../../lib/cx'

export default function TextArea({ label, value, onChange, error, help, required, placeholder, rows = 3 }) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} required={required} help={help} error={error}>
      <textarea
        id={id}
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={cx(inputBase, 'resize-y leading-relaxed', error && inputError)}
      />
    </Field>
  )
}
