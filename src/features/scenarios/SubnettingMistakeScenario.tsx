import { Link } from 'react-router'
import { ScenarioPageLayout, ScenarioStage } from './ScenarioPageLayout'
import { SubnetCalculator } from '../tools/ip/SubnetCalculator'
import { RouteSummarizer } from '../tools/ip/RouteSummarizer'
import { LpmSimulator } from '../tools/routing/LpmSimulator'

export function SubnettingMistakeScenario() {
  return (
    <ScenarioPageLayout
      category="IP"
      title="Subnetting mistake: why did this host get the wrong route"
      setup={
        <>
          <p>
            A new site was carved out of an existing address block using VLSM -- variable-length
            subnets, each sized to what it actually needs instead of one uniform split. Shortly
            after, a host at the new site started reaching the wrong destination, or nothing at all.
          </p>
          <p>Walk back through how the addressing was actually built to find where it broke.</p>
        </>
      }
      resolution={
        <>
          <p>
            The aggregate route being advertised upstream didn't actually cover the new VLSM block
            on a clean power-of-2-aligned boundary, so it silently missed it. Re-summarizing
            correctly -- or advertising the specific block alongside the aggregate -- fixed
            reachability without touching the addressing plan itself.
          </p>
          <p>
            <Link to="/paths/subnetting-fluency" className="text-accent hover:underline">
              Build this intuition from the ground up in the Subnetting fluency path.
            </Link>
          </p>
        </>
      }
    >
      <ScenarioStage
        number={1}
        title="Re-derive how the block was actually split"
        narration="Switch to Variable (VLSM) mode below and rebuild the same allocation: largest request first, each subnet sized to what it needs rather than split evenly. That ordering is what determines exactly which addresses ended up where."
      >
        <SubnetCalculator />
      </ScenarioStage>

      <ScenarioStage
        number={2}
        title="Check what got summarized upstream"
        narration="Upstream routers don't see the individual VLSM blocks -- only whatever aggregate route was advertised to represent them. Paste the new site's blocks in and see whether they actually collapse cleanly, or whether the real aggregate has to be wider (or split) to cover them honestly."
      >
        <RouteSummarizer />
      </ScenarioStage>

      <ScenarioStage
        number={3}
        title="Confirm which specific route a host actually uses"
        narration="Longest prefix match decides which table entry wins when ranges overlap -- exactly what a mis-scoped summary route produces. Enter the failing host's address against both the aggregate and the specific block to see which one it's actually matching."
      >
        <LpmSimulator />
      </ScenarioStage>
    </ScenarioPageLayout>
  )
}
