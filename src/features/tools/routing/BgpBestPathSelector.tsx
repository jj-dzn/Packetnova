import { useState, type ReactNode } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { Pill } from '../../../components/ui/Pill'
import { EliminationSteps, type Candidate } from '../../visualizers/EliminationSteps'
import {
  selectBgpBestPath,
  type BgpCandidate,
  type BgpOrigin,
  type BgpResult,
} from '../../../lib/calculations/bgpBestPath'

// Reuses the exact "narrow candidates down to a winner" display the BGP
// best-path visualizer already uses for a fixed illustrative example --
// same visual grammar, driven here by whatever the visitor actually
// entered above instead of a hardcoded scenario.
function buildBgpGuidedSteps(candidates: BgpCandidate[], result: BgpResult): GuidedStep[] {
  const eliminationCandidates: Candidate[] = candidates.map((c) => ({
    id: c.id,
    label: c.id,
    detail: `Weight ${c.weight} · LocalPref ${c.localPreference} · AS-path ${c.asPathLength}`,
  }))

  const allIds = candidates.map((c) => c.id)
  const eliminationSteps = [
    {
      title: 'Ready to compare',
      description: `${candidates.length} candidate paths, tie-breaking hasn't started yet.`,
      remainingIds: allIds,
    },
    ...result.trace.map((t) => ({
      title: t.step,
      description: `Comparing on ${t.step.toLowerCase()} -- ${t.remaining.length} of ${allIds.length} candidate${allIds.length === 1 ? '' : 's'} still tied.`,
      remainingIds: t.remaining,
    })),
  ]

  return eliminationSteps.map((step, index) => ({
    title: step.title,
    description: step.description,
    content: (
      <EliminationSteps
        candidates={eliminationCandidates}
        step={step}
        isFinal={index === eliminationSteps.length - 1}
      />
    ),
  }))
}

// Maps each trace step's name (from bgpBestPath.ts's STEPS) to the input
// field it corresponds to -- hovering a trace row highlights that field
// across every candidate card, so it's visually obvious which attribute a
// step actually looked at instead of having to match the prose to the form.
const STEP_TO_FIELD: Record<string, string> = {
  'Highest weight': 'Weight',
  'Highest local preference': 'Local pref',
  'Locally originated': 'Locally originated',
  'Shortest AS path': 'AS path length',
  'Lowest origin type': 'Origin',
  'Lowest MED': 'MED',
  'eBGP over iBGP': 'Session',
  'Lowest IGP metric to next hop': 'IGP metric',
  'Oldest route': 'Route age (s)',
  'Lowest router ID': 'Router ID',
  'Lowest neighbor IP': 'Neighbor IP',
}

const ORIGIN_CODE: Record<BgpOrigin, string> = { igp: 'I', egp: 'E', incomplete: '?' }

// Real AS numbers aren't part of the candidate model (only a path
// *length*), so this fabricates a plausible-looking path of that length --
// enough to show the shape of a real AS-path line without claiming to know
// numbers the tool was never given.
function fakeAsPath(length: number): string {
  return Array.from({ length }, (_, i) => 65000 + i).join(' ')
}

function buildCiscoBgpOutput(candidates: BgpCandidate[], result: BgpResult): string {
  const bestIndex = candidates.findIndex((c) => c.id === result.winnerId)
  const lines = [
    'RP/0/RP0/CPU0:router# show bgp ipv4 unicast',
    `BGP routing table entry`,
    `Paths: (${candidates.length} available, best #${bestIndex + 1})`,
  ]
  candidates.forEach((c, i) => {
    const isBest = c.id === result.winnerId
    lines.push(`  Path #${i + 1}: received by speaker 0${isBest ? ', best' : ''}`)
    lines.push(`    ${fakeAsPath(c.asPathLength)}`)
    lines.push(`    ${c.neighborIp} from ${c.neighborIp} (${c.routerId})`)
    lines.push(
      `      Origin ${c.origin.toUpperCase()}, metric ${c.med}, localpref ${c.localPreference}, weight ${c.weight}, ${c.isEbgp ? 'external' : 'internal'}, valid${isBest ? ', best, group-best' : ''}`,
    )
  })
  return lines.join('\n')
}

function buildJuniperBgpOutput(candidates: BgpCandidate[], result: BgpResult): string {
  const lines = [
    `inet.0: ${candidates.length} destinations, ${candidates.length} routes (${candidates.length} active, 0 holddown, 0 hidden)`,
    '',
  ]
  candidates.forEach((c) => {
    const isBest = c.id === result.winnerId
    lines.push(
      `${isBest ? '*' : ' '}[BGP/170] localpref ${c.localPreference}, weight ${c.weight}, from ${c.routerId}`,
    )
    lines.push(`              AS path: ${fakeAsPath(c.asPathLength)} ${ORIGIN_CODE[c.origin]}`)
    lines.push(`            > to ${c.neighborIp}`)
  })
  return lines.join('\n')
}

const DEFAULT_CANDIDATES: BgpCandidate[] = [
  {
    id: 'Path A',
    weight: 0,
    localPreference: 100,
    locallyOriginated: false,
    asPathLength: 3,
    origin: 'igp',
    med: 0,
    isEbgp: true,
    igpMetricToNextHop: 0,
    routeAgeSeconds: 100,
    routerId: '1.1.1.1',
    neighborIp: '10.0.0.1',
  },
  {
    id: 'Path B',
    weight: 0,
    localPreference: 100,
    locallyOriginated: false,
    asPathLength: 2,
    origin: 'igp',
    med: 0,
    isEbgp: true,
    igpMetricToNextHop: 0,
    routeAgeSeconds: 100,
    routerId: '2.2.2.2',
    neighborIp: '10.0.0.2',
  },
]

function Field({
  label,
  highlighted = false,
  children,
}: {
  label: string
  highlighted?: boolean
  children: ReactNode
}) {
  return (
    <label
      className={`flex flex-col gap-1 rounded-sm text-xs font-medium transition-colors ${
        highlighted ? 'text-accent' : 'text-fg-muted'
      }`}
    >
      {label}
      {children}
    </label>
  )
}

type CliVendor = 'cisco' | 'juniper'

export function BgpBestPathSelector() {
  const [candidates, setCandidates] = useState<BgpCandidate[]>(DEFAULT_CANDIDATES)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [hoveredStep, setHoveredStep] = useState<string | null>(null)
  const [showCli, setShowCli] = useState(false)
  const [cliVendor, setCliVendor] = useState<CliVendor>('cisco')

  const calc = selectBgpBestPath(candidates)
  const hoveredTrace =
    calc.ok && hoveredStep ? calc.result.trace.find((t) => t.step === hoveredStep) : undefined
  const highlightedField = hoveredStep ? STEP_TO_FIELD[hoveredStep] : undefined

  function updateCandidate(index: number, patch: Partial<BgpCandidate>) {
    setCandidates((current) => current.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  function removeCandidate(index: number) {
    setCandidates((current) => current.filter((_, i) => i !== index))
  }

  function addCandidate() {
    setCandidates((current) => [
      ...current,
      {
        ...DEFAULT_CANDIDATES[0]!,
        id: `Path ${String.fromCharCode(65 + current.length)}`,
        routerId: '3.3.3.3',
        neighborIp: '10.0.0.3',
      },
    ])
  }

  return (
    <ToolPageLayout
      category="Routing"
      title="BGP path comparison"
      description="Compare candidate BGP paths and see exactly which attribute decides the winner, in the standard tie-breaking order."
      input={
        <div className="flex flex-col gap-4">
          <Pill
            active={showAdvanced}
            onClick={() => setShowAdvanced((v) => !v)}
            className="self-start"
          >
            {showAdvanced ? 'Hide' : 'Show'} advanced attributes
          </Pill>
          {candidates.map((candidate, index) => {
            const eliminatedAtHover =
              hoveredTrace !== undefined && !hoveredTrace.remaining.includes(candidate.id)
            return (
              <div
                key={index}
                className={`rounded-md border border-border p-3 transition-opacity ${eliminatedAtHover ? 'opacity-40' : ''}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <Input
                    value={candidate.id}
                    onChange={(e) => updateCandidate(index, { id: e.target.value })}
                    className="max-w-[10rem] font-medium"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeCandidate(index)}
                    disabled={candidates.length <= 1}
                    aria-label="Remove candidate"
                  >
                    &times;
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Field label="Weight" highlighted={highlightedField === 'Weight'}>
                    <Input
                      value={candidate.weight}
                      onChange={(e) => updateCandidate(index, { weight: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Local pref" highlighted={highlightedField === 'Local pref'}>
                    <Input
                      value={candidate.localPreference}
                      onChange={(e) =>
                        updateCandidate(index, { localPreference: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="AS path length" highlighted={highlightedField === 'AS path length'}>
                    <Input
                      value={candidate.asPathLength}
                      onChange={(e) =>
                        updateCandidate(index, { asPathLength: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Origin" highlighted={highlightedField === 'Origin'}>
                    <Select
                      value={candidate.origin}
                      onChange={(e) =>
                        updateCandidate(index, { origin: e.target.value as BgpOrigin })
                      }
                    >
                      <option value="igp">IGP</option>
                      <option value="egp">EGP</option>
                      <option value="incomplete">Incomplete</option>
                    </Select>
                  </Field>
                  <Field label="MED" highlighted={highlightedField === 'MED'}>
                    <Input
                      value={candidate.med}
                      onChange={(e) => updateCandidate(index, { med: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Session" highlighted={highlightedField === 'Session'}>
                    <Select
                      value={candidate.isEbgp ? 'ebgp' : 'ibgp'}
                      onChange={(e) =>
                        updateCandidate(index, { isEbgp: e.target.value === 'ebgp' })
                      }
                    >
                      <option value="ebgp">eBGP</option>
                      <option value="ibgp">iBGP</option>
                    </Select>
                  </Field>
                  <Field label="IGP metric" highlighted={highlightedField === 'IGP metric'}>
                    <Input
                      value={candidate.igpMetricToNextHop}
                      onChange={(e) =>
                        updateCandidate(index, { igpMetricToNextHop: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field
                    label="Locally originated"
                    highlighted={highlightedField === 'Locally originated'}
                  >
                    <Select
                      value={candidate.locallyOriginated ? 'yes' : 'no'}
                      onChange={(e) =>
                        updateCandidate(index, { locallyOriginated: e.target.value === 'yes' })
                      }
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </Select>
                  </Field>
                  {showAdvanced && (
                    <>
                      <Field
                        label="Route age (s)"
                        highlighted={highlightedField === 'Route age (s)'}
                      >
                        <Input
                          value={candidate.routeAgeSeconds}
                          onChange={(e) =>
                            updateCandidate(index, { routeAgeSeconds: Number(e.target.value) })
                          }
                        />
                      </Field>
                      <Field label="Router ID" highlighted={highlightedField === 'Router ID'}>
                        <Input
                          value={candidate.routerId}
                          onChange={(e) => updateCandidate(index, { routerId: e.target.value })}
                        />
                      </Field>
                      <Field label="Neighbor IP" highlighted={highlightedField === 'Neighbor IP'}>
                        <Input
                          value={candidate.neighborIp}
                          onChange={(e) => updateCandidate(index, { neighborIp: e.target.value })}
                        />
                      </Field>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          <Button type="button" variant="secondary" onClick={addCandidate} className="self-start">
            + Add candidate
          </Button>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="Winner" value={calc.result.winnerId} />
              <ResultRow label="Decided by" value={calc.result.decidedByStep} />
            </dl>
            {calc.result.trace.length > 0 && (
              <GuidedMode
                steps={buildBgpGuidedSteps(candidates, calc.result)}
                closingNote={
                  <>
                    Order matters more than any single attribute -- a path can lose on every
                    attribute except the first one that actually differs, and that's the one that
                    decides. Everything below it in the list never even gets checked.
                  </>
                }
              >
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface">
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 font-medium text-fg-muted">Step</th>
                        <th className="px-3 py-2 font-medium text-fg-muted">
                          Still in the running
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {calc.result.trace.map((step) => (
                        <tr
                          key={step.step}
                          onMouseEnter={() => setHoveredStep(step.step)}
                          onMouseLeave={() => setHoveredStep(null)}
                          className={`border-b border-border font-mono transition-colors last:border-b-0 ${
                            hoveredStep === step.step ? 'bg-accent/10' : ''
                          }`}
                        >
                          <td className="px-3 py-2">{step.step}</td>
                          <td className="px-3 py-2">{step.remaining.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GuidedMode>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                  {showCli ? 'Hide' : 'Show'} route table output (expert)
                </Pill>
                {showCli && (
                  <div className="flex gap-2">
                    <Pill active={cliVendor === 'cisco'} onClick={() => setCliVendor('cisco')}>
                      Cisco IOS-XR
                    </Pill>
                    <Pill active={cliVendor === 'juniper'} onClick={() => setCliVendor('juniper')}>
                      Juniper
                    </Pill>
                  </div>
                )}
              </div>
              {showCli && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                  {cliVendor === 'cisco'
                    ? buildCiscoBgpOutput(candidates, calc.result)
                    : buildJuniperBgpOutput(candidates, calc.result)}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
