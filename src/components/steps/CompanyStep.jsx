import { Building2 } from 'lucide-react'
import StepShell from '../StepShell'
import Choice from '../fields/Choice'
import TextField from '../fields/TextField'
import { useOnboarding } from '../../state/onboarding'

export default function CompanyStep({ errors = {} }) {
  const { draft, set } = useOnboarding()
  return (
    <StepShell
      icon={Building2}
      title="Empresa & responsável"
      description="Primeiro, o básico sobre o negócio e quem é o responsável."
    >
      <Choice
        label="A empresa já está criada / registrada?"
        required
        value={draft.company_exists}
        onChange={(v) => set('company_exists', v)}
        options={[
          { value: 'yes', label: 'Sim, já existe' },
          { value: 'in_progress', label: 'Em processo' },
          { value: 'no', label: 'Ainda não' },
        ]}
        error={errors.company_exists}
      />

      <TextField
        label="Nome completo do responsável (Owner)"
        required
        value={draft.owner_name}
        onChange={(v) => set('owner_name', v)}
        placeholder="Ex.: João Cabral"
        help="Mesmo que a empresa ainda não exista, precisamos saber quem será o Owner quando ela for criada."
        error={errors.owner_name}
      />
    </StepShell>
  )
}
