import { useState } from 'react'
import { Lock, LogOut, Loader2 } from 'lucide-react'
import ScreenShell from '../components/ScreenShell'
import Brand from '../components/Brand'
import ThemeToggle from '../components/ThemeToggle'
import TextField from '../components/fields/TextField'
import { adminLogin, adminLogout, getAdminToken } from '../services/adminApi'
import LinkGenerator from './LinkGenerator'
import Submissions from './Submissions'

// Área da equipe. NOTA: o login aqui é só UX — a autorização real é validada
// no n8n em cada endpoint admin. As ferramentas completas (gerador de link,
// envios, liberar reenvio) entram na Fase 8.
export default function AdminApp() {
  const [authed, setAuthed] = useState(!!getAdminToken())

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-800">
        <Brand subtitle="Área da equipe" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              adminLogout()
              setAuthed(false)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <LogOut size={14} /> Sair
          </button>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6">
        <LinkGenerator />
        <Submissions />
      </main>
    </div>
  )
}

function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await adminLogin(email, pw)
      onSuccess()
    } catch (ex) {
      setErr(ex.message || 'Falha no login.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ScreenShell>
      <form
        onSubmit={submit}
        className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            <Lock size={18} />
          </span>
          <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">Área da equipe</h1>
        </div>
        <div className="space-y-3">
          <TextField
            label="E-mail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={setEmail}
            placeholder="voce@axlemarketinggroup.com"
          />
          <TextField
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={pw}
            onChange={setPw}
            placeholder="••••••••"
            error={err}
          />
        </div>
        <button
          type="submit"
          disabled={busy || !email || !pw}
          className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
        >
          {busy && <Loader2 className="animate-spin" size={16} />}
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="mt-3 text-[11px] text-stone-400">
          Acesso restrito à equipe Axle. A autorização é validada no servidor (n8n).
        </p>
      </form>
    </ScreenShell>
  )
}
