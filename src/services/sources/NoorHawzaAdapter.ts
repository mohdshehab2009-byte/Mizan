import { approvedSources } from '../../config/sources'
import type { Hadith } from '../../types/Hadith'
import type { SourceAdapter } from './SourceAdapter'
import type { SourceId } from '../../types/Source'

export class NoorHawzaAdapter implements SourceAdapter {
  readonly id: SourceId = 'noor-al-hawza'

  async search(_query: string): Promise<Hadith[]> {
    // The approved GPT page is not a public API and must not be scraped or automated.
    return []
  }

  get verificationUrl(): string {
    return approvedSources.find((source) => source.id === this.id)?.url ?? ''
  }
}
