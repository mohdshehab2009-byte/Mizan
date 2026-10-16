import type { Hadith } from '../../types/Hadith'
import type { SourceId } from '../../types/Source'

export interface SourceAdapter {
  readonly id: SourceId
  search(query: string, signal?: AbortSignal): Promise<Hadith[]>
}

export class SourceUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SourceUnavailableError'
  }
}
