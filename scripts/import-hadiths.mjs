import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import readXlsxFile from 'read-excel-file/node'
import { createClient } from '@supabase/supabase-js'

const workbookPath = new URL('../public/pdfs/Mizan_Hadith_Sheet_All4.xlsx', import.meta.url)
const batchSize = 500

const workbook = await readXlsxFile(await readFile(workbookPath))
const sheet = workbook.find(({ sheet: name }) => name === 'Hadiths')
if (!sheet) {
  throw new Error('The workbook does not contain a Hadiths worksheet.')
}

const [headerRow, ...rows] = sheet.data
if (!headerRow) {
  throw new Error('The Hadiths worksheet is empty.')
}
const headers = new Map(headerRow.map((value, index) => [String(value ?? '').trim(), index]))
const requiredColumns = ['ID', 'Topic', 'Hadith', 'Source']
const missingColumns = requiredColumns.filter((column) => !headers.has(column))
if (missingColumns.length) {
  throw new Error(`The workbook is missing required columns: ${missingColumns.join(', ')}`)
}

function value(row, column) {
  const cell = row[headers.get(column)]
  return typeof cell === 'string' || typeof cell === 'number' ? String(cell).trim() : ''
}

function normalizeArabic(text) {
  return text
    .normalize('NFKC')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
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

const datasetVersion = randomUUID()
const imported = rows.flatMap((row, index) => {
  if (!row.some((cell) => String(cell ?? '').trim())) return []

  const id = value(row, 'ID')
  const hadithText = value(row, 'Hadith')
  if (!id) throw new Error(`ID is missing from workbook row ${index + 2}.`)
  if (!hadithText) throw new Error(`Hadith text is missing from workbook row ${index + 2}.`)

  const topic = value(row, 'Topic')
  const source = value(row, 'Source')
  const narrator = value(row, 'Narrator')
  const volume = value(row, 'Volume')
  const page = value(row, 'PDF page')
  const searchText = normalizeArabic([id, topic, hadithText, source, narrator].filter(Boolean).join(' '))
  return [{
    id,
    topic,
    hadith_text: hadithText,
    source,
    narrator: narrator || null,
    volume: volume || null,
    page: page || null,
    search_text: searchText,
    dataset_version: datasetVersion,
  }]
})

if (new Set(imported.map(({ id }) => id)).size !== imported.length) {
  throw new Error('The workbook contains duplicate IDs; no rows were imported.')
}

if (process.argv.includes('--dry-run')) {
  console.log(`Workbook validation passed: ${imported.length} hadiths are ready to import.`)
  process.exit(0)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

for (let offset = 0; offset < imported.length; offset += batchSize) {
  const batch = imported.slice(offset, offset + batchSize)
  const { error } = await supabase.from('hadiths').upsert(batch, { onConflict: 'id' })
  if (error) {
    throw new Error(`Import failed at row ${offset + 1}: ${error.message}`)
  }
  console.log(`Imported ${Math.min(offset + batch.length, imported.length)} of ${imported.length}`)
}

const { error: cleanupError } = await supabase
  .from('hadiths')
  .delete()
  .neq('dataset_version', datasetVersion)

if (cleanupError) {
  throw new Error(`Import completed, but old records could not be removed: ${cleanupError.message}`)
}

console.log(`Dataset replacement complete: ${imported.length} hadiths.`)
