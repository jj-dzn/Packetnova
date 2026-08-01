import { ScenarioPageLayout, ScenarioStage } from './ScenarioPageLayout'
import { TunnelOverheadCalculator } from '../tools/vpn/TunnelOverheadCalculator'
import { MtuCalculator } from '../tools/vpn/MtuCalculator'
import { PacketFragmentationCalculator } from '../tools/vpn/PacketFragmentationCalculator'
import { VpnPacketFlowVisualizer } from '../visualizers/VpnPacketFlowVisualizer'

export function SiteToSiteVpnFailureScenario() {
  return (
    <ScenarioPageLayout
      category="VPN"
      title="Site-to-site VPN failure: small requests work, large transfers hang"
      setup={
        <>
          <p>
            A site-to-site tunnel is up and shows no errors. SSH sessions, small HTTP requests, and
            pings all work fine across it. But a large file transfer or a bulky RDP session just
            hangs -- no error message, no reset, just silence once the data gets big enough.
          </p>
          <p>
            This is the single most common "invisible" VPN failure, and it's rarely the tunnel
            itself that's broken.
          </p>
        </>
      }
      resolution={
        <p>
          Clamping the sender's MSS to fit inside the tunnel's real capacity -- or making sure the
          path isn't silently dropping the ICMP "fragmentation needed" message Path MTU Discovery
          depends on -- turns the silent hang back into a working transfer. Increasing the link MTU
          is almost never the actual fix.
        </p>
      }
    >
      <ScenarioStage
        number={1}
        title="Check what the tunnel itself actually costs"
        narration="Every VPN encapsulation method wraps the original packet in its own headers before it goes out. That overhead comes out of the link's usable MTU, not on top of it -- start by seeing exactly how much this tunnel type eats."
      >
        <TunnelOverheadCalculator />
      </ScenarioStage>

      <ScenarioStage
        number={2}
        title="See whether a full-size packet still fits"
        narration="Feed that overhead in here as the tunnel interface's effective overhead, and test it against the size of packet the large transfer is actually sending. This is the calculation a VPN gateway itself does per-packet, just made visible."
      >
        <MtuCalculator />
      </ScenarioStage>

      <ScenarioStage
        number={3}
        title="See what happens when it doesn't fit"
        narration="If nothing clamped the segment size in advance, an oversized packet doesn't just get dropped with a clean error -- it gets fragmented, or it depends entirely on Path MTU Discovery working. A firewall along the path silently eating that ICMP message is exactly what produces a hang with no visible error."
      >
        <PacketFragmentationCalculator />
      </ScenarioStage>

      <ScenarioStage
        number={4}
        title="Watch it happen on the actual wire"
        narration="Step through the encapsulation itself -- the client wrapping and encrypting the original packet, the gateway unwrapping it, and the same process in reverse for the reply. This is what every packet in the failing transfer is actually going through."
      >
        <VpnPacketFlowVisualizer />
      </ScenarioStage>
    </ScenarioPageLayout>
  )
}
