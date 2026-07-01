import { cx } from '../../lib/cx'

// Wrapper de campo: label + (ajuda | erro). Reutilizado por todos os inputs.
export default function Field({ label, htmlFor, required, help, error, children, className }) {
  return (
    <div className={cx('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      ) : help ? (
        <p className="text-xs text-stone-400">{help}</p>
      ) : null}
    </div>
  )
}
