import { CheckCircle2, PencilLine } from 'lucide-react'
import ScreenShell from '../components/ScreenShell'

// Mostrada após o envio. Dentro da janela de 1h, oferece reabrir para corrigir.
export default function SubmittedScreen({ company, canReopen, minutesLeft, onReopen }) {
  return (
    <ScreenShell>
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <CheckCircle2 size={24} />
        </div>
        <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">Onboarding enviado! 🎉</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          Recebemos as informações{company ? ` de ${company}` : ''}. Nossa equipe vai dar sequência —
          você já pode fechar esta página.
        </p>

        {canReopen && (
          <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-3 text-left dark:border-stone-700 dark:bg-stone-800/50">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Esqueceu algo? Você ainda pode editar e reenviar pelos próximos{' '}
              <strong className="text-stone-700 dark:text-stone-200">{minutesLeft} min</strong>.
            </p>
            <button
              onClick={onReopen}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <PencilLine size={14} />
              Corrigir e reenviar
            </button>
          </div>
        )}
      </div>
    </ScreenShell>
  )
}
