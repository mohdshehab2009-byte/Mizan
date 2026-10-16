import { useEffect, useState } from 'react'
import { AlertCircle, ArrowUpRight, BookOpen, Info, SearchCheck, Sparkles } from 'lucide-react'
import { SearchBar } from './components/SearchBar'
import { TopicFilter } from './components/TopicFilter'
import { DailyHadithCard } from './components/DailyHadithCard'
import { SourceSelector } from './components/SourceSelector'
import { HadithResultWithPreview } from './components/HadithCard'
import { approvedSources } from './config/sources'
import { getDailyHadith, searchSelectedSources } from './services/searchService'
import type { Hadith } from './types/Hadith'
import type { SourceId } from './types/Source'

function App() {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('')
  const [selectedSources, setSelectedSources] = useState<SourceId[]>(['mizan-database', 'noor-al-hawza'])
  const [results, setResults] = useState<Hadith[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null)
  const [dailyDate, setDailyDate] = useState('')
  const [dailyError, setDailyError] = useState('')
  const [dailyRetry, setDailyRetry] = useState(0)
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [sourceUnavailable, setSourceUnavailable] = useState(false)

  useEffect(() => {
    let active = true
    let requestedDate = ''

    const loadToday = () => {
      const now = new Date()
      const dateParts = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(now)
      const dateValues = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]))
      const localDate = `${dateValues.year}-${dateValues.month}-${dateValues.day}`
      if (requestedDate === localDate) return

      requestedDate = localDate
      setDailyHadith(null)
      setDailyDate('')
      setDailyError('')
      getDailyHadith(localDate)
        .then((hadith) => {
          if (active) {
            setDailyHadith(hadith)
            setDailyDate(localDate)
          }
        })
        .catch((dailyLoadError: unknown) => {
          if (active) {
            requestedDate = ''
            setDailyError(dailyLoadError instanceof Error ? dailyLoadError.message : 'تعذر تحميل حديث اليوم.')
          }
        })
    }

    loadToday()
    const interval = window.setInterval(loadToday, 60_000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [dailyRetry])

  const search = async () => {
    if (!query.trim() && !topic.trim()) { setError('اكتب جزءًا من الحديث أو اختر موضوعًا للبحث.'); return }
    if (!selectedSources.length) { setError('اختر مصدرًا واحدًا على الأقل.'); return }
    setLoading(true); setError(''); setSearched(true); setSelectedHadith(null)
    try {
      const response = await searchSelectedSources(query.trim(), selectedSources, topic.trim())
      setResults(response.results); setTotalResults(response.totalResults); setSourceUnavailable(response.unavailable)
    } catch (searchError) {
      setResults([]); setTotalResults(0); setSourceUnavailable(false)
      setError(searchError instanceof Error ? searchError.message : 'تعذر البحث في قاعدة البيانات.')
    } finally { setLoading(false) }
  }

  const clear = () => { setQuery(''); setTopic(''); setResults([]); setTotalResults(0); setSearched(false); setError(''); setSourceUnavailable(false); setSelectedHadith(null) }
  const toggleSource = (source: SourceId) => setSelectedSources((current) => current.includes(source) ? current.filter((id) => id !== source) : [...current, source])
  const noorHawzaUrl = approvedSources[0].url

  return <div dir="rtl" className="min-h-screen bg-parchment text-ink">
    <header className="border-b border-[#dbe4dc] bg-forest text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/50 bg-[#174f36] text-gold"><BookOpen size={21} /></span>
          <span className="font-display text-lg font-extrabold tracking-tight">البحث عن الحديث</span>
        </div>
        <div className="hidden items-center gap-2 text-xs font-bold text-[#c5d6ca] sm:flex"><SearchCheck size={16} className="text-gold" /> قاعدة بيانات Supabase</div>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
      <section className="max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e6f0e8] px-3 py-1.5 text-xs font-bold text-forest"><Sparkles size={14} className="text-gold" /> بحث موثوق</div>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-forest sm:text-5xl">اعثر على النص.<br /><span className="text-gold">وشاركه بأمانة.</span></h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#59665d]">ابحث في قاعدة بيانات ميزان الحكمة على Supabase وجهّز النتيجة للمشاركة عبر واتساب.</p>
      </section>
      <section className="mt-8" aria-label="حديث اليوم">
        {dailyHadith && <DailyHadithCard hadith={dailyHadith} dayKey={dailyDate} />}
        {!dailyHadith && !dailyError && <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#d9dfd8] bg-white p-6 text-sm font-bold text-forest"><span className="spinner spinner-dark" /> جارٍ تحميل حديث اليوم...</div>}
        {dailyError && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#efc5bd] bg-[#fff1ed] px-4 py-3 text-sm font-semibold text-[#a13c2c]">
          <span>{dailyError}</span>
          <button type="button" className="rounded-lg border border-[#a13c2c] px-3 py-1.5" onClick={() => setDailyRetry((retry) => retry + 1)}>إعادة المحاولة</button>
        </div>}
      </section>
      <section className="mt-9 rounded-3xl border border-[#d9dfd8] bg-[#fbfcfa] p-5 sm:p-7">
        <SearchBar value={query} loading={loading} onChange={(value) => { setQuery(value); if (error) setError('') }} onSearch={search} onClear={clear} />
        <TopicFilter value={topic} disabled={loading} onChange={(value) => { setTopic(value); if (error) setError('') }} />
        <div className="mt-6"><SourceSelector selected={selectedSources} onChange={toggleSource} /></div>
        <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#718078]">
          <Info className="mt-0.5 shrink-0 text-gold" size={15} />
          <span>تُجرى عمليات البحث في قاعدة البيانات على Supabase. يفتح نور الحوزة بشكل منفصل للتحقق اليدوي.</span>
        </div>
        {error && <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#fff1ed] px-4 py-3 text-sm font-semibold text-[#a13c2c]"><AlertCircle size={17} />{error}</div>}
      </section>
      {loading && <div className="mt-10 flex items-center justify-center gap-3 text-sm font-bold text-forest"><span className="spinner spinner-dark" /> جارٍ البحث في قاعدة البيانات...</div>}
      {!loading && searched && <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gold">نتائج البحث</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-forest">
              {results.length
                ? totalResults > results.length ? `عرض أفضل ${results.length} من ${totalResults} نتيجة` : `${totalResults} نتيجة`
                : 'لا توجد نتيجة'}
            </h2>
          </div>
          <span dir="auto" className="hidden text-sm text-[#718078] sm:block">{query ? `البحث عن: “${query}”` : `الموضوع: “${topic}”`}</span>
        </div>
        {sourceUnavailable && <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#eadcae] bg-[#fffaf0] p-4 text-sm text-[#6d5a21]">
          <AlertCircle className="mt-0.5 shrink-0" size={17} />
          <div><strong>تعذر الوصول إلى نور الحوزة للتحقق اليدوي.</strong><p className="mt-1">لا يزال بإمكانك استخدام النتائج الموجودة في قاعدة البيانات.</p></div>
        </div>}
        {results.length
          ? <div className="space-y-5">{results.map((hadith) => <HadithResultWithPreview key={hadith.id} hadith={hadith} onFormat={setSelectedHadith} />)}</div>
          : <div className="rounded-2xl border border-dashed border-[#bdcabe] bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4ee] text-forest"><SearchCheck size={24} /></div>
            <h3 className="mt-4 font-display text-xl font-extrabold text-forest">لم يتم العثور على حديث مطابق.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#718078]">جرّب عبارة أخرى أو تحقّق من الحديث مباشرة عبر نور الحوزة.</p>
            <a href={noorHawzaUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white hover:bg-[#0b4229]">فتح نور الحوزة <ArrowUpRight size={16} /></a>
          </div>}
      </section>}
      {!searched && <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#d9dfd8] bg-white p-5"><span className="text-2xl">١</span><h3 className="mt-4 font-bold text-forest">ابحث بدقة</h3><p className="mt-2 text-sm leading-6 text-[#718078]">تتعامل معالجة العربية مع التشكيل والمسافات واختلافات الحروف الشائعة.</p></div>
        <div className="rounded-2xl border border-[#d9dfd8] bg-white p-5"><span className="text-2xl">٢</span><h3 className="mt-4 font-bold text-forest">تحقق من المصدر</h3><p className="mt-2 text-sm leading-6 text-[#718078]">تحمل كل نتيجة عنوان الحديث ومصدره كما وردا في جدول البيانات.</p></div>
        <div className="rounded-2xl border border-[#d9dfd8] bg-white p-5"><span className="text-2xl">٣</span><h3 className="mt-4 font-bold text-forest">شارك بأمانة</h3><p className="mt-2 text-sm leading-6 text-[#718078]">انسخ النص المسترجع كما هو مع بيانات المصدر المتاحة.</p></div>
      </section>}
    </main>
    {selectedHadith && <div className="fixed inset-x-4 bottom-4 z-10 mx-auto max-w-xl rounded-2xl border border-gold/40 bg-white p-4 shadow-2xl">
      <div className="flex items-center justify-between"><p className="text-sm font-bold text-forest">تم إنشاء تنسيق واتساب</p><button className="text-sm text-[#718078]" onClick={() => setSelectedHadith(null)}>إغلاق</button></div>
      <p dir="auto" className="mt-2 line-clamp-2 text-sm text-[#59665d]">{selectedHadith.text}</p>
    </div>}
  </div>
}

export default App
