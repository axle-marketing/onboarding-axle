import Brand from './Brand'
import ThemeToggle from './ThemeToggle'
import { cx } from '../lib/cx'

// Layout centralizado para telas de estado (carregando, link inválido, travado, enviado).
export default function ScreenShell({ children, maxWidth = 'max-w-md' }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <Brand />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className={cx('w-full animate-fade-in', maxWidth)}>{children}</div>
      </main>
    </div>
  )
}
