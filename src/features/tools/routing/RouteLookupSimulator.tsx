import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { Pill } from '../../../components/ui/Pill'
import { RangeOverlapDiagram } from '../../diagram/RangeOverlapDiagram'
import { EliminationSteps, type Candidate } from '../../visualizers/EliminationSteps'
import {
  simulateRouteLookup,
  type RouteLookupEntry,
  type RouteLookupMatch,
} from '../../../lib/calculations/routeLookup'
import { administrativeDistances } from '../../../content/reference/administrativeDistance'
import { useUrlState } from '../../../hooks/useUrlState'

const DEFAULT_ROUTES: RouteLookupEntry[] = [
  { cidr: '192.168.0.0/16', administrativeDistance: 1, label: 'Static' },
  { cidr: '192.168.1.0/24', administrativeDistance: 110, label: 'OSPF' },
]

// Maps a route's user-given label to the single-letter code Cisco's
// `show ip route` uses for that source -- falls back to the label's own
// first letter for a source this map doesn't recognize, so an unusual
// label still produces a plausible-looking code instead of nothing.
const PROTOCOL_CODES: Record<string, string> = {
  static: 'S',
  connected: 'C',
  ospf: 'O',
  eigrp: 'D',
  'internal eigrp': 'D',
  'external eigrp': 'D EX',
  rip: 'R',
  bgp: 'B',
  'internal bgp': 'B',
  'external bgp': 'B',
  'is-is': 'i',
  isis: 'i',
  igrp: 'I',
  egp: 'EG',
}

function protocolCode(label: string): string {
  return PROTOCOL_CODES[label.trim().toLowerCase()] ?? label.trim()[0]?.toUpperCase() ?? '?'
}

function buildShowIpRouteSnippet(
  matches: RouteLookupMatch[],
  winner: RouteLookupMatch | null,
): string {
  return matches
    .map((match) => {
      const code = protocolCode(match.label)
      const line = `${code.padEnd(5)}${match.cidr} [${match.administrativeDistance}/0] via 0.0.0.0`
      return match === winner ? `${line}  ! installed` : line
    })
    .join('\n')
}

// Two-stage decision tree: longest prefix match always runs first and
// decides outright whenever it isn't a tie, with administrative distance
// only ever entering the picture to break a tie at that longest prefix --
// reuses the same EliminationSteps/GuidedMode pairing already proven on
// the BGP tool, just with a different (much shorter) chain of steps.
function buildRouteLookupGuidedSteps(matches: RouteLookupMatch[]): GuidedStep[] {
  const candidates: Candidate[] = matches.map((match, i) => ({
    id: String(i),
    label: match.label,
    detail: `${match.cidr} · AD ${match.administrativeDistance}`,
  }))
  const allIds = candidates.map((c) => c.id)
  const matchingIndexed = matches
    .map((match, i) => ({ match, id: String(i) }))
    .filter((m) => m.match.matches)
  const matchingIds = matchingIndexed.map((m) => m.id)

  const steps: { title: string; description: string; remainingIds: string[] }[] = [
    {
      title: 'All configured routes',
      description: `${matches.length} route${matches.length === 1 ? '' : 's'} configured. First, check which ones even contain the destination.`,
      remainingIds: allIds,
    },
    {
      title: 'Does the route contain the destination?',
      description:
        matchingIds.length === 0
          ? 'None of these routes contain the destination -- there is no match.'
          : `${matchingIds.length} of ${matches.length} route${matches.length === 1 ? '' : 's'} contain the destination address.`,
      remainingIds: matchingIds,
    },
  ]

  if (matchingIndexed.length > 0) {
    const longestPrefix = Math.max(...matchingIndexed.map((m) => m.match.prefixLength))
    const longest = matchingIndexed.filter((m) => m.match.prefixLength === longestPrefix)
    const longestIds = longest.map((m) => m.id)

    steps.push({
      title: 'Longest prefix match: keep only the most specific',
      description:
        longest.length === 1
          ? `Only one route matches at the longest prefix length, /${longestPrefix} -- it wins outright, administrative distance is never even considered.`
          : `${longest.length} routes are tied at the longest prefix length, /${longestPrefix} -- longest prefix match alone can't break this tie.`,
      remainingIds: longestIds,
    })

    if (longest.length > 1) {
      const winner = longest.reduce((best, current) =>
        current.match.administrativeDistance < best.match.administrativeDistance ? current : best,
      )
      steps.push({
        title: 'Administrative distance breaks the tie',
        description: `${longest.length} routes tied on prefix length -- the lowest administrative distance wins. ${winner.match.label} (AD ${winner.match.administrativeDistance}) takes it.`,
        remainingIds: [winner.id],
      })
    }
  }

  return steps.map((step, index) => ({
    title: step.title,
    description: step.description,
    content: (
      <EliminationSteps candidates={candidates} step={step} isFinal={index === steps.length - 1} />
    ),
  }))
}

export function RouteLookupSimulator() {
  const [destination, setDestination] = useUrlState('destination', '192.168.1.10')
  const [routes, setRoutes] = useState<RouteLookupEntry[]>(DEFAULT_ROUTES)
  const [showCli, setShowCli] = useState(false)

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
      status={calc.ok ? 'ok' : 'error'}
      related={[
        {
          to: '/tools/administrative-distance-reference',
          label: 'Administrative distance reference',
        },
        { to: '/scenarios/routing-black-hole', label: 'Scenario: Routing black hole' },
        { to: '/labs/traceroute-ghost', label: 'Labs: a ghost travels hop by hop' },
      ]}
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
            <Aside>
              Administrative distance breaks ties between routes learned from different sources --
              static, OSPF, BGP -- lower AD wins, regardless of how good any of those routes
              actually are. Metric breaks ties within a single source, when that source itself
              offers more than one path (e.g. two OSPF routes with different costs). This simulator
              only models the AD tiebreak, which is why it's the deciding factor whenever two
              matching routes come from different sources.
            </Aside>
            <RangeOverlapDiagram
              destinationIp={destination}
              routes={calc.result.matches.map((match) => ({
                cidr: match.cidr,
                label: match.label,
                prefixLength: match.prefixLength,
                matches: match.matches,
                isWinner: calc.result.winner === match,
              }))}
            />
            <GuidedMode
              steps={buildRouteLookupGuidedSteps(calc.result.matches)}
              closingNote={
                <>
                  Longest prefix match always decides between routes to different network sizes --
                  administrative distance only ever breaks a tie between routes to the exact same
                  network. A router never considers AD first and LPM second.
                </>
              }
            >
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
            </GuidedMode>
            <div>
              <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                {showCli ? 'Hide' : 'Show'} routing table output (expert)
              </Pill>
              {showCli && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                  {buildShowIpRouteSnippet(calc.result.matches, calc.result.winner)}
                </pre>
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
            Two strictly ordered stages, never reversed: first, narrow to whichever configured
            routes actually contain the destination at the longest prefix length available -- if
            exactly one route wins that, it's installed and administrative distance is never even
            checked. Only when two or more routes tie at that same longest prefix does
            administrative distance step in to break the tie.
          </p>
        }
        whenToUseThis={
          <p>
            Working out which route actually gets installed when a router has more than one
            candidate path to a destination -- especially the case people get backwards, where a
            worse-trusted source (a higher AD) still wins because its route is more specific than a
            better-trusted source's broader one.
          </p>
        }
        commonMistakes={
          <p>
            Administrative distance isn't a protocol standard -- it's a per-vendor default table
            (this one's Cisco's), and a different vendor can and does assign different numbers to
            the same source. The other easy mix-up: lower AD means more trusted, not better or
            faster -- a directly connected interface's AD of 0 beats a static route's 1, which beats
            eBGP's 20, regardless of which one actually offers a better path.
          </p>
        }
        relatedReading={
          <p>
            The{' '}
            <Link
              to="/tools/administrative-distance-reference"
              className="text-accent hover:underline"
            >
              administrative distance reference
            </Link>{' '}
            has the full default table this tool draws from; the{' '}
            <Link
              to="/tools/longest-prefix-match-simulator"
              className="text-accent hover:underline"
            >
              longest prefix match simulator
            </Link>{' '}
            isolates just the first stage on its own.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
