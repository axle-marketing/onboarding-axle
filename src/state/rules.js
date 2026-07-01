// =============================================================
//  REGRAS DE OBRIGATORIEDADE / VALIDAÇÃO POR PASSO
// =============================================================
//  Filosofia: MÁXIMA flexibilidade. Quase tudo pode ser "ainda não
//  tenho" (vira pendência, não bloqueia). Só bloqueiam o avanço os
//  campos genuinamente essenciais.
//
//  Para mudar o que é obrigatório, edite SÓ este arquivo.
// =============================================================

import { STEPS } from './steps'
import { resolveCommercialEmail } from './draft'

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())
const filled = (v) => String(v ?? '').trim().length > 0

// Retorna { ok, errors:{campo:mensagem} } para um passo.
export function validateStep(id, draft) {
  const errors = {}
  const req = (cond, field, msg) => {
    if (!cond) errors[field] = msg
  }

  switch (id) {
    case 'company': {
      req(filled(draft.company_exists), 'company_exists', 'Selecione uma opção.')
      // Nome do responsável é SEMPRE obrigatório, mesmo sem empresa criada.
      req(filled(draft.owner_name), 'owner_name', 'Informe o nome do responsável (Owner).')
      break
    }

    case 'google': {
      const g = draft.google_account
      req(filled(g.has_account), 'has_account', 'Selecione uma opção.')
      if (g.has_account === 'yes') {
        req(filled(g.email), 'email', 'Informe o e-mail da conta Google.')
        if (filled(g.email)) req(isEmail(g.email), 'email', 'E-mail inválido.')
      }
      break
    }

    case 'email': {
      const e = draft.professional_email
      req(filled(e.wants), 'wants', 'Selecione uma opção.')
      if (e.wants === 'yes') {
        req(filled(e.has_domain), 'has_domain', 'Selecione uma opção.')
        if (e.has_domain === 'yes') req(filled(e.domain), 'domain', 'Informe o domínio.')
      }
      break
    }

    case 'gbp': {
      const g = draft.gbp
      req(filled(g.already_exists), 'already_exists', 'Selecione uma opção.')
      if (g.already_exists === 'no') {
        if (!g.business_name_pending)
          req(filled(g.business_name), 'business_name', 'Informe o nome oficial ou marque "ainda não definido".')
        if (!g.address.pending) {
          req(filled(g.address.line1), 'address.line1', 'Informe o endereço ou marque "ainda não tenho".')
          req(filled(g.address.city), 'address.city', 'Informe a cidade.')
          req(filled(g.address.state), 'address.state', 'Selecione o estado.')
          req(filled(g.address.zip), 'address.zip', 'Informe o ZIP.')
        }
      }
      req(filled(g.service_area.state), 'service_area.state', 'Selecione o estado da área de cobertura.')
      break
    }

    case 'lsa': {
      const resolvedOwner = draft.lsa.owner_name || draft.owner_name
      req(filled(resolvedOwner), 'owner_name', 'Informe o nome do Owner.')
      // Fieldworkers: linhas preenchidas precisam de e-mail válido (o Google pedirá o e-mail de cada um).
      draft.lsa.fieldworkers.forEach((fw, i) => {
        if (filled(fw.name) || filled(fw.email)) {
          if (!isEmail(fw.email)) errors[`fieldworkers.${i}.email`] = 'E-mail inválido.'
        }
      })
      break
    }

    default:
      break // welcome / review não bloqueiam
  }

  return { ok: Object.keys(errors).length === 0, errors }
}

// O envio só é liberado se TODOS os passos com validação estiverem ok.
export function allValid(draft) {
  return STEPS.every((s) => validateStep(s.id, draft).ok)
}

// Passos que ainda têm erro (para destacar no stepper / na revisão).
export function invalidSteps(draft) {
  return STEPS.filter((s) => !validateStep(s.id, draft).ok).map((s) => s.id)
}

// Reexport útil para componentes do passo LSA.
export { resolveCommercialEmail }
