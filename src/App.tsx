import { BrowserRouter, Routes, Route } from 'react-router'
import { PageShell } from './components/layout/PageShell'
import { HomePage } from './pages/HomePage'
import { ToolsPage } from './pages/ToolsPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { SearchPage } from './pages/SearchPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CidrCalculator } from './features/tools/ip/CidrCalculator'
import { SubnetCalculator } from './features/tools/ip/SubnetCalculator'
import { IpRangeCalculator } from './features/tools/ip/IpRangeCalculator'
import { BroadcastCalculator } from './features/tools/ip/BroadcastCalculator'
import { NetworkAddressCalculator } from './features/tools/ip/NetworkAddressCalculator'
import { MtuCalculator } from './features/tools/vpn/MtuCalculator'
import { MssCalculator } from './features/tools/vpn/MssCalculator'
import { LatencyCalculator } from './features/tools/vpn/LatencyCalculator'
import { TransferTimeCalculator } from './features/tools/vpn/TransferTimeCalculator'
import { BandwidthEstimator } from './features/tools/vpn/BandwidthEstimator'
import { TunnelOverheadCalculator } from './features/tools/vpn/TunnelOverheadCalculator'
import { PacketFragmentationCalculator } from './features/tools/vpn/PacketFragmentationCalculator'
import { AdministrativeDistanceReference } from './features/tools/routing/AdministrativeDistanceReference'
import { MetricComparisonTool } from './features/tools/routing/MetricComparisonTool'
import { LpmSimulator } from './features/tools/routing/LpmSimulator'
import { RouteLookupSimulator } from './features/tools/routing/RouteLookupSimulator'
import { BgpBestPathSelector } from './features/tools/routing/BgpBestPathSelector'
import { VlanCalculator } from './features/tools/switching/VlanCalculator'
import { Dot1qExplorer } from './features/tools/switching/Dot1qExplorer'
import { MacAddressLookup } from './features/tools/switching/MacAddressLookup'
import { MacFormatter } from './features/tools/switching/MacFormatter'
import { StpOverview } from './features/tools/switching/StpOverview'
import { TcpHeaderExplorer } from './features/tools/protocols/TcpHeaderExplorer'
import { UdpHeaderExplorer } from './features/tools/protocols/UdpHeaderExplorer'
import { IpHeaderExplorer } from './features/tools/protocols/IpHeaderExplorer'
import { IcmpExplorer } from './features/tools/protocols/IcmpExplorer'
import { DnsRecordReference } from './features/tools/protocols/DnsRecordReference'
import { HttpStatusReference } from './features/tools/protocols/HttpStatusReference'
import { TlsVersionExplorer } from './features/tools/protocols/TlsVersionExplorer'
import { DhcpOptionsReference } from './features/tools/protocols/DhcpOptionsReference'

function App() {
  return (
    <BrowserRouter>
      <PageShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/cidr-calculator" element={<CidrCalculator />} />
          <Route path="/tools/subnet-calculator" element={<SubnetCalculator />} />
          <Route path="/tools/ip-range-calculator" element={<IpRangeCalculator />} />
          <Route path="/tools/broadcast-calculator" element={<BroadcastCalculator />} />
          <Route path="/tools/network-address-calculator" element={<NetworkAddressCalculator />} />
          <Route path="/tools/mtu-calculator" element={<MtuCalculator />} />
          <Route path="/tools/mss-calculator" element={<MssCalculator />} />
          <Route path="/tools/latency-calculator" element={<LatencyCalculator />} />
          <Route path="/tools/transfer-time-calculator" element={<TransferTimeCalculator />} />
          <Route path="/tools/bandwidth-estimator" element={<BandwidthEstimator />} />
          <Route
            path="/tools/vpn-tunnel-overhead-calculator"
            element={<TunnelOverheadCalculator />}
          />
          <Route
            path="/tools/packet-fragmentation-calculator"
            element={<PacketFragmentationCalculator />}
          />
          <Route
            path="/tools/administrative-distance-reference"
            element={<AdministrativeDistanceReference />}
          />
          <Route path="/tools/metric-comparison-tool" element={<MetricComparisonTool />} />
          <Route path="/tools/longest-prefix-match-simulator" element={<LpmSimulator />} />
          <Route path="/tools/route-lookup-simulator" element={<RouteLookupSimulator />} />
          <Route path="/tools/bgp-route-visualizer" element={<BgpBestPathSelector />} />
          <Route path="/tools/vlan-calculator" element={<VlanCalculator />} />
          <Route path="/tools/802-1q-tag-explorer" element={<Dot1qExplorer />} />
          <Route path="/tools/mac-address-lookup" element={<MacAddressLookup />} />
          <Route path="/tools/mac-formatter" element={<MacFormatter />} />
          <Route path="/tools/stp-overview" element={<StpOverview />} />
          <Route path="/tools/tcp-header-explorer" element={<TcpHeaderExplorer />} />
          <Route path="/tools/udp-header-explorer" element={<UdpHeaderExplorer />} />
          <Route path="/tools/ip-header-explorer" element={<IpHeaderExplorer />} />
          <Route path="/tools/icmp-explorer" element={<IcmpExplorer />} />
          <Route path="/tools/dns-record-reference" element={<DnsRecordReference />} />
          <Route path="/tools/http-status-reference" element={<HttpStatusReference />} />
          <Route path="/tools/tls-version-explorer" element={<TlsVersionExplorer />} />
          <Route path="/tools/dhcp-options-reference" element={<DhcpOptionsReference />} />
          <Route path="/visualizers" element={<ComingSoonPage title="Visualizers" />} />
          <Route path="/blog" element={<ComingSoonPage title="Blog" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageShell>
    </BrowserRouter>
  )
}

export default App
