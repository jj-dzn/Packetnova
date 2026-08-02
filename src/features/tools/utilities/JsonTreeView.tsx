import { useState } from 'react'

function TypedValue({ value }: { value: unknown }) {
  if (typeof value === 'string') return <span className="text-success">&quot;{value}&quot;</span>
  if (typeof value === 'number') return <span className="text-accent">{value}</span>
  if (typeof value === 'boolean') return <span className="text-accent-alt">{String(value)}</span>
  if (value === null) return <span className="text-fg-subtle">null</span>
  return null
}

interface JsonNodeProps {
  label?: string
  value: unknown
}

function JsonNode({ label, value }: JsonNodeProps) {
  const isArray = Array.isArray(value)
  const isObject = value !== null && typeof value === 'object' && !isArray
  const [open, setOpen] = useState(true)

  const keyPrefix = label !== undefined && (
    <>
      <span className="text-accent-alt">&quot;{label}&quot;</span>
      <span className="text-fg-subtle">: </span>
    </>
  )

  if (!isObject && !isArray) {
    return (
      <div>
        {keyPrefix}
        <TypedValue value={value} />
      </div>
    )
  }

  const entries = isArray
    ? (value as unknown[]).map((v, i): [string, unknown] => [String(i), v])
    : Object.entries(value as Record<string, unknown>)
  const [openBracket, closeBracket] = isArray ? ['[', ']'] : ['{', '}']

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="text-fg-subtle" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        {keyPrefix}
        <span className="text-fg-subtle">{openBracket}</span>
        {!open && (
          <span className="text-fg-subtle">
            {entries.length} {isArray ? (entries.length === 1 ? 'item' : 'items') : 'keys'}
            {closeBracket}
          </span>
        )}
      </button>
      {open && (
        <div className="ml-3 border-l border-border pl-2">
          {entries.map(([key, entryValue], index) => (
            <div key={key}>
              <JsonNode label={isArray ? undefined : key} value={entryValue} />
              {index < entries.length - 1 && <span className="text-fg-subtle">,</span>}
            </div>
          ))}
          <span className="text-fg-subtle">{closeBracket}</span>
        </div>
      )}
    </div>
  )
}

interface JsonTreeViewProps {
  value: unknown
}

// A syntax-highlighted, foldable view of already-parsed JSON -- distinct
// from the plain-text Pretty/Minify modes, which exist for copying
// formatted text out. This is for exploring a large or unfamiliar payload:
// collapse the branches you don't care about, keep the ones you do.
export function JsonTreeView({ value }: JsonTreeViewProps) {
  return (
    <div className="max-h-[28rem] overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-relaxed">
      <JsonNode value={value} />
    </div>
  )
}
