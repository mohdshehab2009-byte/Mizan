import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface SearchBarProps {
  value: string
  loading: boolean
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
}

export function SearchBar({ value, loading, onChange, onSearch, onClear }: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  return (
    <form className={`relative rounded-2xl border bg-white p-2 shadow-[0_12px_35px_rgba(15,81,50,0.08)] transition ${focused ? 'border-gold ring-4 ring-gold/10' : 'border-[#d9dfd8]'}`} onSubmit={(event) => { event.preventDefault(); onSearch() }}>
      <div className="flex items-center gap-2">
        <Search className="ml-3 shrink-0 text-gold" size={22} />
        <input dir="auto" value={value} onChange={(event) => onChange(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={loading} className="min-w-0 flex-1 bg-transparent px-2 py-4 text-base text-ink outline-none placeholder:text-[#87928b]" placeholder="اكتب جزءًا من الحديث... مثال: إنما الأعمال بالنيات" aria-label="البحث عن حديث" />
        {value && <button type="button" onClick={onClear} className="rounded-lg p-2 text-[#87928b] hover:bg-parchment hover:text-ink" aria-label="مسح البحث"><X size={18} /></button>}
        <button type="submit" disabled={loading} className="flex shrink-0 items-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b4229] disabled:cursor-wait disabled:opacity-70">
          {loading ? <span className="spinner" /> : <Search size={17} />}
          <span className="hidden sm:inline">بحث</span>
        </button>
      </div>
    </form>
  )
}
