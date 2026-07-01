import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { setIn, getIn } from './draft'
import { useAutosave } from './useAutosave'

// Contexto único do formulário: draft + helpers de escrita + estado do autosave.
const Ctx = createContext(null)

export function OnboardingProvider({ initial, token, enabled, client, onLocked, children }) {
  const [draft, setDraft] = useState(initial)

  // set('gbp.address.city', 'Boston')
  const set = useCallback((path, value) => setDraft((d) => setIn(d, path, value)), [])
  // merge('gbp.address', { city:'Boston', zip:'02118' })
  const merge = useCallback(
    (path, partial) => setDraft((d) => setIn(d, path, { ...(getIn(d, path) || {}), ...partial })),
    [],
  )

  const saveState = useAutosave(draft, { token, enabled, onLocked })

  const value = useMemo(
    () => ({ draft, set, merge, setDraft, saveState, client, token }),
    [draft, saveState, client, token, set, merge],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useOnboarding() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useOnboarding deve ser usado dentro de <OnboardingProvider>')
  return ctx
}
