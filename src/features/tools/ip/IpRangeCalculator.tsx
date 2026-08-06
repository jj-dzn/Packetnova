import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { RangeBlocksBar } from './RangeBlocksBar'
import { Input } from '../../../components/ui/Input'
import { calculateIpRange } from '../../../lib/calculations/ipRange'
import { useUrlState } from '../../../hooks/useUrlState'

export function IpRangeCalculator() {
  const [startInput, setStartInput] = useUrlState('start', '192.168.1.10')
  const [endInput, setEndInput] = useUrlState('end', '192.168.1.20')
  const calc = calculateIpRange(startInput, endInput)

  return (
    <ToolPageLayout
      category="IP"
      title="IP range calculator"
      description="Convert a start and end IP address into the minimal set of CIDR blocks that cover it exactly."
      status={calc.ok ? 'ok' : 'error'}
      related={[{ to: '/tools/route-summarizer', label: 'Route summarizer' }]}
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
            <RangeBlocksBar blocks={calc.result.cidrBlocks} />
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
    >
      <ToolEducation
        howItWorks={
          <p>
            A CIDR block always starts on an address boundary aligned to its own size -- a /24 must
            start at a multiple of 256, a /28 at a multiple of 16, and so on. Most arbitrary
            start/end ranges don't line up with a single such boundary, so this greedily finds the
            largest CIDR-aligned block that fits at the start of what's left, then repeats until the
            whole range is covered -- which is why the result is usually several blocks of different
            sizes, not one.
          </p>
        }
        whenToUseThis={
          <p>
            Use this when you've been handed a start/end address range (from a provisioning system,
            an RFC, or a colleague) and need to actually configure it somewhere that only
            understands CIDR notation -- an ACL, a firewall rule, a route statement.
          </p>
        }
        commonMistakes={
          <p>
            Expecting a "clean" range to always produce one CIDR block -- even a range that looks
            simple, like 10.0.0.1-10.0.0.20, isn't aligned to any single block size and will
            decompose into several. The number of blocks in the result reflects real alignment
            constraints, not an inefficiency in this tool.
          </p>
        }
        troubleshootingTips={
          <p>
            If you expected fewer blocks than you got, check whether your start address is actually
            a power-of-2-aligned boundary for the size you had in mind -- shifting the start by even
            one address can double or triple the block count needed to cover the same total range.
          </p>
        }
        relatedReading={
          <p>
            Have a list of separate CIDR blocks instead of one range, and want to combine them?{' '}
            <Link to="/tools/route-summarizer" className="text-accent hover:underline">
              Route summarizer
            </Link>{' '}
            does the reverse direction using the same underlying logic.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
