import type { Hadith } from '../types/Hadith'

export interface WhatsAppFormatOptions {
  sequence: string
  title: string
}

export function formatWhatsApp(hadith: Hadith, options: WhatsAppFormatOptions): string {
  const title = options.title.trim() || 'حديث'
  const sequence = options.sequence.trim() || '—'
  const narrator = hadith.narrator?.trim()
  return [
    `(${sequence}) ﴿ *${title}* ﴾`,
    '',
    ...(narrator ? [`> عن ${narrator}  قَال :`, ''] : []),
    `*${hadith.text.trim()}*.`,
    '____________________________',
    `~ ${hadith.sourceName.trim() || 'المصدر غير متاح'}`,
    '',
    '*للإشتراك - مجتمع ميزان الحكمة*',
    'https://chat.whatsapp.com/C5yU2ySdrOQ3C7wJive7aR',
  ].join('\n')
}
