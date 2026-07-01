import { AtSign } from 'lucide-react'
import StepShell from '../StepShell'
import Choice from '../fields/Choice'
import TextField from '../fields/TextField'
import TextArea from '../fields/TextArea'
import { useOnboarding } from '../../state/onboarding'

export default function EmailStep({ errors = {} }) {
  const { draft, set } = useOnboarding()
  const e = draft.professional_email

  return (
    <StepShell
      icon={AtSign}
      title="E-mail profissional"
      description="Um e-mail com o domínio da empresa (ex.: contato@suaempresa.com) passa mais credibilidade — mas é opcional."
    >
      <Choice
        label="Quer um e-mail profissional com domínio próprio?"
        required
        value={e.wants}
        onChange={(v) => set('professional_email.wants', v)}
        options={[
          { value: 'yes', label: 'Sim, quero' },
          { value: 'no', label: 'Não, tudo bem', hint: 'Usamos o e-mail comum' },
        ]}
        error={errors.wants}
      />

      {e.wants === 'yes' && (
        <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/40">
          <Choice
            label="Já tem um domínio?"
            required
            value={e.has_domain}
            onChange={(v) => set('professional_email.has_domain', v)}
            options={[
              { value: 'yes', label: 'Sim, já tenho' },
              { value: 'no', label: 'Não — comprar', hint: 'A equipe registra pra você' },
            ]}
            error={errors.has_domain}
          />

          {e.has_domain === 'yes' && (
            <TextField
              label="Qual o domínio?"
              required
              value={e.domain}
              onChange={(v) => set('professional_email.domain', v)}
              placeholder="suaempresa.com"
              error={errors.domain}
            />
          )}

          {e.has_domain === 'no' && (
            <TextArea
              label="Domínios desejados (opcional)"
              value={e.desired_domains}
              onChange={(v) => set('professional_email.desired_domains', v)}
              placeholder={'Liste opções, uma por linha:\nsuaempresa.com\nsuaempresaservices.com'}
              help="Vamos verificar a disponibilidade e registrar o melhor."
              rows={3}
            />
          )}
        </div>
      )}
    </StepShell>
  )
}
