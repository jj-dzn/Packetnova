import { useMemo, useState } from 'react'
import { searchIndex, type SearchItem } from '../lib/search/searchIndex'

export function useSearch() {
  const [query, setQuery] = useState('')

  const results = useMemo<SearchItem[]>(() => {
    const trimmed = query.trim()
    if (!trimmed) return []
    return searchIndex.search(trimmed).map((result) => result.item)
  }, [query])

  return { query, setQuery, results }
}
