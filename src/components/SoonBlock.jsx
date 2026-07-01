import { Wrench } from 'lucide-react'

// Placeholder de seção que será construída em fase posterior (apenas durante o desenvolvimento).
export default function SoonBlock({ title, children }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/40">
      <div className="flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-300">
        <Wrench size={15} /> {title}
      </div>
      {children && <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{children}</p>}
    </div>
  )
}
