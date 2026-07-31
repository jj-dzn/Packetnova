import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { summarizeRoutes } from '../../../lib/calculations/routeSummary'

const DEFAULT_INPUT = '192.168.0.0/25\n192.168.0.128/25\n192.168.2.0/24'

export function RouteSummarizer() {
  const [input, setInput] = useState(DEFAULT_INPUT)
  const calc = summarizeRoutes(input)

  return (
    <ToolPageLayout
      category="IP"
      title="Route summarizer"
      description="Paste a list of IPs or CIDR blocks and find the smallest set of aggregate routes that covers them."
      input={
        <div>
          <label htmlFor="route-summary-input" className="text-sm font-medium">
            IP addresses / CIDR blocks (one per line)
          </label>
          <textarea
            id="route-summary-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={8}
            spellCheck={false}
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
          />
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="Routes in" value={calc.result.inputCount.toLocaleString()} />
              <ResultRow
                label="Aggregate routes out"
                value={calc.result.summarizedRoutes.length.toLocaleString()}
              />
              <ResultRow label="Reduction" value={`${calc.result.reductionCount} fewer routes`} />
            </dl>
            <div className="max-h-80 overflow-y-auto rounded-md border border-border p-3 font-mono text-sm">
              {calc.result.summarizedRoutes.map((route) => (
                <p key={route}>{route}</p>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
