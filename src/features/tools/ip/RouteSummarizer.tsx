import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { BinaryBreakdown } from './BinaryBreakdown'
import { MergeRangeBar } from './MergeRangeBar'
import { summarizeRoutes, type RouteMergeGroup } from '../../../lib/calculations/routeSummary'
import { parseIPv4 } from '../../../lib/validation/ip'

const DEFAULT_INPUT = '192.168.0.0/25\n192.168.0.128/25\n192.168.2.0/24'

// One step per OUTPUT block (not per merge group -- a single merged span
// can still produce more than one output block when it doesn't land on a
// single power-of-2-aligned boundary), showing why that specific block's
// prefix length is what it is: the binary breakdown makes the alignment
// visible instead of asking visitors to just trust the number.
function buildMergeSteps(mergeGroups: RouteMergeGroup[]): GuidedStep[] {
  return mergeGroups.flatMap((group) =>
    group.outputs.map((output) => {
      const [address, prefixString] = output.split('/')
      const parsed = address ? parseIPv4(address) : null
      return {
        title: output,
        description:
          group.inputs.length > 1
            ? `Covers: ${group.inputs.join(', ')}`
            : `Directly from: ${group.inputs[0]}`,
        content: parsed ? (
          <BinaryBreakdown
            label="Network address in binary"
            value={parsed.value}
            prefixLength={Number(prefixString)}
          />
        ) : undefined,
      }
    }),
  )
}

export function RouteSummarizer() {
  const [input, setInput] = useState(DEFAULT_INPUT)
  const calc = summarizeRoutes(input)

  return (
    <ToolPageLayout
      category="IP"
      title="Route summarizer"
      description="Paste a list of IPs or CIDR blocks and find the smallest set of aggregate routes that covers them."
      related={[{ to: '/tools/ip-range-calculator', label: 'IP range calculator' }]}
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
            <GuidedMode
              steps={buildMergeSteps(calc.result.mergeGroups)}
              closingNote={
                <>
                  Route summarization is really an alignment problem, not just an overlap check -- a
                  span only collapses into one route when it starts on a power-of-2 boundary big
                  enough to cover it. Otherwise it comes out as more than one block even though the
                  addresses are still perfectly contiguous, which is exactly what just happened
                  above wherever a block's prefix length looks less clean than you'd expect.
                </>
              }
            >
              <div>
                <p className="mb-2 text-sm font-medium text-fg-muted">
                  Merge map -- which inputs became which output
                </p>
                <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
                  {calc.result.mergeGroups.map((group, index) => {
                    const merged = group.inputs.length > 1
                    return (
                      <div
                        key={index}
                        className={`flex flex-col gap-2 rounded-md border p-2 text-xs ${
                          merged ? 'border-accent/40 bg-accent/5' : 'border-border'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex flex-wrap gap-1">
                            {group.inputs.map((input, inputIndex) => (
                              <span
                                key={inputIndex}
                                className="rounded bg-fg-subtle/10 px-1.5 py-0.5 font-mono text-fg-muted"
                              >
                                {input}
                              </span>
                            ))}
                          </div>
                          <span aria-hidden="true" className="text-fg-subtle">
                            &rarr;
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {group.outputs.map((output) => (
                              <span
                                key={output}
                                className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-accent"
                              >
                                {output}
                              </span>
                            ))}
                          </div>
                        </div>
                        {merged && <MergeRangeBar inputs={group.inputs} outputs={group.outputs} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </GuidedMode>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            This merges adjacent and overlapping input ranges, then finds the smallest set of
            CIDR-aligned blocks that exactly covers the result -- not just "fewest routes at any
            cost," since a summary route must cover only real address space, never anything beyond
            the inputs it's replacing. When a merged span doesn't start on a power-of-2 boundary
            large enough to hold it, it comes out as more than one output block even though the
            underlying addresses are perfectly contiguous.
          </p>
        }
        whenToUseThis={
          <p>
            Use this before configuring static routes or route-redistribution filters for a set of
            subnets, so a router's routing table (and the update traffic needed to maintain it)
            stays as small as possible. It's also useful for sanity-checking whether a set of
            allocated subnets could have been summarized more tightly -- often the answer is
            "almost, but one subnet is misaligned."
          </p>
        }
        commonMistakes={
          <p>
            Expecting any set of contiguous addresses to summarize into exactly one route --
            alignment, not just contiguity, determines that. Two adjacent /24s only merge into one
            /23 if the first one starts on an even /23 boundary; the identical two ranges starting
            one address off would need to stay as two separate routes.
          </p>
        }
        troubleshootingTips={
          <p>
            If your routes summarized into more blocks than expected, check the merge map above --
            it shows exactly which inputs became which output, and a lone unmerged input at an odd
            boundary is almost always the reason the total didn't collapse further.
          </p>
        }
        relatedReading={
          <p>
            Going the other direction -- converting a start/end range into CIDR blocks first?{' '}
            <Link to="/tools/ip-range-calculator" className="text-accent hover:underline">
              IP range calculator
            </Link>{' '}
            uses this same decomposition logic.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
