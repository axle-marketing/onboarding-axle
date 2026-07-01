import { ClipboardCheck, AlertCircle } from 'lucide-react'
import StepShell from '../StepShell'
import { useOnboarding } from '../../state/onboarding'
import { pendingItems, resolveCommercialEmail } from '../../state/draft'

const PENDING_LABELS = {
  company: 'Empresa ainda não criada',
  google_account: 'Conta Google a criar',
  domain: 'Domínio a registrar',
  business_name: 'Nome oficial a definir',
  address: 'Endereço a informar',
  logo: 'Logo a enviar',
  photos: 'Fotos a enviar',
  coi: 'COI (seguro) a enviar',
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-400">{title}</h3>
      <dl className="divide-y divide-stone-100 dark:divide-stone-800">{children}</dl>
    </div>
  )
}
function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-stone-500 dark:text-stone-400">{label}</dt>
      <dd className="text-right font-medium text-stone-800 dark:text-stone-100">{value || '—'}</dd>
    </div>
  )
}

export default function ReviewStep() {
  const { draft } = useOnboarding()
  const g = draft.gbp
  const pend = pendingItems(draft)

  return (
    <StepShell
      icon={ClipboardCheck}
      title="Revisão & envio"
      description="Confira o resumo. Você pode voltar e ajustar qualquer etapa antes de enviar."
    >
      <div className="space-y-3">
        <Section title="Empresa & responsável">
          <Row label="Empresa criada?" value={{ yes: 'Sim', no: 'Ainda não', in_progress: 'Em processo' }[draft.company_exists]} />
          <Row label="Owner" value={draft.owner_name} />
        </Section>

        <Section title="Google & e-mail">
          <Row label="Conta Google" value={draft.google_account.has_account === 'yes' ? draft.google_account.email : 'A criar'} />
          <Row
            label="E-mail profissional"
            value={
              draft.professional_email.wants === 'yes'
                ? draft.professional_email.domain || 'Domínio a registrar'
                : 'Não'
            }
          />
        </Section>

        <Section title="Business Profile">
          <Row label="Já existe?" value={g.already_exists === 'yes' ? 'Sim' : 'Criar'} />
          <Row label="Nome" value={g.business_name_pending ? 'A definir' : g.business_name} />
          <Row label="Telefone" value={g.phone} />
          <Row label="Cidades selecionadas" value={g.service_area.cities.length || '—'} />
        </Section>

        <Section title="Local Services">
          <Row label="Owner" value={draft.lsa.owner_name || draft.owner_name} />
          <Row label="E-mail" value={resolveCommercialEmail(draft)} />
          <Row label="Fieldworkers" value={draft.lsa.fieldworkers.length || '—'} />
        </Section>

        {pend.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
              <AlertCircle size={16} /> Itens pendentes ({pend.length})
            </div>
            <p className="mt-1 text-xs text-amber-700/90 dark:text-amber-300/80">
              Tudo bem enviar assim — a equipe vai acompanhar estes itens com você:
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {pend.map((k) => (
                <li
                  key={k}
                  className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                >
                  {PENDING_LABELS[k] || k}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </StepShell>
  )
}
