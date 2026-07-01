import { useId } from 'react'
import Field from './Field'

// Usuário de e-mail com domínio fixo (ex.: @gmail.com) numa caixinha
// separada e estática, pra deixar claro que só o usuário vai naquele campo.
export default function EmailHandleField({ label, value, onChange, domain = '@gmail.com', placeholder, help }) {
  const id = useId()

  function handleChange(e) {
    // Se o cliente colar o e-mail inteiro, mantém só a parte antes do @.
    onChange?.(e.target.value.split('@')[0])
  }

  return (
    <Field label={label} htmlFor={id} help={help}>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-stone-300 bg-white text-sm text-stone-900 transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/25 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
        <input
          id={id}
          type="text"
          value={value ?? ''}
          placeholder={placeholder}
          onChange={handleChange}
          className="w-full min-w-0 bg-transparent px-3.5 py-2.5 outline-none placeholder:text-stone-400"
        />
        <span className="flex shrink-0 items-center border-l border-stone-300 bg-stone-50 px-3.5 text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
          {domain}
        </span>
      </div>
    </Field>
  )
}
