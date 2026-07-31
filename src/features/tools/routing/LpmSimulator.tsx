import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { simulateLpm, type RouteEntry } from '../../../lib/calculations/lpm'

const DEFAULT_ROUTES: RouteEntry[] = [
  { cidr: '0.0.0.0/0', label: 'Default' },
  { cidr: '192.168.0.0/16', label: 'Aggregate' },
  { cidr: '192.168.1.0/24', label: 'Specific' },
]

export function LpmSimulator() {
  const [destination, setDestination] = useState('192.168.1.10')
  const [routes, setRoutes] = useState<RouteEntry[]>(DEFAULT_ROUTES)

  const calc = simulateLpm(destination, routes)

  function updateRoute(index: number, patch: Partial<RouteEntry>) {
    setRoutes((current) =>
      current.map((route, i) => (i === index ? { ...route, ...patch } : route)),
    )
  }

  function removeRoute(index: number) {
    setRoutes((current) => current.filter((_, i) => i !== index))
  }

  function addRoute() {
    setRoutes((current) => [...current, { cidr: '', label: `Route ${current.length + 1}` }])
  }

  return (
    <ToolPageLayout
      category="Routing"
      title="Longest prefix match simulator"
      description="See which route wins when multiple entries in a routing table overlap the same destination."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="lpm-destination" className="text-sm font-medium">
              Destination IP
            </label>
            <Input
              id="lpm-destination"
              className="mt-2"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Routes</span>
            {routes.map((route, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={route.cidr}
                  onChange={(e) => updateRoute(index, { cidr: e.target.value })}
                  placeholder="10.0.0.0/8"
                  className="flex-1"
                />
                <Input
                  value={route.label}
                  onChange={(e) => updateRoute(index, { label: e.target.value })}
                  placeholder="Label"
                  className="flex-1"
                />
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
            </dl>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 font-medium text-fg-muted">Route</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Prefix</th>
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
