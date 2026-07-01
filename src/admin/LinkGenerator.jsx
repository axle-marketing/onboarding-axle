import { useEffect, useState } from 'react'
import { Link2, Copy, Check, Loader2, MessageCircle } from 'lucide-react'
import Select from '../components/fields/Select'
import { listClients, mintToken } from '../services/adminApi'
import { inputBase } from '../components/fields/styles'
import { cx } from '../lib/cx'

// Gera o link tokenizado (ID da task do ClickUp assinado por HMAC no n8n) para enviar ao cliente.
export default function LinkGenerator() {
  const [clients, setClients] = useState([])
  const [taskId, setTaskId] = useState('')
  const [result, setResult] = useState(null) // { token, link }
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    listClients().then(setClients).catch(() => {})
  }, [])

  async function generate() {
    if (!taskId) return
    setBusy(true)
    setErr('')
    setResult(null)
    try {
      setResult(await mintToken(taskId))
    } catch (e) {
      setErr(e.message || 'Falha ao gerar o link.')
    } finally {
      setBusy(false)
    }
  }

  function copy() {
    if (!result) return
    navigator.clipboard?.writeText(result.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const company = clients.find((c) => c.task_id === taskId)?.company_name || ''
  const waLink = result
    ? `https://wa.me/?text=${encodeURIComponent(
        `Olá${company ? ` ${company}` : ''}! Segue o link do seu onboarding com a Axle: ${result.link}`,
      )}`
    : '#'

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink dark:text-paper">
        <Link2 size={16} /> Gerar link do cliente
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Select
            label="Cliente (task do ClickUp)"
            value={taskId}
            onChange={(v) => {
              setTaskId(v)
              setResult(null)
            }}
            options={clients.map((c) => ({ value: c.task_id, label: `${c.company_name} · ${c.task_id}` }))}
            placeholder="Selecione o cliente"
          />
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={!taskId || busy}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : <Link2 size={16} />}
          Gerar link
        </button>
      </div>

      {err && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{err}</p>}

      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <input readOnly value={result.link} className={cx(inputBase, 'py-2 text-xs')} />
            <button
              type="button"
              onClick={copy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            <MessageCircle size={13} /> Enviar por WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
