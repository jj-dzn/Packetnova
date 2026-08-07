import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Input } from '../components/ui/Input'
import { PreviewCard } from '../components/ui/PreviewCard'
import { searchRanked } from '../lib/search/rankResults'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const committedQuery = searchParams.get('q') ?? ''

  // Keyed on the URL's query so navigating here again with a new ?q= (e.g.
  // resubmitting the form while already on this page) resets local state
  // cleanly, without syncing state from an effect.
  return <SearchResults key={committedQuery} committedQuery={committedQuery} />
}

function SearchResults({ committedQuery }: { committedQuery: string }) {
  const [, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(committedQuery)

  const trimmedQuery = query.trim()
  // Matches NavSearch's own memoization of the identical searchRanked()
  // call -- this page previously re-ran the fuzzy search on every
  // keystroke while typing, unguarded.
  const results = useMemo(() => (trimmedQuery ? searchRanked(trimmedQuery) : []), [trimmedQuery])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSearchParams(query.trim() ? { q: query.trim() } : {})
  }

  return (
    <div className="flex flex-col gap-8 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Search</h1>
        <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-md">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools..."
            aria-label="Search tools"
            autoFocus
          />
        </form>
        {trimmedQuery && (
          <p className="mt-4 text-sm text-fg-muted">
            {results.length} result{results.length === 1 ? '' : 's'} for "{trimmedQuery}"
          </p>
        )}
      </div>

      {trimmedQuery && results.length === 0 ? (
        <p className="text-center text-fg-muted">No tools match your search yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <PreviewCard
              key={item.title}
              category={item.category}
              title={item.title}
              description={item.description}
              href={item.href ?? undefined}
              comingSoon={!item.href}
            />
          ))}
        </div>
      )}
    </div>
  )
}
