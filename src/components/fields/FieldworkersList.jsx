import { UserPlus, Trash2 } from 'lucide-react'
import { useOnboarding } from '../../state/onboarding'
import { uid } from '../../state/draft'
import { cx } from '../../lib/cx'
import { inputBase, inputError } from './styles'

// Lista dinâmica de fieldworkers (nome + e-mail). O Google pede o e-mail de
// cada um para a 2ª etapa do background check.
export default function FieldworkersList({ errors = {} }) {
  const { draft, set } = useOnboarding()
  const list = draft.lsa.fieldworkers

  const add = () => set('lsa.fieldworkers', [...list, { id: uid(), name: '', email: '' }])
  const update = (id, key, value) =>
    set('lsa.fieldworkers', list.map((f) => (f.id === id ? { ...f, [key]: value } : f)))
  const remove = (id) => set('lsa.fieldworkers', list.filter((f) => f.id !== id))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          Fieldworkers {list.length > 0 && <span className="text-stone-400">({list.length})</span>}
        </span>
      </div>
      <p className="text-xs text-stone-400">
        O Google envia um convite de background check para o e-mail de cada fieldworker — capriche no e-mail.
      </p>

      {list.length === 0 && (
        <p className="rounded-lg border border-dashed border-stone-300 px-3 py-4 text-center text-xs text-stone-400 dark:border-stone-700">
          Nenhum fieldworker adicionado ainda.
        </p>
      )}

      {list.map((f, i) => (
        <div key={f.id} className="flex items-start gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <input
              value={f.name}
              onChange={(e) => update(f.id, 'name', e.target.value)}
              placeholder="Nome"
              className={cx(inputBase, 'py-2 text-sm')}
            />
            <div>
              <input
                value={f.email}
                onChange={(e) => update(f.id, 'email', e.target.value)}
                placeholder="e-mail@exemplo.com"
                type="email"
                inputMode="email"
                className={cx(inputBase, 'py-2 text-sm', errors[`fieldworkers.${i}.email`] && inputError)}
              />
              {errors[`fieldworkers.${i}.email`] && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errors[`fieldworkers.${i}.email`]}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => remove(f.id)}
            className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-rose-500 dark:hover:bg-stone-800"
            aria-label="Remover fieldworker"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        <UserPlus size={15} /> Adicionar fieldworker
      </button>
    </div>
  )
}
