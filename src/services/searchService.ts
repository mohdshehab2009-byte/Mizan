import { NoorHawzaAdapter } from './sources/NoorHawzaAdapter'
import type { Hadith } from '../types/Hadith'
import type { SourceId } from '../types/Source'
import { normalizeForSearch } from '../utils/normalizeArabic'
import { getSupabaseClient } from './supabaseClient'

const adapters = { 'noor-al-hawza': new NoorHawzaAdapter() } as const

export async function searchSelectedSources(query: string, sourceIds: SourceId[], topic?: string) {
  const localResults = sourceIds.includes('mizan-database')
    ? await searchSupabaseHadiths(query, topic)
    : { results: [], totalResults: 0 }
  const externalIds = sourceIds.filter((id) => id !== 'mizan-database')
  const responses = await Promise.allSettled(externalIds.map((id) => adapters[id].search(query)))
  const externalResults = responses.flatMap((response) => response.status === 'fulfilled' ? response.value : [])
  const unavailable = responses.some((response) => response.status === 'rejected')
  return {
    results: [...localResults.results, ...externalResults],
    unavailable,
    totalResults: localResults.totalResults + externalResults.length,
  }
}

async function searchSupabaseHadiths(query: string, topic?: string): Promise<{ results: Hadith[]; totalResults: number }> {
  const { data, error } = await getSupabaseClient().rpc('search_hadiths_by_topic', {
    search_query: normalizeForSearch(query),
    topic_filter: topic ?? '',
    result_limit: 100,
  })
  if (error) {
    throw new Error(`تعذر البحث في قاعدة Supabase: ${error.message}`)
  }

  const rows = data ?? []
  return { results: rows.map(toHadith), totalResults: Number(rows[0]?.total_count ?? 0) }
}

export async function searchHadithTopics(query: string): Promise<string[]> {
  const { data, error } = await getSupabaseClient().rpc('search_hadith_topics', {
    topic_query: query.trim().replace(/[\\%_]/g, '\\$&'),
    result_limit: 30,
  })
  if (error) throw new Error(`تعذر تحميل فهرس الموضوعات: ${error.message}`)
  return (data ?? []).map((row) => row.topic)
}

export async function getDailyHadith(dayKey: string): Promise<Hadith> {
  const { data, error } = await getSupabaseClient().rpc('get_daily_hadith', { day_key: dayKey })
  if (error) throw new Error(`تعذر تحميل حديث اليوم: ${error.message}`)
  const row = data?.[0]
  if (!row) throw new Error('لم يتم العثور على حديث لعرضه اليوم.')
  return toHadith(row)
}

function toHadith(row: {
  id: string
  topic: string
  hadith_text: string
  source: string
  narrator: string | null
  volume: string | null
  page: string | null
}): Hadith {
  return {
    id: row.id,
    title: row.topic,
    text: row.hadith_text,
    narrator: row.narrator ?? undefined,
    sourceId: 'mizan-database',
    sourceName: row.source,
    volume: row.volume ?? undefined,
    page: row.page ?? undefined,
    hadithNumber: row.id,
  }
}
