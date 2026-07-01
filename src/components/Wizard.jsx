import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Send, Loader2, Check, AlertTriangle } from 'lucide-react'
import Brand from './Brand'
import ThemeToggle from './ThemeToggle'
import Stepper from './Stepper'
import { cx } from '../lib/cx'
import { useOnboarding } from '../state/onboarding'
import { STEPS } from '../state/steps'
import { validateStep, allValid, invalidSteps } from '../state/rules'
import { toPayload } from '../state/draft'
import { submitOnboarding } from '../services/api'
import { clearLocalDraft } from '../state/useAutosave'
import WelcomeStep from './steps/WelcomeStep'
import CompanyStep from './steps/CompanyStep'
import GoogleStep from './steps/GoogleStep'
import EmailStep from './steps/EmailStep'
import GbpStep from './steps/GbpStep'
import LsaStep from './steps/LsaStep'
import ReviewStep from './steps/ReviewStep'

const STEP_COMPONENTS = {
  welcome: WelcomeStep,
  company: CompanyStep,
  google: GoogleStep,
  email: EmailStep,
  gbp: GbpStep,
  lsa: LsaStep,
  review: ReviewStep,
}

function AutosaveBadge({ state }) {
  const base = 'inline-flex items-center gap-1 text-xs font-medium'
  if (state === 'saving')
    return (
      <span className={cx(base, 'text-stone-400')}>
        <Loader2 className="animate-spin" size={13} /> Salvando…
      </span>
    )
  if (state === 'saved')
    return (
      <span className={cx(base, 'text-emerald-500')}>
        <Check size={13} /> Salvo
      </span>
    )
  if (state === 'error')
    return (
      <span className={cx(base, 'text-rose-500')}>
        <AlertTriangle size={13} /> Erro ao salvar
      </span>
    )
  return null
}

export default function Wizard({ alreadySubmitted, onSubmitted, onLocked }) {
  const { draft, client, token, saveState } = useOnboarding()
  const [idx, setIdx] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const step = STEPS[idx]
  const isLast = idx === STEPS.length - 1
  const { ok, errors } = useMemo(() => validateStep(step.id, draft), [step.id, draft])
  const invalid = useMemo(() => invalidSteps(draft), [draft])
  const company = client?.company_name

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  function goNext() {
    if (!ok) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setIdx((i) => Math.min(i + 1, STEPS.length - 1))
    scrollTop()
  }
  function goBack() {
    setShowErrors(false)
    setIdx((i) => Math.max(i - 1, 0))
    scrollTop()
  }
  function jump(i) {
    setShowErrors(false)
    setIdx(i)
    scrollTop()
  }

  async function submit() {
    if (!allValid(draft)) {
      const firstBad = STEPS.findIndex((s) => invalid.includes(s.id))
      setShowErrors(true)
      if (firstBad >= 0) {
        setIdx(firstBad)
        scrollTop()
      }
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await submitOnboarding(token, toPayload(draft, client))
      clearLocalDraft(token)
      onSubmitted?.(res)
    } catch (e) {
      if (e?.locked) {
        onLocked?.()
        return
      }
      setSubmitError(e?.message || 'Falha ao enviar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const StepComp = STEP_COMPONENTS[step.id]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header fixo: marca + autosave + tema + stepper */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/85 backdrop-blur dark:border-stone-800 dark:bg-stone-950/85">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Brand subtitle={company} />
          <div className="flex items-center gap-3">
            <AutosaveBadge state={saveState} />
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <Stepper steps={STEPS} current={idx} onJump={jump} invalid={showErrors ? invalid : []} />
        </div>
      </header>

      {/* Conteúdo do passo */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {alreadySubmitted && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            Você já enviou este formulário. Reenviar vai <strong>substituir</strong> o envio anterior.
          </div>
        )}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900">
          <StepComp errors={showErrors ? errors : {}} />
        </div>
        {submitError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle size={15} /> {submitError}
          </div>
        )}
      </main>

      {/* Navegação fixa */}
      <footer className="sticky bottom-0 z-20 border-t border-stone-200 bg-white/85 backdrop-blur dark:border-stone-800 dark:bg-stone-950/85">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={goBack}
            disabled={idx === 0}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
              idx === 0
                ? 'cursor-not-allowed text-stone-300 dark:text-stone-700'
                : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800',
            )}
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          {isLast ? (
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl btn-primary px-5 py-2.5 text-sm font-bold shadow-sm disabled:opacity-70"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              {submitting ? 'Enviando…' : 'Enviar onboarding'}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-1.5 rounded-xl btn-primary px-5 py-2.5 text-sm font-bold shadow-sm"
            >
              Próximo <ChevronRight size={16} />
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
