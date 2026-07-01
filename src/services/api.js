import { CONFIG } from '../config'

// =============================================================
//  SERVIÇOS DO CLIENTE (LOAD / SAVE / UPLOAD / SUBMIT)
//  Mesmo padrão tolerante do generate-image-app: aceita respostas
//  embrulhadas, cai no mock quando USE_MOCK ou endpoint vazio.
// =============================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function newRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `req-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

async function parseJson(res) {
  const raw = await res.text()
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return { raw }
  }
}

// Erro padronizado de formulário travado (lock reforçado no servidor).
export class LockedError extends Error {
  constructor() {
    super('locked')
    this.locked = true
  }
}

// -------------------------------------------------------------
//  LOAD — carrega cliente + rascunho + estado do ciclo de vida
//  → { client, draft, status, submitted_at, unlocked }
// -------------------------------------------------------------
export async function loadDraft(token) {
  if (CONFIG.USE_MOCK || !CONFIG.LOAD_ENDPOINT) return mockLoad(token)

  const sep = CONFIG.LOAD_ENDPOINT.includes('?') ? '&' : '?'
  const res = await fetch(`${CONFIG.LOAD_ENDPOINT}${sep}token=${encodeURIComponent(token)}`)
  if (res.status === 404) throw Object.assign(new Error('not_found'), { notFound: true })
  if (!res.ok) throw new Error(`LOAD respondeu ${res.status}`)
  return normalizeLoad(await parseJson(res))
}

function normalizeLoad(data) {
  const d = Array.isArray(data) ? data[0] || {} : data?.data ? data.data : data
  return {
    client: d.client || null,
    draft: d.draft || null,
    status: d.status || 'draft',
    submitted_at: d.submitted_at || null,
    unlocked: !!d.unlocked,
  }
}

// -------------------------------------------------------------
//  SAVE — autosave do rascunho (pode voltar { error:'locked' })
// -------------------------------------------------------------
export async function saveDraft(token, draft) {
  if (CONFIG.USE_MOCK || !CONFIG.SAVE_ENDPOINT) {
    await sleep(250)
    return { ok: true }
  }
  const res = await fetch(CONFIG.SAVE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, request_id: newRequestId(), draft }),
  })
  const data = await parseJson(res)
  if (data?.error === 'locked') throw new LockedError()
  if (!res.ok) throw new Error(`SAVE respondeu ${res.status}`)
  return data
}

// -------------------------------------------------------------
//  UPLOAD — arquivo (base64) → n8n → Google Drive
//  → { file_id, url, name }
// -------------------------------------------------------------
export async function uploadFile(token, { category, file }) {
  const { name, type } = file
  if (CONFIG.USE_MOCK || !CONFIG.UPLOAD_ENDPOINT) {
    await sleep(600)
    return {
      file_id: 'mock_' + Math.random().toString(36).slice(2, 9),
      url: URL.createObjectURL(file), // preview local no mock
      name,
    }
  }
  const data_base64 = await fileToBase64(file)
  const res = await fetch(CONFIG.UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, category, filename: name, mime: type, data_base64 }),
  })
  if (!res.ok) throw new Error(`UPLOAD respondeu ${res.status}`)
  const out = await parseJson(res)
  return { file_id: out.file_id || out.id || null, url: out.url || null, name: out.name || name }
}

// -------------------------------------------------------------
//  SUBMIT — envia o onboarding completo (lock reforçado no n8n)
//  → { ok, status, submitted_at }
// -------------------------------------------------------------
export async function submitOnboarding(token, onboarding) {
  if (CONFIG.USE_MOCK || !CONFIG.SUBMIT_ENDPOINT) {
    await sleep(900)
    return { ok: true, status: 'submitted', submitted_at: new Date().toISOString() }
  }
  const res = await fetch(CONFIG.SUBMIT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, request_id: newRequestId(), onboarding }),
  })
  const data = await parseJson(res)
  if (data?.error === 'locked') throw new LockedError()
  if (!res.ok) throw new Error(`SUBMIT respondeu ${res.status}`)
  return {
    ok: true,
    status: data.status || 'submitted',
    submitted_at: data.submitted_at || new Date().toISOString(),
  }
}

// -------------------------------------------------------------
//  helpers
// -------------------------------------------------------------
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1] || '')
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// MOCK: tokens especiais para testar o ciclo de vida sem n8n.
//   ?t=locked-demo     -> travado (enviado há 3h)
//   ?t=submitted-demo  -> enviado há 5 min (janela de 1h aberta)
//   qualquer outro     -> rascunho novo
function mockLoad(token) {
  return sleep(450).then(() => {
    const client = { client_id: token || 'mock_task', company_name: 'Demo Cleaning LLC', niche: 'House Cleaning' }
    if (token === 'locked-demo')
      return { client, draft: null, status: 'submitted', submitted_at: new Date(Date.now() - 3 * 3600e3).toISOString(), unlocked: false }
    if (token === 'submitted-demo')
      return { client, draft: null, status: 'submitted', submitted_at: new Date(Date.now() - 5 * 60e3).toISOString(), unlocked: false }
    return { client, draft: null, status: 'draft', submitted_at: null, unlocked: false }
  })
}
