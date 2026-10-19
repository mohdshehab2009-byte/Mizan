import { useEffect, useState } from 'react'
import { BookOpen, ExternalLink, X } from 'lucide-react'
import type { Hadith } from '../types/Hadith'

function getBookPageReference(hadith: Hadith) {
  if (hadith.sourceId !== 'mizan-database') return null

  const volume = Number(hadith.volume?.trim())
  const page = Number(hadith.page?.trim())

  if (!Number.isInteger(volume) || volume < 1 || volume > 4 || !Number.isSafeInteger(page) || page < 1) {
    return null
  }

  return {
    volume,
    page,
    url: `${import.meta.env.BASE_URL}pdfs/Part%20${volume}.pdf#page=${page}`,
  }
}

export function BookPagePreview({ hadith }: { hadith: Hadith }) {
  const [open, setOpen] = useState(false)
  const reference = getBookPageReference(hadith)

  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  if (!reference) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0b4229]"
      >
        <BookOpen size={16} />
        عرض الصفحة في الكتاب
      </button>
      {open && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`book-page-title-${hadith.id}`}
            className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between gap-4 border-b border-[#edf0eb] px-4 py-3 sm:px-6">
              <div>
                <h2 id={`book-page-title-${hadith.id}`} className="font-display text-lg font-extrabold text-forest">
                  صفحة المصدر في الكتاب
                </h2>
                <p className="mt-1 text-sm text-[#718078]">
                  المجلد {reference.volume} · صفحة PDF {reference.page}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق معاينة صفحة الكتاب"
                className="rounded-lg p-2 text-[#59665d] transition hover:bg-[#f1f7f2]"
              >
                <X size={20} />
              </button>
            </header>
            <iframe
              key={reference.url}
              src={reference.url}
              title={`ميزان الحكمة، المجلد ${reference.volume}، صفحة PDF ${reference.page}`}
              className="min-h-[55vh] flex-1 bg-[#e8e8e8]"
            />
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0eb] px-4 py-3 sm:px-6">
              <p className="text-xs leading-5 text-[#718078]">
                قارن نص الحديث أعلاه بالصفحة المصورة للتحقق من مطابقته للمصدر.
              </p>
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-forest underline underline-offset-4"
              >
                فتح ملف PDF منفصلًا <ExternalLink size={15} />
              </a>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
