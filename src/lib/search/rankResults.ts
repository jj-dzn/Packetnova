import { searchIndex, type SearchItem } from './searchIndex'
import { getActivePathNextStepHrefs } from '../content/activePathNextStep'

// Fuse.js already ranks by text relevance; this only ever reorders within
// that -- a visitor with an in-progress Guided Path sees that path's next
// step surface first when it also matches the query, ahead of equally (or
// more) textually relevant results, but never invents a match Fuse itself
// didn't find. `.sort()` is stable in every engine this ships to, so
// results tied on boost status keep Fuse's own relative order.
export function searchRanked(query: string): SearchItem[] {
  const results = searchIndex.search(query).map((result) => result.item)
  const boosted = getActivePathNextStepHrefs()
  if (boosted.size === 0) return results

  return [...results].sort((a, b) => {
    const aBoost = a.href && boosted.has(a.href) ? 1 : 0
    const bBoost = b.href && boosted.has(b.href) ? 1 : 0
    return bBoost - aBoost
  })
}
