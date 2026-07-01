import { MessageCircle, Phone } from 'lucide-react'
import { MANAGER, OWNER, whatsappResendLink, ownerCallLink } from '../data/contacts'

// Botões de contato com a equipe (WhatsApp do Manager + ligação para o Owner).
export default function ContactButtons({ company, token }) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      <a
        href={whatsappResendLink({ company, token })}
        target="_blank"
        rel="noreferrer"
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
      >
        <MessageCircle size={16} />
        WhatsApp · {MANAGER.name.split(' ')[0]}
      </a>
      <a
        href={ownerCallLink()}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
      >
        <Phone size={16} />
        Ligar · {OWNER.name.split(' ')[0]}
      </a>
    </div>
  )
}
