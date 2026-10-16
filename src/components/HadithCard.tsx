import { useState } from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'
import type { Hadith } from '../types/Hadith'
import { SourceBadge } from './SourceBadge'
import { WhatsAppPreview } from './WhatsAppPreview'

const fields = [
  ['العنوان', 'title', '📝'], ['الراوي', 'narrator', '👤'], ['المصدر', 'sourceName', '📚'], ['الكتاب', 'book', '📖'], ['المجلد', 'volume', '📕'], ['الصفحة', 'page', '📄'], ['رقم الحديث', 'hadithNumber', '🔢'], ['السند', 'chain', '⛓️'], ['التصنيف', 'grading', '✦'],
] as const

export function HadithCard({ hadith, onFormat }: { hadith: Hadith; onFormat: (hadith: Hadith) => void }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#d9dfd8] bg-white shadow-[0_10px_30px_rgba(15,81,50,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0eb] px-5 py-4"><SourceBadge sourceId={hadith.sourceId} /><span className="flex items-center gap-1.5 text-xs font-medium text-[#718078]"><BookOpen size={14} /> نتيجة موثقة من المصدر</span></div>
      <div className="p-5 sm:p-6">
        <p dir="auto" className="font-arabic text-[1.15rem] leading-[2] text-ink">{hadith.text}</p>
        <div className="mt-5 grid gap-x-6 gap-y-3 border-t border-[#edf0eb] pt-5 sm:grid-cols-2">
          {fields.map(([label, key, icon]) => { const value = hadith[key]; return value ? <div key={key} className="flex gap-2 text-sm"><span aria-hidden="true">{icon}</span><span className="font-bold text-[#718078]">{label}:</span><span className="min-w-0 break-words text-ink">{value}</span></div> : null })}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => onFormat(hadith)} className="rounded-xl border border-forest px-4 py-2.5 text-sm font-bold text-forest transition hover:bg-[#f1f7f2]">إنشاء تنسيق واتساب</button>{hadith.url ? <a href={hadith.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-gold underline decoration-gold/40 underline-offset-4 hover:text-forest">المصدر الأصلي <ExternalLink size={15} /></a> : <span className="text-xs text-[#87928b]">الرابط الأصلي غير متاح</span>}</div>
      </div>
    </article>
  )
}

interface HadithResultWithPreviewProps {
  hadith: Hadith
  onFormat: (hadith: Hadith) => void
}

export function HadithResultWithPreview({ hadith, onFormat }: HadithResultWithPreviewProps) {
  const [sequence, setSequence] = useState(hadith.id)
  const [title, setTitle] = useState(hadith.title ?? '')

  return <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"><HadithCard hadith={hadith} onFormat={onFormat} /><WhatsAppPreview hadith={hadith} sequence={sequence} title={title} onSequenceChange={setSequence} onTitleChange={setTitle} /></div>
}
