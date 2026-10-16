import type { ApprovedSource, SourceId } from '../types/Source'

export const approvedSources: ApprovedSource[] = [
  {
    id: 'noor-al-hawza',
    name: 'نور الحوزة',
    url: 'https://chatgpt.com/g/g-67d5f5a8c32c8191ab7bb16ed6a48bfa-nwr-lhwz',
    enabled: true,
  },
]

export const localHadithSource = {
  id: 'mizan-database' as const,
  name: 'قاعدة ميزان الحكمة',
}

export const searchSources = [localHadithSource, ...approvedSources]

export const sourceById = (id: SourceId) => searchSources.find((source) => source.id === id)

export const isApprovedSourceUrl = (url: string) => approvedSources.some((source) => new URL(source.url).origin === new URL(url).origin)
