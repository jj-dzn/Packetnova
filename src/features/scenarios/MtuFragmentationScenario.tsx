import { ScenarioPageLayout, ScenarioStage } from './ScenarioPageLayout'
import { MtuCalculator } from '../tools/vpn/MtuCalculator'

export function MtuFragmentationScenario() {
  return (
    <ScenarioPageLayout
      category="VPN"
      title="MTU issue: everything small works, larger transfers just hang"
      setup={
        <>
          <p>
            Small requests -- DNS lookups, pings, a login handshake -- all work without any trouble.
            But the moment a transfer needs a full-size packet, it hangs instead of failing cleanly.
            No error, no reset, just silence past a certain size.
          </p>
          <p>
            This is really one chain of three related questions, not three separate problems -- walk
            all of it in one place below instead of three separate tool visits.
          </p>
        </>
      }
      resolution={
        <p>
          MSS gets negotiated once, at connection setup, specifically so a TCP sender never has to
          find out the hard way that a packet doesn't fit. Get that clamped to the link's real
          effective MTU and fragmentation as a fallback almost never has to run at all -- which is
          exactly why fixing MSS, not chasing fragmentation after the fact, is what actually closes
          this kind of hang.
        </p>
      }
    >
      <ScenarioStage
        number={1}
        title="Walk the whole chain: fit, prevention, and fallback"
        narration="Enter the link's real MTU and overhead, then test it against a payload size close to what the hanging transfer is actually sending. The guided walkthrough below chains all three questions together: does it fit, what should have prevented this, and what happens if nothing did."
      >
        <MtuCalculator />
      </ScenarioStage>
    </ScenarioPageLayout>
  )
}
