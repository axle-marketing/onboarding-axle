// =============================================================
//  MODELO DO RASCUNHO (estado do formulário) + helpers puros
// =============================================================
//  Um único objeto "draft" guarda tudo o que o cliente preenche.
//  status dos assets (logo/coi/fotos): '' (indefinido) | 'provided' | 'pending'
//  ("pending" = cliente marcou "ainda não tenho").
// =============================================================

export const uid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2, 10))

export const DAYS = [
  { id: 'mon', label: 'Seg' },
  { id: 'tue', label: 'Ter' },
  { id: 'wed', label: 'Qua' },
  { id: 'thu', label: 'Qui' },
  { id: 'fri', label: 'Sex' },
  { id: 'sat', label: 'Sáb' },
  { id: 'sun', label: 'Dom' },
]

export const blankAsset = () => ({ status: '', file_id: null, url: null, name: null })

function defaultHours() {
  const h = {}
  for (const d of DAYS) {
    h[d.id] = {
      open: '08:00',
      close: '17:00',
      closed: d.id === 'sat' || d.id === 'sun',
      is_24h: false,
    }
  }
  return h
}

export function blankDraft() {
  return {
    company_exists: '', // 'yes' | 'no' | 'in_progress'
    owner_name: '',

    google_account: {
      has_account: '', // 'yes' | 'no'
      email: '',
      preferred_handle: '',
      recovery_email: '',
      recovery_phone: '',
    },

    professional_email: {
      wants: '', // 'yes' | 'no'
      has_domain: '', // 'yes' | 'no'
      domain: '',
      desired_domains: '', // texto livre (um por linha)
    },

    gbp: {
      already_exists: '', // 'yes' | 'no'
      existing_url: '',
      business_name: '',
      business_name_pending: false,
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        is_storefront: false,
        pending: false,
      },
      service_area: { cities: [], notes: '', state: '' }, // limite de 20 aplicado na UI
      hours: defaultHours(),
      phone: '',
      website: '',
      logo: blankAsset(),
      photos_pending: false,
      photos: [], // { id, category, status:'provided', file_id, url, name }
    },

    lsa: {
      owner_name: '', // prefill de owner_name
      phone: '', // prefill de gbp.phone
      email: '', // prefill do e-mail comercial
      founded_year: '', // Google pede a idade do negócio na verificação do LSA
      coi: blankAsset(),
      fieldworkers: [], // { id, name, email }
      service_area: { cities: [], notes: '', seeded: false }, // sem limite
    },
  }
}

// ---- acesso imutável por caminho ('gbp.address.city') ----
export function setIn(obj, path, value) {
  const keys = Array.isArray(path) ? path : String(path).split('.')
  if (keys.length === 0) return value
  const [head, ...rest] = keys
  const base = obj == null ? {} : obj
  const clone = Array.isArray(base) ? base.slice() : { ...base }
  clone[head] = rest.length ? setIn(base[head], rest, value) : value
  return clone
}

export function getIn(obj, path) {
  return (Array.isArray(path) ? path : String(path).split('.')).reduce(
    (o, k) => (o == null ? o : o[k]),
    obj,
  )
}

// ---- cidades: chave única + união (para auto-import GBP -> LSA) ----
export const cityKey = (c) => `${c.name}|${c.state}`

export function mergeCities(...lists) {
  const m = new Map()
  for (const list of lists) for (const c of list || []) m.set(cityKey(c), c)
  return [...m.values()]
}

// E-mail comercial padrão: o e-mail profissional ainda pode não existir,
// então caímos no e-mail da conta Google que o cliente informou.
export function resolveCommercialEmail(draft) {
  return draft.lsa.email || draft.google_account.email || ''
}

// Itens que ficaram pendentes ("ainda não tenho") — vão no resumo e no payload
// para a equipe saber o que ainda precisa cobrar do cliente.
export function pendingItems(draft) {
  const out = []
  if (draft.company_exists && draft.company_exists !== 'yes') out.push('company')
  if (draft.google_account.has_account === 'no') out.push('google_account')
  if (draft.professional_email.wants === 'yes' && draft.professional_email.has_domain === 'no')
    out.push('domain')
  if (draft.gbp.business_name_pending) out.push('business_name')
  if (draft.gbp.address.pending) out.push('address')
  if (draft.gbp.logo.status === 'pending') out.push('logo')
  if (draft.gbp.photos_pending && !draft.gbp.photos.length) out.push('photos')
  if (draft.lsa.coi.status === 'pending') out.push('coi')
  return out
}

// Monta o objeto "onboarding" final (sem token/request_id — isso é adicionado
// pelo submitOnboarding). Resolve os prefills do LSA e une as áreas de serviço.
export function toPayload(draft, client) {
  const gbpCities = draft.gbp.service_area.cities
  const lsaCities = mergeCities(gbpCities, draft.lsa.service_area.cities)
  return {
    submitted_at: new Date().toISOString(),
    meta: { pending_items: pendingItems(draft) },
    client: client
      ? { client_id: client.client_id, company_name: client.company_name, niche: client.niche }
      : null,
    company_exists: draft.company_exists || null,
    owner_name: draft.owner_name,
    google_account: { ...draft.google_account, needs_creation: draft.google_account.has_account === 'no' },
    professional_email: {
      ...draft.professional_email,
      needs_domain:
        draft.professional_email.wants === 'yes' && draft.professional_email.has_domain === 'no',
    },
    gbp: {
      ...draft.gbp,
      service_area: { ...draft.gbp.service_area, limit: 20 },
    },
    lsa: {
      owner_name: draft.lsa.owner_name || draft.owner_name,
      phone: draft.lsa.phone || draft.gbp.phone,
      email: resolveCommercialEmail(draft),
      founded_year: draft.lsa.founded_year || null,
      coi: draft.lsa.coi,
      fieldworkers_count: draft.lsa.fieldworkers.length,
      fieldworkers: draft.lsa.fieldworkers.map(({ name, email }) => ({ name, email })),
      service_area: { cities: lsaCities, notes: draft.lsa.service_area.notes },
    },
  }
}
