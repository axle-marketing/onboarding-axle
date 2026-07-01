import { useEffect, useState } from 'react'
import { ExternalLink, Unlock, Loader2, RefreshCw, Check } from 'lucide-react'
import { listClients, mintToken, unlock } from '../services/adminApi'
import { cx } from '../lib/cx'

const STATUS = {
  draft: { label: 'Rascunho', cls: 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-200' },
  submitted: { label: 'Enviado', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  locked: { label: 'Travado', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
}

export default function Submissions() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [doneId, setDoneId] = useState('')

  function load() {
    setLoading(true)
    listClients()
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function open(taskId) {
    setBusyId(taskId + ':open')
    try {
      const { link } = await mintToken(taskId)
      window.open(link, '_blank')
    } finally {
      setBusyId('')
    }
  }

  async function release(taskId) {
    setBusyId(taskId + ':unlock')
    try {
      const { token } = await mintToken(taskId)
      await unlock(token)
      setDoneId(taskId)
      setTimeout(() => setDoneId(''), 2000)
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-bold text-ink dark:text-paper">Envios</div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
        >
          <RefreshCw size={13} /> Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-stone-400">
          <Loader2 className="animate-spin" size={16} /> Carregando…
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {clients.map((c) => {
            const st = STATUS[c.status] || STATUS.draft
            const canRelease = c.status === 'submitted' || c.status === 'locked'
            return (
              <div key={c.task_id} className="flex flex-wrap items-center gap-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                    {c.company_name}
                  </div>
                  <div className="text-[11px] text-stone-400">{c.niche} · {c.task_id}</div>
                </div>
                <span className={cx('rounded-full px-2 py-0.5 text-[11px] font-semibold', st.cls)}>{st.label}</span>
                <button
                  type="button"
                  onClick={() => open(c.task_id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  {busyId === c.task_id + ':open' ? <Loader2 className="animate-spin" size={13} /> : <ExternalLink size={13} />}
                  Abrir
                </button>
                {canRelease && (
                  <button
                    type="button"
                    onClick={() => release(c.task_id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                  >
                    {doneId === c.task_id ? (
                      <>
                        <Check size={13} /> Liberado
                      </>
                    ) : busyId === c.task_id + ':unlock' ? (
                      <Loader2 className="animate-spin" size={13} />
                    ) : (
                      <>
                        <Unlock size={13} /> Liberar
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
