import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { BitFieldDiagram } from '../BitFieldDiagram'
import { FrameFieldStrip } from '../FrameFieldStrip'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { calculateDot1qTag, type Dot1qResult } from '../../../lib/calculations/dot1q'

// The TCI isn't three separate numbers -- it's one 16-bit value built by
// shifting each field into its own bit range and OR-ing them together.
// Walking through that bit-by-bit is what actually explains where the
// final hex value comes from, instead of just presenting it.
function buildDot1qSteps(result: Dot1qResult): GuidedStep[] {
  const pcpShifted = (result.pcp << 13) >>> 0
  const withDei = (pcpShifted | (result.dei << 12)) >>> 0
  const combined = (withDei | result.vlanId) >>> 0

  return [
    {
      title: '1. Priority (PCP) -- 3 bits, shifted to the top',
      description: `PCP ${result.pcp} occupies the top 3 bits of the 16-bit TCI (bits 15-13) -- shifted left by 13 to land there.`,
      content: (
        <ResultRow
          label={`${result.pcp} << 13`}
          value={`0b${pcpShifted.toString(2).padStart(16, '0')}`}
        />
      ),
    },
    {
      title: '2. Drop Eligible (DEI) -- 1 bit, shifted next',
      description: `DEI ${result.dei} takes bit 12, shifted left by 12, then OR-ed with PCP -- each field occupies its own bits, so combining them with OR never collides.`,
      content: (
        <ResultRow
          label={`... | (${result.dei} << 12)`}
          value={`0b${withDei.toString(2).padStart(16, '0')}`}
        />
      ),
    },
    {
      title: '3. VLAN ID -- 12 bits, fills the rest',
      description: `VLAN ${result.vlanId} fits directly in the remaining 12 bits (bits 11-0), no shift needed -- it already sits at the low end of the field.`,
      content: (
        <ResultRow
          label={`... | ${result.vlanId}`}
          value={`0x${combined.toString(16).padStart(4, '0')} = TCI`}
        />
      ),
    },
  ]
}

// The standard IEEE 802.1p priority-to-traffic-class mapping -- the same 8
// values every PCP field ever holds, so naming them turns "5" into
// something a visitor actually recognizes (this is why VoIP configs
// specifically care about PCP 5).
const DOT1P_PRIORITIES = [
  { value: 0, label: '0 -- Best Effort (default)' },
  { value: 1, label: '1 -- Background' },
  { value: 2, label: '2 -- Excellent Effort' },
  { value: 3, label: '3 -- Critical Applications' },
  { value: 4, label: '4 -- Video (< 100ms latency)' },
  { value: 5, label: '5 -- Voice (< 10ms latency)' },
  { value: 6, label: '6 -- Internetwork Control' },
  { value: 7, label: '7 -- Network Control' },
]

export function Dot1qExplorer() {
  const [pcp, setPcp] = useState('0')
  const [dei, setDei] = useState('0')
  const [vlanId, setVlanId] = useState('100')

  const calc = calculateDot1qTag(Number(pcp), Number(dei), Number(vlanId))

  return (
    <ToolPageLayout
      category="Switching"
      title="802.1Q tag explorer"
      description="Build an 802.1Q tag from its PCP, DEI, and VLAN ID fields and see the resulting TCI and full tag."
      status={calc.ok ? 'ok' : 'error'}
      related={[
        { to: '/tools/vlan-calculator', label: 'VLAN calculator' },
        { to: '/scenarios/vlan-misconfiguration', label: 'Scenario: VLAN misconfiguration' },
      ]}
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="dot1q-pcp" className="text-sm font-medium">
              PCP -- Priority Code Point (0-7)
            </label>
            <Select
              id="dot1q-pcp"
              className="mt-2"
              value={pcp}
              onChange={(e) => setPcp(e.target.value)}
            >
              {DOT1P_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="dot1q-dei" className="text-sm font-medium">
              DEI (0 or 1)
            </label>
            <Input
              id="dot1q-dei"
              className="mt-2"
              value={dei}
              onChange={(e) => setDei(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="dot1q-vlan" className="text-sm font-medium">
              VLAN ID (0-4095)
            </label>
            <Input
              id="dot1q-vlan"
              className="mt-2"
              value={vlanId}
              onChange={(e) => setVlanId(e.target.value)}
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <GuidedMode steps={buildDot1qSteps(calc.result)}>
            <div className="flex flex-col gap-4">
              <dl>
                <ResultRow label="TPID" value="0x8100" />
                <ResultRow label="TCI" value={`0x${calc.result.tciHex}`} />
                <ResultRow label="Full tag" value={`0x${calc.result.fullTagHex}`} />
              </dl>
              <div>
                <p className="mb-1 text-xs font-medium text-fg-muted">TCI (16 bits) broken down</p>
                <BitFieldDiagram
                  fields={[
                    { label: 'PCP', bits: 3, value: calc.result.pcp },
                    { label: 'DEI', bits: 1, value: calc.result.dei },
                    { label: 'VLAN ID', bits: 12, value: calc.result.vlanId },
                  ]}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-fg-muted">
                  This tag in context of a full Ethernet frame
                </p>
                <FrameFieldStrip
                  segments={[
                    { label: 'Dest MAC', bytes: 6, detail: 'destination hardware address' },
                    { label: 'Src MAC', bytes: 6, detail: 'source hardware address' },
                    {
                      label: '802.1Q tag',
                      bytes: 4,
                      detail: `TPID 0x8100 + this TCI (0x${calc.result.tciHex})`,
                      highlighted: true,
                    },
                    { label: 'EtherType', bytes: 2, detail: 'identifies the payload protocol' },
                    {
                      label: 'Payload',
                      bytes: 18,
                      detail: 'shown narrower than to scale -- actually 46-1500 bytes',
                    },
                    { label: 'FCS', bytes: 4, detail: 'frame check sequence' },
                  ]}
                />
                <p className="mt-2 text-xs text-fg-subtle">
                  The tag sits between the source MAC address and the EtherType field -- every
                  switch and NIC on the wire has to recognize the TPID (0x8100) right where
                  EtherType would normally be to know a tag follows before the real
                  EtherType/payload.
                </p>
              </div>
            </div>
          </GuidedMode>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            An 802.1Q tag is 4 bytes total: a fixed 2-byte TPID (always 0x8100, the signal to every
            switch and NIC that a tag follows) plus a 2-byte TCI packed with three fields -- PCP (3
            bits, priority), DEI (1 bit, drop-eligible), and VLAN ID (12 bits). Building the TCI is
            just shifting each field into its own bit range and OR-ing them together, which is what
            the walkthrough above does step by step.
          </p>
        }
        whenToUseThis={
          <p>
            Working out exactly what bits a trunk port is putting on the wire for a given VLAN and
            priority, or decoding a tag seen in a packet capture back into its PCP/DEI/VLAN ID
            parts.
          </p>
        }
        commonMistakes={
          <p>
            VLAN ID 0 and 4095 both fit in the 12-bit field this tool accepts, but neither is an
            ordinary VLAN -- 0 means "priority-tagged, no VLAN membership" (the frame carries real
            PCP/DEI info but is treated as belonging to the port's native VLAN instead of any
            specific one), and 4095 is reserved by the 802.1Q spec and must never appear on the
            wire. This tool computes a tag for either value without complaint since both are
            structurally valid 12-bit numbers -- treat a real 0 or 4095 you see in a capture as a
            signal something's off, not a normal VLAN tag.
          </p>
        }
        relatedReading={
          <p>
            The{' '}
            <Link to="/tools/vlan-calculator" className="text-accent hover:underline">
              VLAN calculator
            </Link>{' '}
            checks a VLAN ID's own validity and range classification on its own.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
