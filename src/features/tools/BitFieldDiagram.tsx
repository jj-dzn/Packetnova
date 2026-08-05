import { useDiagramExport } from '../../hooks/useDiagramExport'
import { ExportButton } from '../../components/ui/ExportButton'

export interface BitField {
  label: string
  bits: number
  value: number
}

interface BitFieldDiagramProps {
  fields: BitField[]
}

const TINTS = ['bg-accent/10', 'bg-accent-alt/10']

// Extends the BinaryBreakdown pattern (octet-by-octet IPv4 bits) to an
// arbitrary bit-packed field, e.g. an 802.1Q TCI: unequal-width, colored
// segments sized by bit count, each showing its own binary value.
export function BitFieldDiagram({ fields }: BitFieldDiagramProps) {
  const totalBits = fields.reduce((sum, field) => sum + field.bits, 0)
  const { ref, exportAs, pending } = useDiagramExport<HTMLDivElement>('bit-field-diagram')

  return (
    <div>
      <div className="mb-1 flex justify-end">
        <ExportButton exportAs={exportAs} pending={pending} />
      </div>
      <div ref={ref} className="flex h-14 overflow-hidden rounded-md border border-border">
        {fields.map((field, index) => (
          <div
            key={field.label}
            style={{ flexGrow: field.bits, flexBasis: 0 }}
            className={`flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden border-r border-border px-1 last:border-r-0 ${TINTS[index % TINTS.length]}`}
            title={`${field.label}: ${field.bits} bit${field.bits === 1 ? '' : 's'}, value ${field.value}`}
          >
            <span className="block max-w-full truncate text-[11px] font-medium">{field.label}</span>
            <span className="block max-w-full truncate font-mono text-[10px] text-fg-subtle">
              {field.value.toString(2).padStart(field.bits, '0')}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-right font-mono text-[10px] text-fg-subtle">{totalBits} bits</p>
    </div>
  )
}
