import { useRef, useState } from 'react'
import { UploadCloud, X, FileText, Loader2 } from 'lucide-react'
import PendingField from './PendingField'
import { useOnboarding } from '../../state/onboarding'
import { getIn } from '../../state/draft'
import { uploadFile } from '../../services/api'
import { compressImage } from '../../lib/image'
import { cx } from '../../lib/cx'

// Upload de um único arquivo (logo, COI) com toggle "ainda não tenho".
// path: caminho do asset no draft (ex.: 'gbp.logo' | 'lsa.coi')
export default function FileDropzone({
  label,
  path,
  category,
  accept = 'image/*',
  isImage = true,
  pendingLabel,
  help,
}) {
  const { draft, token, merge } = useOnboarding()
  const asset = getIn(draft, path) || {}
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const [err, setErr] = useState('')

  const pending = asset.status === 'pending'

  async function handleFile(file) {
    if (!file) return
    setBusy(true)
    setErr('')
    try {
      const prepared = isImage ? await compressImage(file) : file
      const res = await uploadFile(token, { category, file: prepared })
      merge(path, { status: 'provided', file_id: res.file_id, url: res.url, name: res.name })
    } catch {
      setErr('Falha no upload. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  function clearFile() {
    merge(path, { status: '', file_id: null, url: null, name: null })
  }

  return (
    <PendingField
      label={label}
      pending={pending}
      onPendingChange={(v) => merge(path, { status: v ? 'pending' : '', file_id: null, url: null, name: null })}
      pendingLabel={pendingLabel || 'Ainda não tenho'}
      help={help}
    >
      {asset.status === 'provided' && asset.url ? (
        <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-2.5 dark:border-stone-800 dark:bg-stone-900">
          {isImage ? (
            <img src={asset.url} alt={asset.name} className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10">
              <FileText size={22} />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-stone-700 dark:text-stone-200">
            {asset.name || 'Arquivo enviado'}
          </span>
          <button
            type="button"
            onClick={clearFile}
            className="grid h-7 w-7 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-rose-500 dark:hover:bg-stone-800"
            aria-label="Remover arquivo"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
          className={cx(
            'flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
            drag
              ? 'border-sky-400 bg-sky-50 dark:bg-sky-500/10'
              : 'border-stone-300 hover:border-sky-400 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800/50',
          )}
        >
          {busy ? (
            <Loader2 className="animate-spin text-stone-500" size={22} />
          ) : (
            <UploadCloud className="text-stone-400" size={22} />
          )}
          <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
            {busy ? 'Enviando…' : 'Toque para enviar ou arraste o arquivo'}
          </span>
          <span className="text-xs text-stone-400">{isImage ? 'PNG, JPG' : 'PDF'}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {err && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{err}</p>}
    </PendingField>
  )
}
