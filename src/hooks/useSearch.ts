import { useMemo, useState } from 'react'
import type { SearchItem } from '../lib/search/searchIndex'
import { searchRanked } from '../lib/search/rankResults'

export function useSearch() {
  const [query, setQuery] = useState('')

  const results = useMemo<SearchItem[]>(() => {
    const trimmed = query.trim()
    if (!trimmed) return []
    return searchRanked(trimmed)
  }, [query])

  return { query, setQuery, results }
}
