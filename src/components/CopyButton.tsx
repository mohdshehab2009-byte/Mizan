import { Check, Clipboard, MessageCircle } from 'lucide-react'
import { useState } from 'react'

const buildWhatsAppLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  const shareToWhatsApp = () => {
    const shareUrl = buildWhatsAppLink(text)
    const isMobile = /Android|iPhone|iPad|Mobile/i.test(window.navigator.userAgent)

    if (isMobile) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
      setShared(true)
      window.setTimeout(() => setShared(false), 2200)
      return
    }

    void copy()
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={shareToWhatsApp}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f5b3f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0a472f]"
      >
        {shared ? <Check size={17} /> : <MessageCircle size={17} />}
        {shared ? 'تم فتح واتساب' : 'مشاركة واتساب'}
      </button>
      <button
        type="button"
        onClick={copy}
        className="flex items-center justify-center gap-2 rounded-xl border border-[#d9dfd8] bg-white px-4 py-3 text-sm font-bold text-forest transition hover:bg-[#f5faf5]"
      >
        {copied ? <Check size={17} /> : <Clipboard size={17} />}
        {copied ? 'تم النسخ' : 'نسخ'}
      </button>
    </div>
  )
}
