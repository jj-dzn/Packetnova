import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSearch } from '../../hooks/useSearch'
import { Badge } from './Badge'
import type { SearchItem } from '../../lib/search/searchIndex'

const MAX_DROPDOWN_RESULTS = 5

interface SearchBarProps {
  className?: string
  onNavigate?: () => void
}

export function SearchBar({ className = '', onNavigate }: SearchBarProps) {
  const { query, setQuery, results } = useSearch()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const visibleResults = results.slice(0, MAX_DROPDOWN_RESULTS)
  const trimmedQuery = query.trim()

  function goToResultsPage() {
    if (!trimmedQuery) return
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    setIsOpen(false)
    onNavigate?.()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    goToResultsPage()
  }

  function handleFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
    setIsOpen(true)
  }

  function handleBlur() {
    blurTimeout.current = setTimeout(() => setIsOpen(false), 150)
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search tools..."
          aria-label="Search tools"
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
        />
      </form>

      {isOpen && trimmedQuery && (
        <div className="absolute z-10 mt-2 w-full min-w-64 rounded-md border border-border bg-surface p-2 shadow-lg">
          {visibleResults.length === 0 ? (
            <p className="px-2 py-2 text-sm text-fg-muted">No results for "{trimmedQuery}"</p>
          ) : (
            <>
              {visibleResults.map((item) => (
                <SearchResultRow key={item.title} item={item} onNavigate={onNavigate} />
              ))}
              {results.length > visibleResults.length && (
                <Link
                  to={`/search?q=${encodeURIComponent(trimmedQuery)}`}
                  onClick={onNavigate}
                  className="block rounded-md px-2 py-2 text-sm font-medium text-accent hover:bg-bg"
                >
                  View all {results.length} results
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SearchResultRow({ item, onNavigate }: { item: SearchItem; onNavigate?: () => void }) {
  const content = (
    <div className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm hover:bg-bg">
      <div>
        <p className="font-medium">{item.title}</p>
        <p className="text-xs text-fg-muted">{item.category}</p>
      </div>
      {!item.href && <Badge tone="neutral">Coming soon</Badge>}
    </div>
  )

  if (!item.href) return content

  return (
    <Link to={item.href} onClick={onNavigate}>
      {content}
    </Link>
  )
}
