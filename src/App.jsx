import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { CONFIG } from './config'
import { loadDraft } from './services/api'
import { blankDraft } from './state/draft'
import { OnboardingProvider } from './state/onboarding'
import { loadLocalDraft } from './state/useAutosave'
import LoadingScreen from './screens/LoadingScreen'
import InvalidLinkScreen from './screens/InvalidLinkScreen'
import LockedScreen from './screens/LockedScreen'
import SubmittedScreen from './screens/SubmittedScreen'
import ScreenShell from './components/ScreenShell'
import ContactButtons from './components/ContactButtons'
import Wizard from './components/Wizard'

// ---- helpers de hidratação do rascunho ----
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x)
function deepMerge(a, b) {
  if (b == null) return a
  if (!isObj(a) || !isObj(b)) return b
  const out = { ...a }
  for (const k of Object.keys(b)) out[k] = isObj(a[k]) && isObj(b[k]) ? deepMerge(a[k], b[k]) : b[k]
  return out
}

// O cliente pode editar? (rascunho, ou enviado mas dentro da janela de 1h, ou liberado)
function windowEnd(submittedAt) {
  return submittedAt ? new Date(submittedAt).getTime() + CONFIG.RESEND_WINDOW_MS : 0
}
function isEditable(d) {
  if (!d.status || d.status === 'draft') return true
  if (d.unlocked) return true
  if (d.status === 'submitted' && d.submitted_at) return Date.now() < windowEnd(d.submitted_at)
  return false
}

export default function App({ token }) {
  const [phase, setPhase] = useState('loading') // loading|invalid|error|wizard|locked|submitted
  const [server, setServer] = useState(null)
  const [initialDraft, setInitialDraft] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setPhase('invalid')
      return
    }
    let alive = true
    setPhase('loading')
    loadDraft(token)
      .then((data) => {
        if (!alive) return
        setServer(data)
        const local = loadLocalDraft(token)
        const fresh = local || data.draft || null
        setInitialDraft(deepMerge(blankDraft(), fresh))
        setPhase(isEditable(data) ? 'wizard' : 'locked')
      })
      .catch((e) => {
        if (!alive) return
        setErrorMsg(e?.message || 'Falha ao carregar.')
        setPhase(e?.notFound ? 'invalid' : 'error')
      })
    return () => {
      alive = false
    }
  }, [token])

  const company = server?.client?.company_name || ''

  // Reabertura dentro da janela de 1h após enviar.
  const minutesLeft = useMemo(() => {
    if (!server?.submitted_at) return 0
    return Math.max(0, Math.round((windowEnd(server.submitted_at) - Date.now()) / 60000))
  }, [server, phase])

  function handleSubmitted(result) {
    setServer((s) => ({ ...s, status: result.status, submitted_at: result.submitted_at }))
    setPhase('submitted')
  }

  // Reabrir dentro da janela: recarrega o rascunho do localStorage (autosave) e volta ao wizard.
  function reopen() {
    setInitialDraft(deepMerge(blankDraft(), loadLocalDraft(token) || server?.draft))
    setPhase('wizard')
  }

  if (phase === 'loading') return <LoadingScreen />
  if (phase === 'invalid') return <InvalidLinkScreen />

  if (phase === 'error') {
    return (
      <ScreenShell>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
            <AlertTriangle size={22} />
          </div>
          <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">Não foi possível carregar</h1>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-stone-500 dark:text-stone-400">
            {errorMsg} Tente recarregar a página ou fale com a equipe.
          </p>
          <div className="mt-5">
            <ContactButtons company={company} token={token} />
          </div>
        </div>
      </ScreenShell>
    )
  }

  if (phase === 'locked') return <LockedScreen company={company} token={token} />

  if (phase === 'submitted') {
    return (
      <SubmittedScreen
        company={company}
        canReopen={minutesLeft > 0}
        minutesLeft={minutesLeft}
        onReopen={reopen}
      />
    )
  }

  // phase === 'wizard'
  return (
    <OnboardingProvider
      initial={initialDraft}
      token={token}
      enabled
      client={server?.client || null}
      onLocked={() => setPhase('locked')}
    >
      <Wizard
        alreadySubmitted={server?.status === 'submitted'}
        onSubmitted={handleSubmitted}
        onLocked={() => setPhase('locked')}
      />
    </OnboardingProvider>
  )
}
