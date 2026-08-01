import { ScenarioPageLayout, ScenarioStage } from './ScenarioPageLayout'
import { RouteLookupSimulator } from '../tools/routing/RouteLookupSimulator'
import { AdministrativeDistanceReference } from '../tools/routing/AdministrativeDistanceReference'
import { RoutingDecisionVisualizer } from '../visualizers/RoutingDecisionVisualizer'

export function RoutingBlackHoleScenario() {
  return (
    <ScenarioPageLayout
      category="Routing"
      title="Routing black hole: a route exists, but traffic still disappears"
      setup={
        <>
          <p>
            The routing table clearly has a path to the destination. Nothing in the config looks
            wrong at a glance. But traffic bound for it just disappears -- no ICMP unreachable, no
            log entry, packets that simply never arrive.
          </p>
          <p>The table isn't lying. It's just not choosing the entry you'd expect.</p>
        </>
      }
      resolution={
        <p>
          A floating static route -- installed as a backup, deliberately given a high administrative
          distance so it would only ever be used if the real route went away -- had a typo that
          dropped its AD below the dynamic route it was supposed to defer to. It was permanently
          winning the tie and pointing traffic at a next hop decommissioned months earlier. Fixing
          the AD, not the route itself, closed the black hole.
        </p>
      }
    >
      <ScenarioStage
        number={1}
        title="Confirm what a lookup actually decides"
        narration="Longest prefix match happens first, always -- administrative distance is only a tiebreaker between routes with the exact same prefix length. A shorter, 'more trusted' route can lose to a longer, less trusted one, and that's correct behavior, not a bug. Build the failing destination against the real table entries below."
      >
        <RouteLookupSimulator />
      </ScenarioStage>

      <ScenarioStage
        number={2}
        title="Check whether a route is even the one you think it is"
        narration="A routing protocol that's actually down can still leave a phantom static or floating route installed with a low administrative distance, pointing at a next hop that's no longer valid. Compare the default AD of every source that could plausibly have installed this route."
      >
        <AdministrativeDistanceReference />
      </ScenarioStage>

      <ScenarioStage
        number={3}
        title="Watch the decision happen, step by step"
        narration="The same elimination -- match first, administrative distance only as the tiebreaker -- played out on a fixed example, one filter at a time."
      >
        <RoutingDecisionVisualizer />
      </ScenarioStage>
    </ScenarioPageLayout>
  )
}
