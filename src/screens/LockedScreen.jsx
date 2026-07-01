import { Lock } from 'lucide-react'
import ScreenShell from '../components/ScreenShell'
import ContactButtons from '../components/ContactButtons'

// Mostrada quando o onboarding já foi enviado e a janela de 1h se encerrou.
export default function LockedScreen({ company, token }) {
  return (
    <ScreenShell>
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-300">
          <Lock size={22} />
        </div>
        <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">Formulário já enviado</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          Você já enviou seu onboarding e o prazo de 1 hora para edição foi encerrado. Para reabrir e
          reenviar, peça a liberação para a nossa equipe:
        </p>
        <div className="mt-5">
          <ContactButtons company={company} token={token} />
        </div>
        <p className="mt-3 text-[11px] text-stone-400">
          No WhatsApp já vai uma mensagem pronta pedindo a liberação. 😉
        </p>
      </div>
    </ScreenShell>
  )
}
