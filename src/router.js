// Roteamento minimalista por hash — seguro no GitHub Pages (não exige rewrite no servidor).
//
//   #/admin                 -> área administrativa (login + ferramentas)
//   (default) ?t=<token>    -> onboarding do cliente
//
// O token também é aceito dentro do hash (#/o?t=...) para flexibilidade de compartilhamento.

export function getRoute() {
  const rawHash = window.location.hash.replace(/^#\/?/, '') // 'admin', 'o?t=...', ''
  const [path, hashQuery = ''] = rawHash.split('?')

  if (path.toLowerCase().startsWith('admin')) {
    return { name: 'admin' }
  }

  const search = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(hashQuery)
  const token = (search.get('t') || hashParams.get('t') || '').trim()
  return { name: 'client', token }
}

// Assina mudanças de rota (hash). Retorna um cleanup.
export function onRouteChange(cb) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

// Monta o link público do cliente a partir de um token assinado.
export function buildClientLink(token) {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`
  return `${base}?t=${encodeURIComponent(token)}`
}

// Navega para a área admin (usado por um link discreto no rodapé).
export function goToAdmin() {
  window.location.hash = '#/admin'
}
