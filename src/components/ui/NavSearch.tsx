import { useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { Link, useNavigate } from 'react-router'
import { searchRanked } from '../../lib/search/rankResults'
import type { SearchItem } from '../../lib/search/searchIndex'
import { detectIntent } from '../../lib/search/intentDetection'

const MAX_RESULTS = 7
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

interface ResultRow {
  key: string
  label: string
  sublabel: string
  href: string
}

interface NavSearchProps {
  className?: string
  inputRef?: RefObject<HTMLInputElement | null>
  /** Called right after navigating to a result -- e.g. closing the mobile
   * hamburger menu this instance lives inside. */
  onNavigate?: () => void
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 17l-3.8-3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// The site's one search experience, inline -- typing and results both
// happen right in this box rather than behind a separate popup, with the
// same fuzzy search plus shape detection (paste an IP/CIDR/MAC/JWT, jump
// straight to the tool that handles it) a modal-style palette would have.
// Rendered once in the desktop nav and once inside the mobile menu panel;
// Cmd/Ctrl+K (wired up in Nav, which holds both instances' refs via
// `inputRef`) just focuses whichever one is actually visible.
export function NavSearch({ className = '', inputRef, onNavigate }: NavSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const localRef = useRef<HTMLInputElement>(null)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Each rendered instance (desktop nav, mobile menu) needs its own ids --
  // aria-controls/aria-activedescendant point at a specific element, and
  // two instances sharing one id would make both invalid.
  const instanceId = useId()
  const listboxId = `${instanceId}-listbox`
  const optionId = (index: number) => `${instanceId}-option-${index}`

  function setRefs(el: HTMLInputElement | null) {
    localRef.current = el
    if (inputRef) inputRef.current = el
  }

  const trimmedQuery = query.trim()
  const intent = useMemo(() => detectIntent(query), [query])

  const allResults = useMemo<SearchItem[]>(() => {
    if (!trimmedQuery) return []
    return searchRanked(trimmedQuery).filter((item) => item.href)
  }, [trimmedQuery])
  const shownResults = allResults.slice(0, MAX_RESULTS)

  const rows: ResultRow[] = [
    ...(intent
      ? [
          {
            key: `intent:${intent.href}`,
            label: intent.label,
            sublabel: 'Detected',
            href: intent.href,
          },
        ]
      : []),
    ...shownResults.map((item) => ({
      key: item.href!,
      label: item.title,
      sublabel: item.category,
      href: item.href!,
    })),
  ]

  function activate(href: string) {
    navigate(href)
    setQuery('')
    setIsOpen(false)
    onNavigate?.()
  }

  function handleFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
    setIsOpen(true)
  }

  function handleBlur() {
    blurTimeout.current = setTimeout(() => setIsOpen(false), 150)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, Math.max(rows.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const row = rows[selectedIndex]
      if (row) activate(row.href)
    } else if (event.key === 'Escape') {
      // Close the dropdown but leave focus right where it is -- the
      // standard combobox convention, and it means the next Tab press
      // continues naturally from the search box instead of from <body>.
      setIsOpen(false)
    }
  }

  const isExpanded = isOpen && rows.length > 0
  const activeOptionId = isExpanded ? optionId(selectedIndex) : undefined

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2 transition-colors focus-within:border-accent">
        <SearchIcon />
        <input
          ref={setRefs}
          type="search"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setSelectedIndex(0)
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search, or paste an IP, CIDR, MAC, or JWT..."
          aria-label="Search tools"
          aria-expanded={isExpanded}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          spellCheck={false}
          className="w-full min-w-0 bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
        />
        {!isOpen && !query && (
          <span className="hidden shrink-0 items-center gap-1 text-xs text-fg-subtle lg:flex">
            <kbd className="font-sans">{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd className="font-sans">K</kbd>
          </span>
        )}
      </div>

      {isOpen && trimmedQuery && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute z-20 mt-2 w-full min-w-64 rounded-md border border-border bg-surface p-2 shadow-lg"
        >
          {rows.length === 0 ? (
            <p role="status" className="px-2 py-2 text-sm text-fg-muted">
              No results for "{trimmedQuery}"
            </p>
          ) : (
            <>
              {rows.map((row, index) => (
                <button
                  key={row.key}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === selectedIndex}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => activate(row.href)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                    index === selectedIndex ? 'bg-accent/10 text-accent' : 'text-fg hover:bg-bg'
                  }`}
                >
                  <span>{row.label}</span>
                  <span className="shrink-0 text-xs text-fg-subtle">{row.sublabel}</span>
                </button>
              ))}
              {allResults.length > shownResults.length && (
                <Link
                  to={`/search?q=${encodeURIComponent(trimmedQuery)}`}
                  onClick={() => {
                    setIsOpen(false)
                    onNavigate?.()
                  }}
                  className="block rounded-md px-2 py-2 text-sm font-medium text-accent hover:bg-bg"
                >
                  View all {allResults.length} results
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
