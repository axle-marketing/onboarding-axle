import { Loader2 } from 'lucide-react'
import ScreenShell from '../components/ScreenShell'

export default function LoadingScreen({ label = 'Carregando seu formulário…' }) {
  return (
    <ScreenShell>
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="animate-spin text-stone-400" size={28} />
        <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
      </div>
    </ScreenShell>
  )
}
