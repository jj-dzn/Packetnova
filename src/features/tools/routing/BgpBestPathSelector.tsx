import { useState, type ReactNode } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { Pill } from '../../../components/ui/Pill'
import {
  selectBgpBestPath,
  type BgpCandidate,
  type BgpOrigin,
} from '../../../lib/calculations/bgpBestPath'

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

export function BgpBestPathSelector() {
  const [candidates, setCandidates] = useState<BgpCandidate[]>(DEFAULT_CANDIDATES)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [hoveredStep, setHoveredStep] = useState<string | null>(null)

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
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 font-medium text-fg-muted">Step</th>
                      <th className="px-3 py-2 font-medium text-fg-muted">Still in the running</th>
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
            )}
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
