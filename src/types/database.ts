export interface Database {
  public: {
    Tables: {
      hadiths: {
        Row: {
          id: string
          topic: string
          hadith_text: string
          source: string
          narrator: string | null
          volume: string | null
          page: string | null
          search_text: string
          dataset_version: string
        }
        Insert: {
          id: string
          topic: string
          hadith_text: string
          source: string
          narrator?: string | null
          volume?: string | null
          page?: string | null
          search_text: string
          dataset_version: string
        }
        Update: Partial<Database['public']['Tables']['hadiths']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      search_hadiths: {
        Args: {
          search_query: string
          result_limit?: number
        }
        Returns: Array<{
          id: string
          topic: string
          hadith_text: string
          source: string
          narrator: string | null
          volume: string | null
          page: string | null
          total_count: number
        }>
      }
      search_hadiths_by_topic: {
        Args: {
          search_query: string
          topic_filter: string
          result_limit?: number
        }
        Returns: Array<{
          id: string
          topic: string
          hadith_text: string
          source: string
          narrator: string | null
          volume: string | null
          page: string | null
          total_count: number
        }>
      }
      search_hadith_topics: {
        Args: {
          topic_query?: string
          result_limit?: number
        }
        Returns: Array<{
          topic: string
        }>
      }
      get_daily_hadith: {
        Args: {
          day_key: string
        }
        Returns: Array<{
          id: string
          topic: string
          hadith_text: string
          source: string
          narrator: string | null
          volume: string | null
          page: string | null
          total_count: number
        }>
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
