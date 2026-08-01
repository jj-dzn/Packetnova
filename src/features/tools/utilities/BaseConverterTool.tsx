import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { BitToggleSandbox } from '../BitToggleSandbox'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { convertBase } from '../../../lib/calculations/baseConverter'

const MAX_SANDBOX_VALUE = 0xffffffff

export function BaseConverterTool() {
  const [value, setValue] = useState('255')
  const [fromBase, setFromBase] = useState<'2' | '8' | '10' | '16'>('10')

  const calc = convertBase(value, Number(fromBase) as 2 | 8 | 10 | 16)

  return (
    <ToolPageLayout
      category="Utilities"
      title="Binary / decimal / hex converter"
      description="Convert numbers between binary, octal, decimal, and hexadecimal."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="base-value" className="text-sm font-medium">
              Value
            </label>
            <Input
              id="base-value"
              className="mt-2 font-mono"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="base-from" className="text-sm font-medium">
              From base
            </label>
            <Select
              id="base-from"
              className="mt-2"
              value={fromBase}
              onChange={(e) => setFromBase(e.target.value as '2' | '8' | '10' | '16')}
            >
              <option value="2">Binary (base 2)</option>
              <option value="8">Octal (base 8)</option>
              <option value="10">Decimal (base 10)</option>
              <option value="16">Hexadecimal (base 16)</option>
            </Select>
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="Binary" value={calc.result.binary} />
              <ResultRow label="Octal" value={calc.result.octal} />
              <ResultRow label="Decimal" value={calc.result.decimal} />
              <ResultRow label="Hex" value={calc.result.hex} />
            </dl>
            {Number(calc.result.decimal) <= MAX_SANDBOX_VALUE && (
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm font-medium text-fg-muted">Bit-toggle sandbox</p>
                <BitToggleSandbox
                  value={Number(calc.result.decimal)}
                  groupSize={4}
                  onToggle={(bitIndex) => {
                    const newValue = (Number(calc.result.decimal) ^ (1 << (31 - bitIndex))) >>> 0
                    setValue(String(newValue))
                    setFromBase('10')
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
