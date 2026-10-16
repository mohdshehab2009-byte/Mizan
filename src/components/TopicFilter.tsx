import { useEffect, useState } from 'react'
import { ListFilter } from 'lucide-react'
import { searchHadithTopics } from '../services/searchService'

interface TopicFilterProps {
  value: string
  disabled: boolean
  onChange: (value: string) => void
}

export function TopicFilter({ value, disabled, onChange }: TopicFilterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true
    const timeout = window.setTimeout(() => {
      setLoading(true)
      setError('')
      searchHadithTopics(value)
        .then((topics) => {
          if (current) setSuggestions(topics)
        })
        .catch((topicError: unknown) => {
          if (current) setError(topicError instanceof Error ? topicError.message : 'تعذر تحميل الموضوعات.')
        })
        .finally(() => {
          if (current) setLoading(false)
        })
    }, value ? 200 : 0)

    return () => {
      current = false
      window.clearTimeout(timeout)
    }
  }, [value])

  return (
    <div className="mt-4">
      <label htmlFor="hadith-topic-filter" className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
        <ListFilter size={17} className="text-gold" />
        فهرس الموضوعات
      </label>
      <input
        id="hadith-topic-filter"
        list="hadith-topic-suggestions"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="اختر موضوعًا أو اكتب للبحث فيه"
        autoComplete="off"
        className="w-full rounded-xl border border-[#d9dfd8] bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-[#87928b] focus:border-gold focus:ring-4 focus:ring-gold/10 disabled:opacity-60"
        aria-describedby="hadith-topic-help"
      />
      <datalist id="hadith-topic-suggestions">
        {suggestions.map((topic) => <option key={topic} value={topic} />)}
      </datalist>
      <p id="hadith-topic-help" className="mt-2 text-xs leading-5 text-[#718078]" aria-live="polite">
        {error || (loading ? 'جارٍ تحميل الموضوعات...' : value ? 'اختر موضوعًا مطابقًا من الاقتراحات لتصفية النتائج.' : 'اكتب للبحث في فهرس الموضوعات.')}
      </p>
    </div>
  )
}
