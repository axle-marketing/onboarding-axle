// Passos do wizard, em ordem. 'welcome' e 'review' não têm validação de campos.
export const STEPS = [
  { id: 'welcome', title: 'Boas-vindas', short: 'Início' },
  { id: 'company', title: 'Empresa & responsável', short: 'Empresa' },
  { id: 'google', title: 'Conta Google', short: 'Google' },
  { id: 'email', title: 'E-mail profissional', short: 'E-mail' },
  { id: 'gbp', title: 'Google Business Profile', short: 'Perfil' },
  { id: 'lsa', title: 'Local Services Ads', short: 'LSA' },
  { id: 'review', title: 'Revisão & envio', short: 'Revisão' },
]

export const stepIndex = (id) => STEPS.findIndex((s) => s.id === id)
