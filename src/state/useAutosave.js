import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import { saveDraft } from '../services/api'

export const draftKey = (token) => `onb:draft:${token || 'anon'}`

// Lê o rascunho espelhado em localStorage (rede do servidor pode falhar / mock).
export function loadLocalDraft(token) {
  try {
    const raw = localStorage.getItem(draftKey(token))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearLocalDraft(token) {
  try {
    localStorage.removeItem(draftKey(token))
  } catch {
    /* ignore */
  }
}

// Autosave debounced: espelha local na hora e dá POST no n8n após a pausa.
// Retorna 'idle' | 'saving' | 'saved' | 'error'.
export function useAutosave(draft, { token, enabled, onLocked }) {
  const [state, setState] = useState('idle')
  const skipFirst = useRef(true)
  const timer = useRef(null)

  useEffect(() => {
    if (!enabled) return
    // não salva na hidratação inicial
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }
    try {
      localStorage.setItem(draftKey(token), JSON.stringify(draft))
    } catch {
      /* quota cheia: segue só com o servidor */
    }
    setState('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        await saveDraft(token, draft)
        setState('saved')
      } catch (e) {
        setState('error')
        if (e?.locked) onLocked?.()
      }
    }, CONFIG.AUTOSAVE_DEBOUNCE_MS)

    return () => clearTimeout(timer.current)
  }, [draft, token, enabled, onLocked])

  return state
}
