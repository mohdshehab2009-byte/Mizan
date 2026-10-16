import { ShieldCheck } from 'lucide-react'
import { sourceById } from '../config/sources'
import type { SourceId } from '../types/Source'

export function SourceBadge({ sourceId }: { sourceId: SourceId }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-[#fffaf0] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-forest">
      <ShieldCheck size={14} strokeWidth={2.5} />
      <span>المصدر: {sourceById(sourceId)?.name}</span>
    </div>
  )
}
