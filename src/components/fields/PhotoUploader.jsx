import { useRef, useState } from 'react'
import { ImagePlus, X, Loader2, Camera } from 'lucide-react'
import PendingToggle from './PendingToggle'
import Select from './Select'
import { useOnboarding } from '../../state/onboarding'
import { uid } from '../../state/draft'
import { uploadFile } from '../../services/api'
import { compressImage } from '../../lib/image'

// Tipos de foto recomendados (o cliente é orientado a enviar destes).
export const PHOTO_CATEGORIES = [
  { id: 'service', label: 'Serviço sendo feito' },
  { id: 'equipment', label: 'Equipamentos' },
  { id: 'team', label: 'Equipe executando o serviço' },
  { id: 'office', label: 'Fachada do escritório/loja' },
  { id: 'vehicle', label: 'Carro da empresa (adesivado)' },
  { id: 'other', label: 'Outras' },
]
const catLabel = (id) => PHOTO_CATEGORIES.find((c) => c.id === id)?.label || id

export default function PhotoUploader() {
  const { draft, token, set } = useOnboarding()
  const photos = draft.gbp.photos
  const pending = draft.gbp.photos_pending
  const [category, setCategory] = useState('service')
  const [busy, setBusy] = useState(0)
  const inputRef = useRef(null)

  async function addFiles(fileList) {
    const files = [...(fileList || [])]
    if (!files.length) return
    setBusy((n) => n + files.length)
    for (const file of files) {
      try {
        const prepared = await compressImage(file)
        const res = await uploadFile(token, { category, file: prepared })
        const photo = { id: uid(), category, status: 'provided', file_id: res.file_id, url: res.url, name: res.name }
        set('gbp.photos', [...draft.gbp.photos, photo])
      } catch {
        /* ignora a falha de um arquivo isolado */
      } finally {
        setBusy((n) => n - 1)
      }
    }
  }

  function remove(id) {
    set('gbp.photos', photos.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          Fotos {photos.length > 0 && <span className="text-stone-400">({photos.length})</span>}
        </span>
        <PendingToggle
          checked={pending}
          onChange={(v) => set('gbp.photos_pending', v)}
          label="Ainda não tenho fotos"
        />
      </div>

      {pending ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          Marcado como pendência — a equipe vai pedir as fotos depois.
        </p>
      ) : (
        <>
          <div className="rounded-xl bg-sky-50 p-3 text-xs text-sky-900 dark:bg-sky-500/10 dark:text-sky-200">
            <div className="mb-1 flex items-center gap-1.5 font-semibold">
              <Camera size={14} /> Fotos que recomendamos
            </div>
            <ul className="list-inside list-disc space-y-0.5 text-sky-800/90 dark:text-sky-200/80">
              <li>Serviço sendo executado e equipe trabalhando</li>
              <li>Equipamentos e o carro da empresa (com adesivo)</li>
              <li>Fachada do escritório/loja, se houver</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Select
                label="Categoria das próximas fotos"
                value={category}
                onChange={setCategory}
                options={PHOTO_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
                placeholder="Categoria"
              />
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              {busy > 0 ? <Loader2 className="animate-spin" size={16} /> : <ImagePlus size={16} />}
              {busy > 0 ? `Enviando ${busy}…` : 'Adicionar fotos'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800"
                >
                  <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
                    {catLabel(p.category)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity hover:bg-rose-500 group-hover:opacity-100"
                    aria-label="Remover foto"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
