import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateIpRange } from '../../../lib/calculations/ipRange'

export function IpRangeCalculator() {
  const [startInput, setStartInput] = useState('192.168.1.10')
  const [endInput, setEndInput] = useState('192.168.1.20')
  const calc = calculateIpRange(startInput, endInput)

  return (
    <ToolPageLayout
      category="IP"
      title="IP range calculator"
      description="Convert a start and end IP address into the minimal set of CIDR blocks that cover it exactly."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="range-start" className="text-sm font-medium">
              Start IP
            </label>
            <Input
              id="range-start"
              className="mt-2"
              value={startInput}
              onChange={(event) => setStartInput(event.target.value)}
              placeholder="192.168.1.10"
              spellCheck={false}
            />
          </div>
          <div>
            <label htmlFor="range-end" className="text-sm font-medium">
              End IP
            </label>
            <Input
              id="range-end"
              className="mt-2"
              value={endInput}
              onChange={(event) => setEndInput(event.target.value)}
              placeholder="192.168.1.20"
              spellCheck={false}
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow
                label="Total addresses"
                value={calc.result.totalAddresses.toLocaleString()}
              />
              <ResultRow label="CIDR blocks" value={String(calc.result.cidrBlocks.length)} />
            </dl>
            <ul className="flex flex-col gap-1 font-mono text-sm">
              {calc.result.cidrBlocks.map((block) => (
                <li key={block.cidr} className="rounded-md border border-border px-3 py-2">
                  {block.cidr}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
