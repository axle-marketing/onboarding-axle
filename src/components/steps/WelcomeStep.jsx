import { Rocket, Clock, Save, ShieldCheck } from 'lucide-react'
import StepShell from '../StepShell'
import { useOnboarding } from '../../state/onboarding'

const PERKS = [
  { icon: Clock, title: '~10 minutos', text: 'Rápido e direto ao ponto.' },
  { icon: Save, title: 'Salva sozinho', text: 'Pode sair e voltar depois.' },
  { icon: ShieldCheck, title: 'Seus dados seguros', text: 'Usados só para configurar suas contas.' },
]

export default function WelcomeStep() {
  const { client } = useOnboarding()
  const company = client?.company_name

  return (
    <StepShell
      icon={Rocket}
      title={company ? `Bem-vindo, ${company}! 👋` : 'Bem-vindo! 👋'}
      description="Vamos reunir as informações para criar e configurar sua presença no Google: Perfil da Empresa (Google Business Profile), Local Services Ads e Google Ads."
    >
      <ul className="grid gap-2.5 sm:grid-cols-3">
        {PERKS.map((p) => (
          <li
            key={p.title}
            className="rounded-xl border border-stone-200 bg-white p-3.5 dark:border-stone-800 dark:bg-stone-900"
          >
            <p.icon className="text-sky-500" size={18} />
            <div className="mt-2 text-sm font-semibold text-stone-800 dark:text-stone-100">{p.title}</div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{p.text}</div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl bg-sky-50 p-4 text-sm text-sky-900 dark:bg-sky-500/10 dark:text-sky-200">
        <strong className="font-semibold">Está em estágio inicial?</strong> Sem problema. Se ainda não
        tiver algo (empresa registrada, logo, fotos, seguro/COI…), é só marcar{' '}
        <span className="font-semibold">“Ainda não tenho”</span> e seguir em frente — a equipe cuida do
        resto depois.
      </div>
    </StepShell>
  )
}
