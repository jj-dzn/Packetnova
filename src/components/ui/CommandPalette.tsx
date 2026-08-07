import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { searchIndex, type SearchItem } from '../../lib/search/searchIndex'
import { detectIntent } from '../../lib/search/intentDetection'
import { subscribeToOpenCommandPalette } from '../../lib/commandPalette'

const MAX_RESULTS = 7

interface PaletteRow {
  key: string
  label: string
  sublabel: string
  href: string
}

// Global Cmd/Ctrl+K palette -- the site's one search experience (the Nav's
// search box just opens this), fuzzy search plus a shape classifier
// (detectIntent) that recognizes a pasted IP, CIDR, MAC, or JWT and offers
// to jump straight to the tool that handles it, pre-filled, ahead of the
// regular search results.
//
// Split into this persistent shell (owns isOpen + the global listeners)
// and CommandPaletteContent below, which only exists while open -- so the
// query/selection state below starts fresh every time purely from being a
// newly-mounted component, with no effect needing to reset it by hand.
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (isShortcut) {
        event.preventDefault()
        setIsOpen((open) => !open)
      } else if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => subscribeToOpenCommandPalette(() => setIsOpen(true)), [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return <CommandPaletteContent onClose={() => setIsOpen(false)} />
}

function CommandPaletteContent({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const previouslyFocused = useRef(document.activeElement as HTMLElement | null)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
    const restoreTo = previouslyFocused.current
    return () => {
      restoreTo?.focus()
    }
  }, [])

  const intent = useMemo(() => detectIntent(query), [query])

  const searchResults = useMemo<SearchItem[]>(() => {
    const trimmed = query.trim()
    if (!trimmed) return []
    return searchIndex
      .search(trimmed)
      .map((r) => r.item)
      .filter((item) => item.href)
      .slice(0, MAX_RESULTS)
  }, [query])

  const rows: PaletteRow[] = [
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
    ...searchResults.map((item) => ({
      key: item.href!,
      label: item.title,
      sublabel: item.category,
      href: item.href!,
    })),
  ]

  function activate(href: string) {
    navigate(href)
    onClose()
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
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
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg/70 px-4 pt-[15vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setSelectedIndex(0)
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Search, or paste an IP, CIDR, MAC, or JWT..."
          aria-label="Command palette search"
          spellCheck={false}
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
        />
        <div className="max-h-80 overflow-y-auto p-2">
          {rows.length === 0 ? (
            <p className="px-3 py-3 text-sm text-fg-muted">
              {query.trim()
                ? `No results for "${query.trim()}"`
                : 'Type to search tools, visualizers, and scenarios.'}
            </p>
          ) : (
            rows.map((row, index) => (
              <button
                key={row.key}
                type="button"
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => activate(row.href)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  index === selectedIndex ? 'bg-accent/10 text-accent' : 'text-fg hover:bg-bg'
                }`}
              >
                <span>{row.label}</span>
                <span className="shrink-0 text-xs text-fg-subtle">{row.sublabel}</span>
              </button>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-fg-subtle">
          <span>&uarr;&darr; navigate &middot; Enter select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  )
}
