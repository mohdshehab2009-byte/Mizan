import type { Hadith } from '../types/Hadith'

export interface WhatsAppFormatOptions {
  sequence: string
  title: string
}

function sourceLine(hadith: Hadith): string {
  const details = [hadith.book, hadith.volume && `ج ${hadith.volume}`, hadith.page && `ص ${hadith.page}`].filter(Boolean)
  return `~ ${[hadith.sourceName, ...details].join('، ')}`
}

export function formatWhatsApp(hadith: Hadith, options: WhatsAppFormatOptions): string {
  const title = options.title.trim() || 'حديث'
  const sequence = options.sequence.trim() || '—'
  return [
    `(${sequence}) ﴿ *${title}* ﴾`,
    '',
    hadith.text,
    '',
    sourceLine(hadith),
    '__________',
    '',
    'للإشتراك🔹مجموعة - ميزان الحكمة🔹',
    'https://chat.whatsapp.com/C5yU2ySdrOQ3C7wJive7aR',
  ].join('\n')
}
