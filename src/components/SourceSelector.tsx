import { Check, ExternalLink } from 'lucide-react'
import { searchSources } from '../config/sources'
import type { SourceId } from '../types/Source'

interface SourceSelectorProps {
  selected: SourceId[]
  onChange: (source: SourceId) => void
}

export function SourceSelector({ selected, onChange }: SourceSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-bold text-ink">مصادر البحث</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {searchSources.map((source) => {
          const isSelected = selected.includes(source.id)
          return (
            <label key={source.id} className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${isSelected ? 'border-forest bg-[#f1f7f2] shadow-sm' : 'border-[#d9dfd8] bg-white hover:border-gold'}`}>
              <span className="flex items-center gap-3">
                <input className="sr-only" type="checkbox" checked={isSelected} onChange={() => onChange(source.id)} />
                <span className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected ? 'border-forest bg-forest text-white' : 'border-[#a8b2aa] bg-white'}`} aria-hidden="true">
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="font-semibold text-ink">{source.name}</span>
              </span>
              {'url' in source && <a href={source.url} target="_blank" rel="noreferrer" aria-label="فتح نور الحوزة" className="text-[#718078] transition hover:text-forest"><ExternalLink size={16} /></a>}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
