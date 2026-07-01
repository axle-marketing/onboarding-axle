import { Mail } from 'lucide-react'
import StepShell from '../StepShell'
import Choice from '../fields/Choice'
import TextField from '../fields/TextField'
import { useOnboarding } from '../../state/onboarding'

export default function GoogleStep({ errors = {} }) {
  const { draft, set } = useOnboarding()
  const g = draft.google_account

  return (
    <StepShell
      icon={Mail}
      title="Conta Google"
      description="Toda a operação (Perfil, Ads, Local Services) roda em cima de uma conta Google."
    >
      <Choice
        label="O cliente já tem uma conta Google?"
        required
        value={g.has_account}
        onChange={(v) => set('google_account.has_account', v)}
        options={[
          { value: 'yes', label: 'Sim, já tenho' },
          { value: 'no', label: 'Não — criar uma', hint: 'A equipe cria pra você' },
        ]}
        error={errors.has_account}
      />

      {g.has_account === 'yes' && (
        <TextField
          label="E-mail da conta Google"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          value={g.email}
          onChange={(v) => set('google_account.email', v)}
          placeholder="voce@gmail.com"
          error={errors.email}
        />
      )}

      {g.has_account === 'no' && (
        <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/40">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Vamos criar a conta para você. Se tiver preferências, preencha abaixo (tudo opcional).
          </p>
          <TextField
            label="Nome de usuário preferido (antes do @gmail.com)"
            value={g.preferred_handle}
            onChange={(v) => set('google_account.preferred_handle', v)}
            placeholder="ex.: democleaningllc"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="E-mail de recuperação"
              type="email"
              value={g.recovery_email}
              onChange={(v) => set('google_account.recovery_email', v)}
              placeholder="opcional"
            />
            <TextField
              label="Telefone de recuperação"
              type="tel"
              inputMode="tel"
              value={g.recovery_phone}
              onChange={(v) => set('google_account.recovery_phone', v)}
              placeholder="opcional"
            />
          </div>
        </div>
      )}
    </StepShell>
  )
}
