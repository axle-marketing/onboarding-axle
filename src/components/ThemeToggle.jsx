import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../state/theme'
import { cx } from '../lib/cx'

// Switch dark/light (lê o tema do contexto compartilhado).
export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Mudar para claro' : 'Mudar para escuro'}
      aria-label="Alternar tema"
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-stone-300 bg-stone-200 px-1 transition-colors dark:border-stone-600 dark:bg-stone-700"
    >
      <span
        className={cx(
          'flex h-6 w-6 items-center justify-center rounded-full bg-white text-stone-700 shadow transition-transform dark:bg-stone-900 dark:text-amber-300',
          isDark ? 'translate-x-6' : 'translate-x-0',
        )}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </span>
    </button>
  )
}
