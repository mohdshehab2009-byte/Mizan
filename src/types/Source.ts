export type SourceId = 'mizan-database' | 'noor-al-hawza'

export interface ApprovedSource {
  id: SourceId
  name: string
  url: string
  enabled: boolean
}
