import { BookOpenCheck, Sparkles } from 'lucide-react'
import type { Hadith } from '../types/Hadith'
import { CopyButton } from './CopyButton'
import { formatWhatsApp } from '../utils/formatWhatsApp'

interface DailyHadithCardProps {
  hadith: Hadith
  dayKey: string
}

export function DailyHadithCard({ hadith, dayKey }: DailyHadithCardProps) {
  const formatted = formatWhatsApp(hadith, {
    sequence: hadith.id,
    title: hadith.title || 'حديث',
  })
  const date = new Date(`${dayKey}T12:00:00`).toLocaleDateString('ar')

  return (
    <article className="overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-[0_15px_40px_rgba(15,81,50,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0eb] bg-[#fffaf0] px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-gold"><Sparkles size={20} /></span>
          <div>
            <h2 className="font-display text-lg font-extrabold text-forest">حديث اليوم</h2>
            <p className="text-xs text-[#718078]">{date}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-forest"><BookOpenCheck size={15} /> يتجدد يوميًا</span>
      </div>
      <div className="p-5 sm:p-7">
        {hadith.title && <p className="mb-3 text-sm font-bold text-gold">{hadith.title}</p>}
        <p dir="auto" className="font-arabic text-xl leading-[2] text-ink">{hadith.text}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#edf0eb] pt-4 text-sm">
          {hadith.narrator && <p><span className="font-bold text-[#718078]">الراوي:</span> {hadith.narrator}</p>}
          <p><span className="font-bold text-[#718078]">المصدر:</span> {hadith.sourceName}</p>
          {hadith.volume && <p><span className="font-bold text-[#718078]">المجلد:</span> {hadith.volume}</p>}
          {hadith.page && <p><span className="font-bold text-[#718078]">الصفحة:</span> {hadith.page}</p>}
        </div>
        <div className="mt-5"><CopyButton text={formatted} /></div>
      </div>
    </article>
  )
}
