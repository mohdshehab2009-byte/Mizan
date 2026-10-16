import { MessageCircle } from 'lucide-react'
import type { Hadith } from '../types/Hadith'
import { formatWhatsApp } from '../utils/formatWhatsApp'
import { CopyButton } from './CopyButton'

interface WhatsAppPreviewProps {
  hadith: Hadith
  sequence: string
  title: string
  onSequenceChange: (value: string) => void
  onTitleChange: (value: string) => void
}

export function WhatsAppPreview({ hadith, sequence, title, onSequenceChange, onTitleChange }: WhatsAppPreviewProps) {
  const formatted = formatWhatsApp(hadith, { sequence: sequence || hadith.id, title: title || hadith.title || '' })
  return (
    <aside className="sticky top-6 rounded-2xl border border-[#d9dfd8] bg-white p-5 shadow-[0_12px_35px_rgba(15,81,50,0.06)]">
      <div className="mb-4 flex items-center gap-3 border-b border-[#edf0eb] pb-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e4f2e7] text-forest"><MessageCircle size={19} /></span><div><h2 className="font-display text-lg font-extrabold text-ink">معاينة واتساب</h2><p className="text-xs text-[#718078]">جاهز للمشاركة</p></div></div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="text-xs font-bold text-[#718078]">رقم التسلسل<input value={sequence} onChange={(event) => onSequenceChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d9dfd8] px-3 py-2 text-sm text-ink outline-none focus:border-gold" inputMode="numeric" /></label>
        <label className="text-xs font-bold text-[#718078]">عنوان الحديث<input value={title || hadith.title || ''} onChange={(event) => onTitleChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d9dfd8] px-3 py-2 text-sm text-ink outline-none focus:border-gold" placeholder="مثال: كان في حرز الله" /></label>
      </div>
      <pre dir="auto" className="mb-4 max-h-[450px] overflow-auto whitespace-pre-wrap rounded-xl bg-[#f2f7f1] p-4 font-sans text-sm leading-6 text-ink">{formatted}</pre>
      <CopyButton text={formatted} />
    </aside>
  )
}
