import { CONFIG } from '../config'
import { buildClientLink } from '../router'

// =============================================================
//  SERVIÇOS DA ÁREA ADMIN
//  IMPORTANTE: site estático não é fronteira de segurança. O
//  admin_token aqui é só UX; a autorização REAL acontece no n8n,
//  que valida o token em cada endpoint admin antes de tocar
//  ClickUp/Supabase. Nunca colocar segredos/HMAC no frontend.
// =============================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ADMIN_KEY = 'onb:admin_token'

export const getAdminToken = () => localStorage.getItem(ADMIN_KEY) || ''
const setAdminToken = (t) => (t ? localStorage.setItem(ADMIN_KEY, t) : localStorage.removeItem(ADMIN_KEY))
export const adminLogout = () => setAdminToken('')

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` }
}

async function parseJson(res) {
  const raw = await res.text()
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return { raw }
  }
}

// -------------------------------------------------------------
//  LOGIN  → guarda admin_token no localStorage
//  A credencial REAL (e-mail/senha da equipe) mora só no n8n — nunca no
//  frontend. O mock abaixo usa um valor de teste só para exercitar a UI.
// -------------------------------------------------------------
const MOCK_ADMIN_EMAIL = 'admin@teste.com'
const MOCK_ADMIN_PASSWORD = 'teste123'

export async function adminLogin(email, password) {
  if (CONFIG.USE_MOCK || !CONFIG.ADMIN_LOGIN_ENDPOINT) {
    await sleep(450)
    if (email !== MOCK_ADMIN_EMAIL || password !== MOCK_ADMIN_PASSWORD) {
      throw new Error('E-mail ou senha incorretos.')
    }
    setAdminToken('mock-admin-token')
    return { admin_token: 'mock-admin-token' }
  }
  const res = await fetch(CONFIG.ADMIN_LOGIN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (res.status === 401) throw new Error('E-mail ou senha incorretos.')
  if (!res.ok) throw new Error(`Login respondeu ${res.status}`)
  const data = await parseJson(res)
  if (!data.admin_token) throw new Error('Resposta de login sem admin_token.')
  setAdminToken(data.admin_token)
  return data
}

// -------------------------------------------------------------
//  LISTA DE CLIENTES (tasks do ClickUp) para o gerador de link
// -------------------------------------------------------------
export async function listClients() {
  if (CONFIG.USE_MOCK || !CONFIG.ADMIN_CLIENTS_ENDPOINT) {
    await sleep(500)
    return [
      { task_id: '86a1b2c3', company_name: 'Demo Cleaning LLC', niche: 'House Cleaning', status: 'draft' },
      { task_id: '86a4d5e6', company_name: 'Patriot HVAC', niche: 'HVAC', status: 'submitted' },
      { task_id: '86a7f8g9', company_name: 'GreenLeaf Landscaping', niche: 'Landscaping', status: 'locked' },
    ]
  }
  const res = await fetch(CONFIG.ADMIN_CLIENTS_ENDPOINT, { headers: authHeaders() })
  if (!res.ok) throw new Error(`Clientes respondeu ${res.status}`)
  const data = await parseJson(res)
  return Array.isArray(data) ? data : data.clients || []
}

// -------------------------------------------------------------
//  MINTA O TOKEN ASSINADO (n8n assina com HMAC) e devolve o link
// -------------------------------------------------------------
export async function mintToken(taskId) {
  if (CONFIG.USE_MOCK || !CONFIG.ADMIN_TOKEN_ENDPOINT) {
    await sleep(400)
    const token = `${taskId}.mockSig` // no real, vem assinado pelo n8n
    return { token, link: buildClientLink(token) }
  }
  const res = await fetch(CONFIG.ADMIN_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ task_id: taskId }),
  })
  if (!res.ok) throw new Error(`Geração de token respondeu ${res.status}`)
  const data = await parseJson(res)
  const token = data.token
  return { token, link: data.link || buildClientLink(token) }
}

// -------------------------------------------------------------
//  LIBERAR REENVIO (unlock) — reseta a janela de 1h
// -------------------------------------------------------------
export async function unlock(token) {
  if (CONFIG.USE_MOCK || !CONFIG.ADMIN_UNLOCK_ENDPOINT) {
    await sleep(450)
    return { ok: true }
  }
  const res = await fetch(CONFIG.ADMIN_UNLOCK_ENDPOINT, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ token }),
  })
  if (!res.ok) throw new Error(`Unlock respondeu ${res.status}`)
  return parseJson(res)
}
