// Marca da Axle: glifo "A" (pico) + wordmark, herdando a cor do tema (ink/paper).
export default function Brand({ subtitle }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 64 64"
        className="h-7 w-7 shrink-0 text-ink dark:text-paper"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M32 10 L56 54 L45 54 L32 31 L19 54 L8 54 Z" />
      </svg>
      <div className="leading-tight">
        <div className="font-display text-[15px] font-bold uppercase tracking-[0.14em] text-ink dark:text-paper">
          Axle
        </div>
        {subtitle ? (
          <div className="mt-0.5 text-[11px] text-stone-400">{subtitle}</div>
        ) : (
          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-eyebrow text-stone-400">
            Onboarding
          </div>
        )}
      </div>
    </div>
  )
}
