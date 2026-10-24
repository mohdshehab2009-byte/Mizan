import { useEffect, useRef, useState } from 'react'
import { BookOpen, ExternalLink, Minus, Plus, X } from 'lucide-react'
import type { PDFDocumentLoadingTask, RenderTask } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
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
  }
}

function BookPageSnapshot({ url, pageNumber }: { url: string; pageNumber: number }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderPageRef = useRef<() => void>(() => {})
  const zoomRef = useRef(1)
  const [zoom, setZoom] = useState(1)
  const [zoomPercentage, setZoomPercentage] = useState(100)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    zoomRef.current = zoom
    renderPageRef.current()
  }, [zoom])

  useEffect(() => {
    let cancelled = false
    let loadingTask: PDFDocumentLoadingTask | undefined
    let renderTask: RenderTask | undefined
    let resizeObserver: ResizeObserver | undefined
    let renderSequence = 0

    const loadPage = async () => {
      setStatus('loading')
      setError('')
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
        loadingTask = pdfjs.getDocument({ url })
        const document = await loadingTask.promise
        const page = await document.getPage(pageNumber)
        const viewport = viewportRef.current
        const toolbar = toolbarRef.current
        const content = contentRef.current
        const container = containerRef.current
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        if (cancelled || !viewport || !toolbar || !content || !container || !canvas || !context) return

        const render = async () => {
          const sequence = ++renderSequence
          const width = container.clientWidth
          const contentStyles = window.getComputedStyle(content)
          const verticalPadding = Number.parseFloat(contentStyles.paddingTop) + Number.parseFloat(contentStyles.paddingBottom)
          const availableHeight = viewport.clientHeight - toolbar.clientHeight - verticalPadding
          if (!width || availableHeight <= 0) return

          const previousRender = renderTask
          previousRender?.cancel()
          if (previousRender) {
            try {
              await previousRender.promise
            } catch (renderError) {
              if (!(renderError instanceof Error && renderError.name === 'RenderingCancelledException')) {
                if (!cancelled && sequence === renderSequence) {
                  setError(renderError instanceof Error ? renderError.message : 'تعذر عرض صفحة الكتاب.')
                  setStatus('error')
                }
                return
              }
            }
          }
          if (cancelled || sequence !== renderSequence) return

          const naturalViewport = page.getViewport({ scale: 1 })
          const fitScale = Math.min(width / naturalViewport.width, availableHeight / naturalViewport.height)
          const pageViewport = page.getViewport({ scale: fitScale * zoomRef.current })
          setZoomPercentage(Math.round(zoomRef.current * 100))
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
          canvas.width = Math.floor(pageViewport.width * pixelRatio)
          canvas.height = Math.floor(pageViewport.height * pixelRatio)
          canvas.style.width = `${pageViewport.width}px`
          canvas.style.height = `${pageViewport.height}px`
          renderTask = page.render({
            canvas,
            canvasContext: context,
            viewport: pageViewport,
            transform: [pixelRatio, 0, 0, pixelRatio, 0, 0],
          })

          try {
            await renderTask.promise
            if (!cancelled && sequence === renderSequence) setStatus('ready')
          } catch (renderError) {
            if (!cancelled && sequence === renderSequence && !(renderError instanceof Error && renderError.name === 'RenderingCancelledException')) {
              setError(renderError instanceof Error ? renderError.message : 'تعذر عرض صفحة الكتاب.')
              setStatus('error')
            }
          }
        }

        renderPageRef.current = () => { void render() }
        await render()
        resizeObserver = new ResizeObserver(() => { void render() })
        resizeObserver.observe(container)
        resizeObserver.observe(viewport)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'تعذر عرض صفحة الكتاب.')
          setStatus('error')
        }
      }
    }

    void loadPage()
    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      renderTask?.cancel()
      renderPageRef.current = () => {}
      void loadingTask?.destroy()
    }
  }, [url, pageNumber])

  return (
    <div ref={viewportRef} className="min-h-0 flex-1 overflow-auto bg-[#e8e8e8]">
      <div ref={toolbarRef} className="sticky top-0 z-10 flex items-center justify-center gap-3 border-b border-[#d9dfd8] bg-white/95 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={() => setZoom((current) => Math.max(0.6, Math.round((current - 0.2) * 10) / 10))}
          disabled={zoom <= 0.6}
          aria-label="تصغير صفحة الكتاب"
          className="rounded-lg border border-[#d9dfd8] p-2 text-forest transition hover:bg-[#f1f7f2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={18} />
        </button>
        <span className="min-w-14 text-center text-sm font-bold text-[#59665d]" aria-live="polite">{zoomPercentage}٪</span>
        <button
          type="button"
          onClick={() => setZoom((current) => Math.min(3, Math.round((current + 0.2) * 10) / 10))}
          disabled={zoom >= 3}
          aria-label="تكبير صفحة الكتاب"
          className="rounded-lg border border-[#d9dfd8] p-2 text-forest transition hover:bg-[#f1f7f2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={18} />
        </button>
      </div>
      <div ref={contentRef} className="px-2 py-3 sm:px-4">
        <div ref={containerRef} className="mx-auto w-full">
          <canvas
            ref={canvasRef}
            className={`mx-auto h-auto shadow-md ${zoom === 1 ? 'max-w-full' : ''} ${status === 'error' ? 'hidden' : ''}`}
            aria-label={`صورة صفحة PDF رقم ${pageNumber}`}
          />
          {status === 'loading' && <p role="status" className="py-8 text-center text-sm font-semibold text-[#59665d]">جارٍ تحميل صفحة الكتاب...</p>}
          {status === 'error' && <p role="alert" className="px-4 py-8 text-center text-sm font-semibold text-[#a13c2c]">تعذر عرض الصفحة المصورة: {error}</p>}
        </div>
      </div>
    </div>
  )
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

  const pdfUrl = `${import.meta.env.BASE_URL}pdfs/Part%20${reference.volume}.pdf`

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
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-2 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`book-page-title-${hadith.id}`}
            className="flex h-[calc(100dvh-1rem)] max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[90vh]"
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#edf0eb] px-4 py-3 sm:px-6">
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
            <BookPageSnapshot url={pdfUrl} pageNumber={reference.page} />
            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#edf0eb] px-4 py-3 sm:px-6">
              <p className="text-xs leading-5 text-[#718078]">
                قارن نص الحديث أعلاه بالصفحة المصورة للتحقق من مطابقته للمصدر.
              </p>
              <a
                href={`${pdfUrl}#page=${reference.page}`}
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
