import { Store } from 'lucide-react'
import StepShell from '../StepShell'
import Choice from '../fields/Choice'
import TextField from '../fields/TextField'
import TextArea from '../fields/TextArea'
import Select from '../fields/Select'
import PendingField from '../fields/PendingField'
import BusinessHours from '../fields/BusinessHours'
import CityPicker from '../fields/CityPicker'
import FileDropzone from '../fields/FileDropzone'
import PhotoUploader from '../fields/PhotoUploader'
import { useOnboarding } from '../../state/onboarding'
import { US_STATES } from '../../data/states'

const stateOptions = US_STATES.map((s) => ({ value: s.abbr, label: `${s.name} (${s.abbr})` }))

export default function GbpStep({ errors = {} }) {
  const { draft, set } = useOnboarding()
  const g = draft.gbp

  return (
    <StepShell
      icon={Store}
      title="Google Business Profile"
      description="O perfil que aparece no Google Maps e na Busca (antigo Google Meu Negócio)."
    >
      <Choice
        label="Já tem um Google Business Profile?"
        required
        value={g.already_exists}
        onChange={(v) => set('gbp.already_exists', v)}
        options={[
          { value: 'yes', label: 'Sim, já tenho' },
          { value: 'no', label: 'Não — criar um' },
        ]}
        error={errors.already_exists}
      />

      {g.already_exists === 'yes' && (
        <TextField
          label="Link do perfil (se tiver em mãos)"
          value={g.existing_url}
          onChange={(v) => set('gbp.existing_url', v)}
          placeholder="https://maps.google.com/..."
          help="Opcional. Mesmo já tendo o perfil, peça o logo e as fotos abaixo para otimizá-lo."
        />
      )}

      {g.already_exists === 'no' && (
        <>
          {/* Nome oficial */}
          <PendingField
            label="Nome oficial da empresa"
            required
            pending={g.business_name_pending}
            onPendingChange={(v) => set('gbp.business_name_pending', v)}
            pendingLabel="Ainda não definido"
          >
            <TextField
              value={g.business_name}
              onChange={(v) => set('gbp.business_name', v)}
              placeholder="Ex.: Demo Cleaning LLC"
              error={errors.business_name}
            />
          </PendingField>

          {/* Endereço */}
          <PendingField
            label="Endereço oficial"
            required
            pending={g.address.pending}
            onPendingChange={(v) => set('gbp.address.pending', v)}
          >
            <div className="space-y-3">
              <TextField
                value={g.address.line1}
                onChange={(v) => set('gbp.address.line1', v)}
                placeholder="Rua e número (street address)"
                error={errors['address.line1']}
              />
              <TextField
                value={g.address.line2}
                onChange={(v) => set('gbp.address.line2', v)}
                placeholder="Apto/Suite (opcional)"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <TextField
                  value={g.address.city}
                  onChange={(v) => set('gbp.address.city', v)}
                  placeholder="Cidade"
                  error={errors['address.city']}
                />
                <Select
                  value={g.address.state}
                  onChange={(v) => set('gbp.address.state', v)}
                  options={stateOptions}
                  placeholder="Estado"
                  error={errors['address.state']}
                />
                <TextField
                  value={g.address.zip}
                  onChange={(v) => set('gbp.address.zip', v)}
                  placeholder="ZIP"
                  inputMode="numeric"
                  error={errors['address.zip']}
                />
              </div>
              <Choice
                label="Tipo de atendimento"
                columns="sm:grid-cols-2"
                value={g.address.is_storefront ? 'storefront' : 'service'}
                onChange={(v) => set('gbp.address.is_storefront', v === 'storefront')}
                options={[
                  { value: 'service', label: 'Só área de serviço', hint: 'Atende na casa do cliente' },
                  { value: 'storefront', label: 'Loja física', hint: 'Cliente vai até o endereço' },
                ]}
              />
            </div>
          </PendingField>
        </>
      )}

      {/* Comum aos dois caminhos */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Número comercial (recebe as ligações dos leads)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={g.phone}
          onChange={(v) => set('gbp.phone', v)}
          placeholder="(617) 555-0148"
          help="Esse número será reaproveitado no Local Services."
        />
        <TextField
          label="Site da empresa (se tiver)"
          type="url"
          inputMode="url"
          value={g.website}
          onChange={(v) => set('gbp.website', v)}
          placeholder="https://suaempresa.com"
        />
      </div>

      {/* Área de cobertura — GBP permite até 20 cidades */}
      <div className="space-y-2">
        <div>
          <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            Área de cobertura (cidades)
          </span>
          <p className="text-xs text-stone-400">
            No Business Profile você pode escolher até <strong>20 cidades</strong>. Os grupos já vêm por
            região (metro) — use a busca para achar qualquer cidade.
          </p>
        </div>
        <CityPicker
          value={g.service_area.cities}
          onChange={(cities) => set('gbp.service_area.cities', cities)}
          limit={20}
          defaultState={g.address.state}
        />
        <TextArea
          label="Notas sobre a área de serviço (opcional)"
          value={g.service_area.notes}
          onChange={(v) => set('gbp.service_area.notes', v)}
          placeholder="Ex.: priorizamos a região norte de Boston; atendemos chamados pontuais em..."
          rows={2}
        />
      </div>

      <BusinessHours />

      <FileDropzone
        label="Logo da empresa"
        path="gbp.logo"
        category="logo"
        accept="image/*"
        isImage
        help="PNG ou JPG. Se não tiver agora, marque “ainda não tenho”."
      />

      <PhotoUploader />
    </StepShell>
  )
}
