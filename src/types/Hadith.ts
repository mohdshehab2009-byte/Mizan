import type { SourceId } from './Source'

export interface Hadith {
  id: string
  title?: string
  text: string
  narrator?: string
  sourceId: SourceId
  sourceName: string
  book?: string
  volume?: string
  page?: string
  hadithNumber?: string
  chain?: string
  grading?: string
  url?: string
}

export interface SearchResponse {
  results: Hadith[]
  unavailable?: string
}
