const arabicDiacritics = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g

export function normalizeArabic(value: string): string {
  return value
    .normalize('NFKC')
    .replace(arabicDiacritics, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ی/g, 'ي')
    .replace(/ک/g, 'ك')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ـ\u200C\u200D]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase()
}

export function normalizeForSearch(value: string): string {
  return normalizeArabic(value)
}
