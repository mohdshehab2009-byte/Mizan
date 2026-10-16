import { NoorHawzaAdapter } from './sources/NoorHawzaAdapter'
import type { Hadith } from '../types/Hadith'
import type { SourceId } from '../types/Source'
import { normalizeForSearch } from '../utils/normalizeArabic'
import { getSupabaseClient } from './supabaseClient'

const adapters = { 'noor-al-hawza': new NoorHawzaAdapter() } as const

export async function searchSelectedSources(query: string, sourceIds: SourceId[]) {
  const localResults = sourceIds.includes('mizan-database')
    ? await searchSupabaseHadiths(query)
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

async function searchSupabaseHadiths(query: string): Promise<{ results: Hadith[]; totalResults: number }> {
  const { data, error } = await getSupabaseClient().rpc('search_hadiths', {
    search_query: normalizeForSearch(query),
    result_limit: 100,
  })
  if (error) {
    throw new Error(`تعذر البحث في قاعدة Supabase: ${error.message}`)
  }

  const rows = data ?? []
  return {
    results: rows.map((row) => ({
      id: row.id,
      title: row.topic,
      text: row.hadith_text,
      narrator: row.narrator ?? undefined,
      sourceId: 'mizan-database',
      sourceName: row.source,
      volume: row.volume ?? undefined,
      page: row.page ?? undefined,
      hadithNumber: row.id,
    })),
    totalResults: Number(rows[0]?.total_count ?? 0),
  }
}
