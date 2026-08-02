import type { HeaderField } from '../../content/reference/tcpHeaderFields'

interface HeaderByteDiagramProps {
  fields: HeaderField[]
  /** Keyed by field.field -- when present, shown as a second line under the
   * field name instead of the diagram remaining name-only. Lets a tool
   * with a live builder (e.g. TCP's expert-mode header builder) show the
   * actual bytes it just constructed directly on the diagram, not just in
   * a separate hex dump below it. */
  values?: Record<string, string>
  /** Optional label shown above the diagram, e.g. a byte count or which
   * mode ("live values" vs. "field reference") is currently showing. */
  caption?: string
}

const ROW_BITS = 32
const TINTS = ['bg-accent/10', 'bg-accent-alt/10']

function parseBits(size: string): number | null {
  const match = /^(\d+)\s*bits?$/.exec(size)
  return match ? Number(match[1]) : null
}

// Classic RFC-style packet header diagram (à la RFC 793/791), rendered as
// proportionally-sized boxes instead of ASCII art. Fields are packed into
// 32-bit rows in field order -- every header this is used for (TCP, UDP, IP)
// was designed so fields never straddle a row boundary, so no splitting
// logic is needed. A field with size "Variable" (e.g. TCP/IP Options) is
// pulled out and rendered as an open-ended trailer instead of forced into
// the fixed grid.
export function HeaderByteDiagram({ fields, values, caption }: HeaderByteDiagramProps) {
  const rows: { field: HeaderField; bits: number }[][] = []
  let currentRow: { field: HeaderField; bits: number }[] = []
  let currentRowBits = 0
  let variableField: HeaderField | null = null

  for (const field of fields) {
    const bits = parseBits(field.size)
    if (bits === null) {
      variableField = field
      continue
    }
    currentRow.push({ field, bits })
    currentRowBits += bits
    if (currentRowBits >= ROW_BITS) {
      rows.push(currentRow)
      currentRow = []
      currentRowBits = 0
    }
  }
  if (currentRow.length > 0) rows.push(currentRow)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-1 font-mono text-[10px] text-fg-subtle">
        <span>bit 0</span>
        {caption && <span className="text-accent">{caption}</span>}
        <span>bit 31</span>
      </div>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex h-11 overflow-hidden rounded-sm border border-border">
          {row.map(({ field, bits }, fieldIndex) => {
            const value = values?.[field.field]
            return (
              <div
                key={field.field}
                style={{ flexGrow: bits, flexBasis: 0 }}
                className={`flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden border-r border-border px-1 text-center font-mono last:border-r-0 ${TINTS[fieldIndex % TINTS.length]}`}
                title={`${field.field} -- ${field.size}${field.description ? ` -- ${field.description}` : ''}${value ? ` -- current value: ${value}` : ''}`}
              >
                <span
                  className={`block max-w-full truncate text-[11px] ${value ? 'text-[10px]' : ''}`}
                >
                  {field.field}
                </span>
                {value && (
                  <span className="block max-w-full truncate text-[10px] text-accent">{value}</span>
                )}
              </div>
            )
          })}
        </div>
      ))}
      {variableField && (
        <div
          className="flex h-11 items-center justify-center rounded-sm border border-dashed border-border px-2 text-center font-mono text-[11px] text-fg-subtle"
          title={`${variableField.field} -- ${variableField.description}`}
        >
          {variableField.field} (variable length)
        </div>
      )}
    </div>
  )
}
