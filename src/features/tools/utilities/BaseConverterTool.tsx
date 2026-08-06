import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { BitToggleSandbox } from '../BitToggleSandbox'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Pill } from '../../../components/ui/Pill'
import { convertBase } from '../../../lib/calculations/baseConverter'

const MAX_SANDBOX_VALUE = 0xffffffff

export function BaseConverterTool() {
  const [value, setValue] = useState('255')
  const [fromBase, setFromBase] = useState<'2' | '8' | '10' | '16'>('10')
  const [showCustomBase, setShowCustomBase] = useState(false)
  const [customBase, setCustomBase] = useState('36')

  const calc = convertBase(value, Number(fromBase) as 2 | 8 | 10 | 16)
  const customBaseNum = Number(customBase)
  const customBaseValid =
    Number.isInteger(customBaseNum) && customBaseNum >= 2 && customBaseNum <= 36

  return (
    <ToolPageLayout
      category="Utilities"
      title="Binary / decimal / hex converter"
      description="Convert numbers between binary, octal, decimal, and hexadecimal."
      status={calc.ok ? 'ok' : 'error'}
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
            <div className="border-t border-border pt-4">
              <Pill active={showCustomBase} onClick={() => setShowCustomBase((v) => !v)}>
                {showCustomBase ? 'Hide' : 'Show'} custom base (expert)
              </Pill>
              {showCustomBase && (
                <div className="mt-3 flex flex-col gap-3">
                  <div>
                    <label htmlFor="base-custom" className="text-sm font-medium">
                      Custom base (2-36)
                    </label>
                    <Input
                      id="base-custom"
                      type="number"
                      min={2}
                      max={36}
                      className="mt-2 w-24"
                      value={customBase}
                      onChange={(e) => setCustomBase(e.target.value)}
                    />
                  </div>
                  {customBaseValid ? (
                    <ResultRow
                      label={`Base ${customBaseNum}`}
                      value={Number(calc.result.decimal).toString(customBaseNum)}
                    />
                  ) : (
                    <p className="text-sm text-danger">Base must be a whole number from 2 to 36.</p>
                  )}
                  <p className="text-xs text-fg-subtle">
                    Base 36 uses every digit 0-9 plus letters a-z -- the largest radix a single
                    character can represent without inventing new symbols, and the ceiling
                    JavaScript's own number formatting supports.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Every base represents the same underlying quantity, just grouped differently -- binary
            groups by powers of 2, hex groups by powers of 16 (conveniently, exactly 4 binary bits
            per hex digit, which is why hex is the natural shorthand for binary data), decimal by
            powers of 10. Converting between them doesn't change the value, only how it's written.
          </p>
        }
        whenToUseThis={
          <p>
            This comes up constantly in networking and low-level work: reading a subnet mask or MAC
            address byte in hex, converting a flags field between its bit pattern and decimal value,
            or just sanity-checking a number a tool printed in an unfamiliar base.
          </p>
        }
        commonMistakes={
          <p>
            This converter is unsigned only -- it has no concept of negative numbers or two's
            complement representation, so a "negative" result isn't something it can express; large
            unsigned values and negative signed values that happen to share a bit pattern will not
            convert the way a signed-integer context (like a CPU register) would interpret them.
          </p>
        }
        troubleshootingTips={
          <p>
            If a conversion looks wrong, double check the "from base" selector matches what you
            actually typed -- entering a hex value like "1a" while "Decimal" is still selected will
            either error or misinterpret the digits. The bit-toggle sandbox above disappears above
            32-bit values (0xFFFFFFFF) since it's specifically a 32-bit visualization, not a limit
            on the converter itself.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
