import { AlertTriangle } from 'lucide-react'
import ScreenShell from '../components/ScreenShell'
import ContactButtons from '../components/ContactButtons'

export default function InvalidLinkScreen() {
  return (
    <ScreenShell>
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
          <AlertTriangle size={22} />
        </div>
        <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">Link inválido ou expirado</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          Este link de onboarding não é válido. Fale com a equipe da Axle para receber um link novo.
        </p>
        <div className="mt-5">
          <ContactButtons />
        </div>
      </div>
    </ScreenShell>
  )
}
