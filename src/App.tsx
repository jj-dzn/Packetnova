import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { PageShell } from './components/layout/PageShell'
import { RouteLoadingFallback } from './components/layout/RouteLoadingFallback'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ToolsPage } from './pages/ToolsPage'
import { VisualizersPage } from './pages/VisualizersPage'
import { ScenariosPage } from './pages/ScenariosPage'
import { SearchPage } from './pages/SearchPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { LabsPage } from './pages/LabsPage'

// Every individual tool/visualizer/lab page is lazy-loaded -- there are ~70
// of them, each only needed one at a time, and statically importing all of
// them (the previous approach) put every tool's code in the one bundle
// every page has to load, regardless of which page was actually requested.
// The page-shell/listing components above stay static: they're small, and
// used together often enough (browsing between them) that splitting them
// wouldn't help.
const CidrCalculator = lazy(() =>
  import('./features/tools/ip/CidrCalculator').then((m) => ({ default: m.CidrCalculator })),
)
const SubnetCalculator = lazy(() =>
  import('./features/tools/ip/SubnetCalculator').then((m) => ({ default: m.SubnetCalculator })),
)
const IpRangeCalculator = lazy(() =>
  import('./features/tools/ip/IpRangeCalculator').then((m) => ({
    default: m.IpRangeCalculator,
  })),
)
const BroadcastCalculator = lazy(() =>
  import('./features/tools/ip/BroadcastCalculator').then((m) => ({
    default: m.BroadcastCalculator,
  })),
)
const NetworkAddressCalculator = lazy(() =>
  import('./features/tools/ip/NetworkAddressCalculator').then((m) => ({
    default: m.NetworkAddressCalculator,
  })),
)
const Ipv6Calculator = lazy(() =>
  import('./features/tools/ip/Ipv6Calculator').then((m) => ({ default: m.Ipv6Calculator })),
)
const WildcardMaskCalculator = lazy(() =>
  import('./features/tools/ip/WildcardMaskCalculator').then((m) => ({
    default: m.WildcardMaskCalculator,
  })),
)
const RouteSummarizer = lazy(() =>
  import('./features/tools/ip/RouteSummarizer').then((m) => ({ default: m.RouteSummarizer })),
)
const MtuCalculator = lazy(() =>
  import('./features/tools/vpn/MtuCalculator').then((m) => ({ default: m.MtuCalculator })),
)
const MssCalculator = lazy(() =>
  import('./features/tools/vpn/MssCalculator').then((m) => ({ default: m.MssCalculator })),
)
const LatencyCalculator = lazy(() =>
  import('./features/tools/vpn/LatencyCalculator').then((m) => ({
    default: m.LatencyCalculator,
  })),
)
const TransferTimeCalculator = lazy(() =>
  import('./features/tools/vpn/TransferTimeCalculator').then((m) => ({
    default: m.TransferTimeCalculator,
  })),
)
const BandwidthEstimator = lazy(() =>
  import('./features/tools/vpn/BandwidthEstimator').then((m) => ({
    default: m.BandwidthEstimator,
  })),
)
const TunnelOverheadCalculator = lazy(() =>
  import('./features/tools/vpn/TunnelOverheadCalculator').then((m) => ({
    default: m.TunnelOverheadCalculator,
  })),
)
const PacketFragmentationCalculator = lazy(() =>
  import('./features/tools/vpn/PacketFragmentationCalculator').then((m) => ({
    default: m.PacketFragmentationCalculator,
  })),
)
const AdministrativeDistanceReference = lazy(() =>
  import('./features/tools/routing/AdministrativeDistanceReference').then((m) => ({
    default: m.AdministrativeDistanceReference,
  })),
)
const MetricComparisonTool = lazy(() =>
  import('./features/tools/routing/MetricComparisonTool').then((m) => ({
    default: m.MetricComparisonTool,
  })),
)
const LpmSimulator = lazy(() =>
  import('./features/tools/routing/LpmSimulator').then((m) => ({ default: m.LpmSimulator })),
)
const RouteLookupSimulator = lazy(() =>
  import('./features/tools/routing/RouteLookupSimulator').then((m) => ({
    default: m.RouteLookupSimulator,
  })),
)
const BgpBestPathSelector = lazy(() =>
  import('./features/tools/routing/BgpBestPathSelector').then((m) => ({
    default: m.BgpBestPathSelector,
  })),
)
const VlanCalculator = lazy(() =>
  import('./features/tools/switching/VlanCalculator').then((m) => ({
    default: m.VlanCalculator,
  })),
)
const Dot1qExplorer = lazy(() =>
  import('./features/tools/switching/Dot1qExplorer').then((m) => ({ default: m.Dot1qExplorer })),
)
const MacAddressLookup = lazy(() =>
  import('./features/tools/switching/MacAddressLookup').then((m) => ({
    default: m.MacAddressLookup,
  })),
)
const MacFormatter = lazy(() =>
  import('./features/tools/switching/MacFormatter').then((m) => ({ default: m.MacFormatter })),
)
const StpOverview = lazy(() =>
  import('./features/tools/switching/StpOverview').then((m) => ({ default: m.StpOverview })),
)
const TcpHeaderExplorer = lazy(() =>
  import('./features/tools/protocols/TcpHeaderExplorer').then((m) => ({
    default: m.TcpHeaderExplorer,
  })),
)
const UdpHeaderExplorer = lazy(() =>
  import('./features/tools/protocols/UdpHeaderExplorer').then((m) => ({
    default: m.UdpHeaderExplorer,
  })),
)
const IpHeaderExplorer = lazy(() =>
  import('./features/tools/protocols/IpHeaderExplorer').then((m) => ({
    default: m.IpHeaderExplorer,
  })),
)
const IcmpExplorer = lazy(() =>
  import('./features/tools/protocols/IcmpExplorer').then((m) => ({ default: m.IcmpExplorer })),
)
const DnsRecordReference = lazy(() =>
  import('./features/tools/protocols/DnsRecordReference').then((m) => ({
    default: m.DnsRecordReference,
  })),
)
const HttpStatusReference = lazy(() =>
  import('./features/tools/protocols/HttpStatusReference').then((m) => ({
    default: m.HttpStatusReference,
  })),
)
const TlsVersionExplorer = lazy(() =>
  import('./features/tools/protocols/TlsVersionExplorer').then((m) => ({
    default: m.TlsVersionExplorer,
  })),
)
const DhcpOptionsReference = lazy(() =>
  import('./features/tools/protocols/DhcpOptionsReference').then((m) => ({
    default: m.DhcpOptionsReference,
  })),
)
const HashGenerator = lazy(() =>
  import('./features/tools/security/HashGenerator').then((m) => ({ default: m.HashGenerator })),
)
const HashVerifier = lazy(() =>
  import('./features/tools/security/HashVerifier').then((m) => ({ default: m.HashVerifier })),
)
const JwtDecoder = lazy(() =>
  import('./features/tools/security/JwtDecoder').then((m) => ({ default: m.JwtDecoder })),
)
const Base64Tool = lazy(() =>
  import('./features/tools/security/Base64Tool').then((m) => ({ default: m.Base64Tool })),
)
const UrlEncodingTool = lazy(() =>
  import('./features/tools/security/UrlEncodingTool').then((m) => ({
    default: m.UrlEncodingTool,
  })),
)
const CertificateViewer = lazy(() =>
  import('./features/tools/security/CertificateViewer').then((m) => ({
    default: m.CertificateViewer,
  })),
)
const PasswordGenerator = lazy(() =>
  import('./features/tools/security/PasswordGenerator').then((m) => ({
    default: m.PasswordGenerator,
  })),
)
const RegexTester = lazy(() =>
  import('./features/tools/utilities/RegexTester').then((m) => ({ default: m.RegexTester })),
)
const JsonFormatterTool = lazy(() =>
  import('./features/tools/utilities/JsonFormatterTool').then((m) => ({
    default: m.JsonFormatterTool,
  })),
)
const YamlFormatterTool = lazy(() =>
  import('./features/tools/utilities/YamlFormatterTool').then((m) => ({
    default: m.YamlFormatterTool,
  })),
)
const XmlFormatterTool = lazy(() =>
  import('./features/tools/utilities/XmlFormatterTool').then((m) => ({
    default: m.XmlFormatterTool,
  })),
)
const EpochConverter = lazy(() =>
  import('./features/tools/utilities/EpochConverter').then((m) => ({
    default: m.EpochConverter,
  })),
)
const BaseConverterTool = lazy(() =>
  import('./features/tools/utilities/BaseConverterTool').then((m) => ({
    default: m.BaseConverterTool,
  })),
)
const AsciiConverterTool = lazy(() =>
  import('./features/tools/utilities/AsciiConverterTool').then((m) => ({
    default: m.AsciiConverterTool,
  })),
)
const TextDiffViewer = lazy(() =>
  import('./features/tools/utilities/TextDiffViewer').then((m) => ({
    default: m.TextDiffViewer,
  })),
)
const TcpHandshakeVisualizer = lazy(() =>
  import('./features/visualizers/TcpHandshakeVisualizer').then((m) => ({
    default: m.TcpHandshakeVisualizer,
  })),
)
const TlsHandshakeVisualizer = lazy(() =>
  import('./features/visualizers/TlsHandshakeVisualizer').then((m) => ({
    default: m.TlsHandshakeVisualizer,
  })),
)
const NatFlowVisualizer = lazy(() =>
  import('./features/visualizers/NatFlowVisualizer').then((m) => ({
    default: m.NatFlowVisualizer,
  })),
)
const VpnPacketFlowVisualizer = lazy(() =>
  import('./features/visualizers/VpnPacketFlowVisualizer').then((m) => ({
    default: m.VpnPacketFlowVisualizer,
  })),
)
const PacketEncapsulationVisualizer = lazy(() =>
  import('./features/visualizers/PacketEncapsulationVisualizer').then((m) => ({
    default: m.PacketEncapsulationVisualizer,
  })),
)
const OsiModelExplorer = lazy(() =>
  import('./features/visualizers/OsiModelExplorer').then((m) => ({
    default: m.OsiModelExplorer,
  })),
)
const TcpIpStackExplorer = lazy(() =>
  import('./features/visualizers/TcpIpStackExplorer').then((m) => ({
    default: m.TcpIpStackExplorer,
  })),
)
const RoutingDecisionVisualizer = lazy(() =>
  import('./features/visualizers/RoutingDecisionVisualizer').then((m) => ({
    default: m.RoutingDecisionVisualizer,
  })),
)
const BgpBestPathVisualizer = lazy(() =>
  import('./features/visualizers/BgpBestPathVisualizer').then((m) => ({
    default: m.BgpBestPathVisualizer,
  })),
)
const OspfSpfVisualizer = lazy(() =>
  import('./features/visualizers/OspfSpfVisualizer').then((m) => ({
    default: m.OspfSpfVisualizer,
  })),
)
const DhcpDoraVisualizer = lazy(() =>
  import('./features/visualizers/DhcpDoraVisualizer').then((m) => ({
    default: m.DhcpDoraVisualizer,
  })),
)
const TlsVersionComparisonVisualizer = lazy(() =>
  import('./features/visualizers/TlsVersionComparisonVisualizer').then((m) => ({
    default: m.TlsVersionComparisonVisualizer,
  })),
)
const Ipv4Ipv6HeaderComparisonVisualizer = lazy(() =>
  import('./features/visualizers/Ipv4Ipv6HeaderComparisonVisualizer').then((m) => ({
    default: m.Ipv4Ipv6HeaderComparisonVisualizer,
  })),
)
const StpRstpComparisonVisualizer = lazy(() =>
  import('./features/visualizers/StpRstpComparisonVisualizer').then((m) => ({
    default: m.StpRstpComparisonVisualizer,
  })),
)
const SiteToSiteVpnFailureScenario = lazy(() =>
  import('./features/scenarios/SiteToSiteVpnFailureScenario').then((m) => ({
    default: m.SiteToSiteVpnFailureScenario,
  })),
)
const SubnettingMistakeScenario = lazy(() =>
  import('./features/scenarios/SubnettingMistakeScenario').then((m) => ({
    default: m.SubnettingMistakeScenario,
  })),
)
const RoutingBlackHoleScenario = lazy(() =>
  import('./features/scenarios/RoutingBlackHoleScenario').then((m) => ({
    default: m.RoutingBlackHoleScenario,
  })),
)
const NatPortForwardingScenario = lazy(() =>
  import('./features/scenarios/NatPortForwardingScenario').then((m) => ({
    default: m.NatPortForwardingScenario,
  })),
)
const MtuFragmentationScenario = lazy(() =>
  import('./features/scenarios/MtuFragmentationScenario').then((m) => ({
    default: m.MtuFragmentationScenario,
  })),
)
const BgpPathSelectionScenario = lazy(() =>
  import('./features/scenarios/BgpPathSelectionScenario').then((m) => ({
    default: m.BgpPathSelectionScenario,
  })),
)
const VlanMisconfigurationScenario = lazy(() =>
  import('./features/scenarios/VlanMisconfigurationScenario').then((m) => ({
    default: m.VlanMisconfigurationScenario,
  })),
)
const NetworkJourneyPage = lazy(() =>
  import('./pages/NetworkJourneyPage').then((m) => ({ default: m.NetworkJourneyPage })),
)
const PingPet = lazy(() => import('./features/labs/PingPet').then((m) => ({ default: m.PingPet })))
const RetroTerminal = lazy(() =>
  import('./features/labs/RetroTerminal').then((m) => ({ default: m.RetroTerminal })),
)
const IpZodiac = lazy(() =>
  import('./features/labs/IpZodiac').then((m) => ({ default: m.IpZodiac })),
)
const HandleGenerator = lazy(() =>
  import('./features/labs/HandleGenerator').then((m) => ({ default: m.HandleGenerator })),
)
const CursedConfigGenerator = lazy(() =>
  import('./features/labs/CursedConfigGenerator').then((m) => ({
    default: m.CursedConfigGenerator,
  })),
)
const HackerTyper = lazy(() =>
  import('./features/labs/HackerTyper').then((m) => ({ default: m.HackerTyper })),
)
const DialUpSimulator = lazy(() =>
  import('./features/labs/DialUpSimulator').then((m) => ({ default: m.DialUpSimulator })),
)
const BlueScreenButton = lazy(() =>
  import('./features/labs/BlueScreenButton').then((m) => ({ default: m.BlueScreenButton })),
)
const TracerouteGhost = lazy(() =>
  import('./features/labs/TracerouteGhost').then((m) => ({ default: m.TracerouteGhost })),
)
const PingPetDuel = lazy(() =>
  import('./features/labs/PingPetDuel').then((m) => ({ default: m.PingPetDuel })),
)
const SignalDecoder = lazy(() =>
  import('./features/labs/SignalDecoder').then((m) => ({ default: m.SignalDecoder })),
)
const Maze404 = lazy(() => import('./features/labs/Maze404').then((m) => ({ default: m.Maze404 })))
const PacketSnake = lazy(() =>
  import('./features/labs/PacketSnake').then((m) => ({ default: m.PacketSnake })),
)
const PacketRunner = lazy(() =>
  import('./features/labs/PacketRunner').then((m) => ({ default: m.PacketRunner })),
)

function App() {
  return (
    <BrowserRouter>
      <PageShell>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/cidr-calculator" element={<CidrCalculator />} />
            <Route path="/tools/subnet-calculator" element={<SubnetCalculator />} />
            <Route path="/tools/ip-range-calculator" element={<IpRangeCalculator />} />
            <Route path="/tools/broadcast-calculator" element={<BroadcastCalculator />} />
            <Route
              path="/tools/network-address-calculator"
              element={<NetworkAddressCalculator />}
            />
            <Route path="/tools/ipv6-calculator" element={<Ipv6Calculator />} />
            <Route path="/tools/wildcard-mask-calculator" element={<WildcardMaskCalculator />} />
            <Route path="/tools/route-summarizer" element={<RouteSummarizer />} />
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
            <Route path="/tools/bgp-path-comparison" element={<BgpBestPathSelector />} />
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
            <Route path="/tools/hash-generator" element={<HashGenerator />} />
            <Route path="/tools/hash-verifier" element={<HashVerifier />} />
            <Route path="/tools/jwt-decoder" element={<JwtDecoder />} />
            <Route path="/tools/base64-encode-decode" element={<Base64Tool />} />
            <Route path="/tools/url-encode-decode" element={<UrlEncodingTool />} />
            <Route path="/tools/certificate-viewer" element={<CertificateViewer />} />
            <Route path="/tools/password-generator" element={<PasswordGenerator />} />
            <Route path="/tools/regex-tester" element={<RegexTester />} />
            <Route path="/tools/json-formatter" element={<JsonFormatterTool />} />
            <Route path="/tools/yaml-formatter" element={<YamlFormatterTool />} />
            <Route path="/tools/xml-formatter" element={<XmlFormatterTool />} />
            <Route path="/tools/epoch-converter" element={<EpochConverter />} />
            <Route path="/tools/binary-decimal-hex-converter" element={<BaseConverterTool />} />
            <Route path="/tools/ascii-converter" element={<AsciiConverterTool />} />
            <Route path="/tools/text-diff-viewer" element={<TextDiffViewer />} />
            <Route path="/visualizers" element={<VisualizersPage />} />
            <Route
              path="/visualizers/tcp-three-way-handshake"
              element={<TcpHandshakeVisualizer />}
            />
            <Route path="/visualizers/tls-handshake" element={<TlsHandshakeVisualizer />} />
            <Route path="/visualizers/nat-flow-simulator" element={<NatFlowVisualizer />} />
            <Route path="/visualizers/vpn-packet-flow" element={<VpnPacketFlowVisualizer />} />
            <Route
              path="/visualizers/packet-encapsulation"
              element={<PacketEncapsulationVisualizer />}
            />
            <Route path="/visualizers/osi-model-explorer" element={<OsiModelExplorer />} />
            <Route path="/visualizers/tcp-ip-stack-explorer" element={<TcpIpStackExplorer />} />
            <Route path="/visualizers/next-hop-selection" element={<RoutingDecisionVisualizer />} />
            <Route
              path="/visualizers/bgp-best-path-selection"
              element={<BgpBestPathVisualizer />}
            />
            <Route path="/visualizers/ospf-spf-animation" element={<OspfSpfVisualizer />} />
            <Route path="/visualizers/dhcp-dora-sequence" element={<DhcpDoraVisualizer />} />
            <Route
              path="/visualizers/tls-1-2-vs-1-3"
              element={<TlsVersionComparisonVisualizer />}
            />
            <Route
              path="/visualizers/ipv4-vs-ipv6-header"
              element={<Ipv4Ipv6HeaderComparisonVisualizer />}
            />
            <Route
              path="/visualizers/stp-vs-rstp-convergence"
              element={<StpRstpComparisonVisualizer />}
            />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route
              path="/scenarios/site-to-site-vpn-failure"
              element={<SiteToSiteVpnFailureScenario />}
            />
            <Route path="/scenarios/subnetting-mistake" element={<SubnettingMistakeScenario />} />
            <Route path="/scenarios/routing-black-hole" element={<RoutingBlackHoleScenario />} />
            <Route path="/scenarios/nat-port-forwarding" element={<NatPortForwardingScenario />} />
            <Route path="/scenarios/mtu-fragmentation" element={<MtuFragmentationScenario />} />
            <Route path="/scenarios/bgp-path-selection" element={<BgpPathSelectionScenario />} />
            <Route
              path="/scenarios/vlan-misconfiguration"
              element={<VlanMisconfigurationScenario />}
            />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/labs/ping-pet" element={<PingPet />} />
            <Route path="/labs/ip-zodiac" element={<IpZodiac />} />
            <Route path="/labs/handle-generator" element={<HandleGenerator />} />
            <Route path="/labs/cursed-config" element={<CursedConfigGenerator />} />
            <Route path="/labs/hacker-typer" element={<HackerTyper />} />
            <Route path="/labs/dial-up" element={<DialUpSimulator />} />
            <Route path="/labs/blue-screen" element={<BlueScreenButton />} />
            <Route path="/labs/traceroute-ghost" element={<TracerouteGhost />} />
            <Route path="/labs/ping-pet-duel" element={<PingPetDuel />} />
            <Route path="/labs/signal-decoder" element={<SignalDecoder />} />
            <Route path="/labs/404-maze" element={<Maze404 />} />
            <Route path="/labs/packet-snake" element={<PacketSnake />} />
            <Route path="/labs/packet-runner" element={<PacketRunner />} />
            <Route path="/terminal" element={<RetroTerminal />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/journey" element={<NetworkJourneyPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </PageShell>
    </BrowserRouter>
  )
}

export default App
