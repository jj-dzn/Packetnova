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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-fg-muted">
      {label}
      {children}
    </label>
  )
}

export function BgpBestPathSelector() {
  const [candidates, setCandidates] = useState<BgpCandidate[]>(DEFAULT_CANDIDATES)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const calc = selectBgpBestPath(candidates)

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
      title="BGP route visualizer"
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
          {candidates.map((candidate, index) => (
            <div key={index} className="rounded-md border border-border p-3">
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
                <Field label="Weight">
                  <Input
                    value={candidate.weight}
                    onChange={(e) => updateCandidate(index, { weight: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Local pref">
                  <Input
                    value={candidate.localPreference}
                    onChange={(e) =>
                      updateCandidate(index, { localPreference: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="AS path length">
                  <Input
                    value={candidate.asPathLength}
                    onChange={(e) =>
                      updateCandidate(index, { asPathLength: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Origin">
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
                <Field label="MED">
                  <Input
                    value={candidate.med}
                    onChange={(e) => updateCandidate(index, { med: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Session">
                  <Select
                    value={candidate.isEbgp ? 'ebgp' : 'ibgp'}
                    onChange={(e) => updateCandidate(index, { isEbgp: e.target.value === 'ebgp' })}
                  >
                    <option value="ebgp">eBGP</option>
                    <option value="ibgp">iBGP</option>
                  </Select>
                </Field>
                <Field label="IGP metric">
                  <Input
                    value={candidate.igpMetricToNextHop}
                    onChange={(e) =>
                      updateCandidate(index, { igpMetricToNextHop: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Locally originated">
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
                    <Field label="Route age (s)">
                      <Input
                        value={candidate.routeAgeSeconds}
                        onChange={(e) =>
                          updateCandidate(index, { routeAgeSeconds: Number(e.target.value) })
                        }
                      />
                    </Field>
                    <Field label="Router ID">
                      <Input
                        value={candidate.routerId}
                        onChange={(e) => updateCandidate(index, { routerId: e.target.value })}
                      />
                    </Field>
                    <Field label="Neighbor IP">
                      <Input
                        value={candidate.neighborIp}
                        onChange={(e) => updateCandidate(index, { neighborIp: e.target.value })}
                      />
                    </Field>
                  </>
                )}
              </div>
            </div>
          ))}
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
                        className="border-b border-border font-mono last:border-b-0"
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
