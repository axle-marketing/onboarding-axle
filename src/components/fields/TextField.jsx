import { useId } from 'react'
import Field from './Field'
import { inputBase, inputError } from './styles'
import { cx } from '../../lib/cx'

export default function TextField({
  label,
  value,
  onChange,
  error,
  help,
  required,
  type = 'text',
  placeholder,
  inputMode,
  autoComplete,
  disabled,
  onBlur,
}) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} required={required} help={help} error={error}>
      <input
        id={id}
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        disabled={disabled}
        onBlur={onBlur}
        onChange={(e) => onChange?.(e.target.value)}
        className={cx(inputBase, error && inputError)}
      />
    </Field>
  )
}
