import { useEffect } from 'react'
import { BadgeCheck, Info, DownloadCloud } from 'lucide-react'
import StepShell from '../StepShell'
import TextField from '../fields/TextField'
import PhoneField from '../fields/PhoneField'
import TextArea from '../fields/TextArea'
import CityPicker from '../fields/CityPicker'
import FileDropzone from '../fields/FileDropzone'
import FieldworkersList from '../fields/FieldworkersList'
import { useOnboarding } from '../../state/onboarding'
import { resolveCommercialEmail, mergeCities } from '../../state/draft'

export default function LsaStep({ errors = {} }) {
  const { draft, set, merge } = useOnboarding()
  const l = draft.lsa
  const gbpCities = draft.gbp.service_area.cities

  // Prefills vindos do GBP / passos anteriores (editáveis).
  const ownerValue = l.owner_name || draft.owner_name
  const phoneValue = l.phone || draft.gbp.phone
  const emailValue = l.email || resolveCommercialEmail(draft)

  // Auto-import: na 1ª vez que o cliente abre o LSA, semeia a área com as cidades do GBP.
  useEffect(() => {
    if (!l.service_area.seeded) {
      merge('lsa.service_area', { cities: mergeCities(gbpCities, l.service_area.cities), seeded: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <StepShell
      icon={BadgeCheck}
      title="Local Services Ads (Google Guaranteed)"
      description="O selo verde de “Google Guaranteed”. Exige verificação da empresa, do Owner e da equipe de campo."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nome completo do Owner"
          required
          value={ownerValue}
          onChange={(v) => set('lsa.owner_name', v)}
          help="Pré-preenchido do passo anterior."
          error={errors.owner_name}
        />
        <PhoneField
          label="Telefone comercial"
          value={phoneValue}
          onChange={(v) => set('lsa.phone', v)}
          help="Pré-preenchido do GBP."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="E-mail comercial"
          type="email"
          inputMode="email"
          value={emailValue}
          onChange={(v) => set('lsa.email', v)}
          help="Pré-preenchido com seu e-mail profissional ou da conta Google."
        />
        <TextField
          label="Ano de fundação da empresa"
          type="number"
          inputMode="numeric"
          value={l.founded_year}
          onChange={(v) => set('lsa.founded_year', v)}
          placeholder="ex.: 2019"
          help="O Google pede a idade do negócio na verificação do Local Services."
        />
      </div>

      {/* Explicação de fieldworker (conteúdo já vale; a lista entra na Fase 7) */}
      <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-500/30 dark:bg-sky-500/10">
        <Info className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-300" size={18} />
        <div className="space-y-1 text-sky-900 dark:text-sky-100">
          <p className="font-semibold">O que é um “fieldworker”?</p>
          <p className="text-[13px] leading-relaxed text-sky-800/90 dark:text-sky-200/90">
            É qualquer pessoa que vai até o cliente prestar o serviço (na casa, empresa ou propriedade):
            técnicos, instaladores, faxineiros, encanadores, eletricistas, técnicos de HVAC, etc. —
            funcionários ou contractors. <strong>Não</strong> conta quem só trabalha no escritório
            (recepção/administrativo) e nunca vai a campo. O Google pede o{' '}
            <strong>e-mail de cada fieldworker</strong> para a 2ª etapa do background check.
          </p>
        </div>
      </div>

      <FileDropzone
        label="COI — Certificate of Liability Insurance (PDF)"
        path="lsa.coi"
        category="coi"
        accept="application/pdf"
        isImage={false}
        help="Seu certificado de seguro de responsabilidade. Se ainda não tiver, marque “ainda não tenho”."
      />

      <FieldworkersList errors={errors} />

      {/* Área de serviço do LSA — sem limite, auto-importa do GBP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">Área de serviço (LSA)</span>
          {gbpCities.length > 0 && (
            <button
              type="button"
              onClick={() => set('lsa.service_area.cities', mergeCities(gbpCities, l.service_area.cities))}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              <DownloadCloud size={13} /> Importar do GBP ({gbpCities.length})
            </button>
          )}
        </div>
        <p className="text-xs text-stone-400">
          No LSA não há limite de cidades. Já trouxemos as do Business Profile — adicione quantas quiser.
        </p>
        <CityPicker
          value={l.service_area.cities}
          onChange={(cities) => set('lsa.service_area.cities', cities)}
          defaultState={draft.gbp.address.state}
        />
        <TextArea
          label="Notas sobre a área de serviço (opcional)"
          value={l.service_area.notes}
          onChange={(v) => set('lsa.service_area.notes', v)}
          rows={2}
        />
      </div>
    </StepShell>
  )
}
