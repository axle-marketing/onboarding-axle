// =============================================================
//  CONFIGURAÇÃO DOS WEBHOOKS / ENDPOINTS (n8n)
// =============================================================
//  O frontend é estático (GitHub Pages) e NÃO fala com DB/IA
//  diretamente — apenas com estes endpoints do n8n, que fazem
//  toda a orquestração (ClickUp, Supabase, Drive, Baserow) e a
//  validação/assinatura do token e do lock de reenvio.
//
//  Enquanto USE_MOCK = true, nada disso precisa estar preenchido:
//  o app simula tudo localmente (ver services/api.js e adminApi.js).
// =============================================================

export const CONFIG = {
  // ----- Endpoints do CLIENTE -----
  // GET  ?token=  -> { client, draft, status, submitted_at, unlocked }
  LOAD_ENDPOINT: '',
  // POST { token, request_id, draft }            -> 200 | { error:'locked' }
  SAVE_ENDPOINT: '',
  // POST { token, category, filename, mime, data_base64 } -> { file_id, url, name }
  UPLOAD_ENDPOINT: '',
  // POST { token, request_id, onboarding }       -> { ok, status, submitted_at } | { error:'locked' }
  SUBMIT_ENDPOINT: '',

  // ----- Endpoints da ÁREA ADMIN -----
  // POST { email, password }     -> { admin_token }
  ADMIN_LOGIN_ENDPOINT: 'https://webhooks.axlemarketingroup.online/webhook/admin/login',
  // GET  (Authorization: token)  -> [{ task_id, company_name, niche, status }]
  // Query "squad=usa" fixo aqui pra rotear no n8n só os clientes do squad
  // americano do ClickUp (reaproveitável no futuro pra squad BR trocando o valor).
  ADMIN_CLIENTS_ENDPOINT: 'https://webhooks.axlemarketingroup.online/webhook/clients/clickup?squad=usa',
  // POST { task_id }             -> { token, link }   (n8n assina o token com HMAC)
  ADMIN_TOKEN_ENDPOINT: '',
  // POST { token }               -> { ok }            (libera reenvio / reseta a janela)
  ADMIN_UNLOCK_ENDPOINT: '',

  // ----- Comportamento -----
  AUTOSAVE_DEBOUNCE_MS: 1200,
  // Janela em que o cliente ainda pode corrigir e reenviar após o 1º envio.
  RESEND_WINDOW_MS: 60 * 60 * 1000, // 1 hora

  // Master switch: true = simula TUDO localmente (sem n8n).
  // false = cada chamada usa o endpoint real SE ele estiver preenchido;
  // os que continuam vazios (LOAD/SAVE/UPLOAD/SUBMIT etc.) caem no mock
  // automaticamente — dá pra ligar só o login admin sem esperar o resto.
  USE_MOCK: false,
}
