import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { simulateRouteLookup, type RouteLookupEntry } from '../../../lib/calculations/routeLookup'
import { administrativeDistances } from '../../../content/reference/administrativeDistance'

const DEFAULT_ROUTES: RouteLookupEntry[] = [
  { cidr: '192.168.0.0/16', administrativeDistance: 1, label: 'Static' },
  { cidr: '192.168.1.0/24', administrativeDistance: 110, label: 'OSPF' },
]

export function RouteLookupSimulator() {
  const [destination, setDestination] = useState('192.168.1.10')
  const [routes, setRoutes] = useState<RouteLookupEntry[]>(DEFAULT_ROUTES)

  const calc = simulateRouteLookup(destination, routes)

  function updateRoute(index: number, patch: Partial<RouteLookupEntry>) {
    setRoutes((current) =>
      current.map((route, i) => (i === index ? { ...route, ...patch } : route)),
    )
  }

  function removeRoute(index: number) {
    setRoutes((current) => current.filter((_, i) => i !== index))
  }

  function addRoute() {
    setRoutes((current) => [
      ...current,
      {
        cidr: '',
        administrativeDistance: administrativeDistances[0]!.distance,
        label: `Route ${current.length + 1}`,
      },
    ])
  }

  return (
    <ToolPageLayout
      category="Routing"
      title="Route lookup simulator"
      description="Step through how a router picks the next hop: longest prefix match first, administrative distance only as a tiebreaker."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="lookup-destination" className="text-sm font-medium">
              Destination IP
            </label>
            <Input
              id="lookup-destination"
              className="mt-2"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Routes</span>
            {routes.map((route, index) => (
              <div key={index} className="flex flex-wrap gap-2">
                <Input
                  value={route.cidr}
                  onChange={(e) => updateRoute(index, { cidr: e.target.value })}
                  placeholder="10.0.0.0/8"
                  className="min-w-[9rem] flex-1"
                />
                <Input
                  value={route.label}
                  onChange={(e) => updateRoute(index, { label: e.target.value })}
                  placeholder="Label"
                  className="min-w-[7rem] flex-1"
                />
                <Select
                  value={route.administrativeDistance}
                  onChange={(e) =>
                    updateRoute(index, { administrativeDistance: Number(e.target.value) })
                  }
                  className="min-w-[9rem] flex-1"
                >
                  {administrativeDistances.map((entry) => (
                    <option key={entry.source} value={entry.distance}>
                      {entry.source} ({entry.distance})
                    </option>
                  ))}
                </Select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeRoute(index)}
                  disabled={routes.length <= 1}
                  aria-label="Remove route"
                >
                  &times;
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addRoute} className="self-start">
              + Add route
            </Button>
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow
                label="Winner"
                value={calc.result.winner ? calc.result.winner.label : 'No match'}
              />
              <ResultRow label="Decided by" value={calc.result.decidedBy ?? 'N/A'} />
            </dl>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 font-medium text-fg-muted">Route</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Prefix</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">AD</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Matches?</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.result.matches.map((match, index) => (
                    <tr
                      key={index}
                      className={`border-b border-border font-mono last:border-b-0 ${
                        calc.result.winner === match ? 'bg-accent/10' : ''
                      }`}
                    >
                      <td className="px-3 py-2">{match.label}</td>
                      <td className="px-3 py-2">/{match.prefixLength}</td>
                      <td className="px-3 py-2">{match.administrativeDistance}</td>
                      <td className="px-3 py-2">{match.matches ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
