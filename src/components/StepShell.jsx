// Cabeçalho + corpo de um passo do wizard (ícone, título, descrição, conteúdo).
export default function StepShell({ icon: Icon, title, description, children }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
            <Icon size={20} />
          </span>
        )}
        <div>
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}
