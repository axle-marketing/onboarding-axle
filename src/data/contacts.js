// =============================================================
//  CONTATOS DA EQUIPE
//  Usados na tela de "formulário travado" (LockedScreen) e na
//  tela de link inválido. Trocar os números aqui reflete em todo
//  o app.
// =============================================================

export const MANAGER = {
  name: 'Vinicius Sousa',
  role: 'Manager',
  // Formato wa.me: DDI + DDD + número, só dígitos (Brasil: 55 35 9 9836-9983).
  whatsapp: '5535998369983',
}

export const OWNER = {
  name: 'João Cabral',
  role: 'Owner',
  // Formato E.164 para o link tel: (EUA, Boston 617).
  phone: '+16172737503',
  phoneDisplay: '+1 (617) 273-7503',
}

// Link de WhatsApp com mensagem pré-pronta pedindo liberação de reenvio.
export function whatsappResendLink({ company = '', token = '' } = {}) {
  const msg =
    `Olá ${MANAGER.name.split(' ')[0]}! Sou ${company || 'cliente da Axle'} e gostaria de ` +
    `solicitar a liberação para reenviar meu formulário de onboarding.` +
    (token ? ` (ref: ${token})` : '')
  return `https://wa.me/${MANAGER.whatsapp}?text=${encodeURIComponent(msg)}`
}

// Link tel: para ligar para o Owner.
export function ownerCallLink() {
  return `tel:${OWNER.phone}`
}
