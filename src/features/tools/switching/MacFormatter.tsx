import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { MacBinaryBreakdown } from './MacBinaryBreakdown'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import { formatMacAddress } from '../../../lib/calculations/macFormat'
import { useUrlState } from '../../../hooks/useUrlState'

export function MacFormatter() {
  const [input, setInput] = useUrlState('mac', '00:1a:2b:3c:4d:5e')
  const [showBinary, setShowBinary] = useState(false)

  const calc = formatMacAddress(input)

  return (
    <ToolPageLayout
      category="Switching"
      title="MAC formatter"
      description="Convert a MAC address between colon, hyphen, and Cisco dotted-quad notation."
      status={calc.ok ? 'ok' : 'error'}
      related={[{ to: '/tools/mac-address-lookup', label: 'MAC address lookup' }]}
      input={
        <div>
          <label htmlFor="mac-format-input" className="text-sm font-medium">
            MAC address
          </label>
          <Input
            id="mac-format-input"
            className="mt-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-fg-subtle">
              Detected: <span className="text-fg-muted">{calc.result.detectedFormat}</span> input
            </p>
            <dl>
              <ResultRow label="Colon" value={calc.result.colon} />
              <ResultRow label="Hyphen" value={calc.result.hyphen} />
              <ResultRow label="Dot (Cisco)" value={calc.result.dot} />
            </dl>
            <div>
              <Pill active={showBinary} onClick={() => setShowBinary((v) => !v)}>
                {showBinary ? 'Hide' : 'Show'} binary (expert)
              </Pill>
              {showBinary && (
                <div className="mt-3">
                  <MacBinaryBreakdown bytes={calc.result.bytes} />
                </div>
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
            It's the same 6 bytes in every notation -- only the separator and grouping change. Colon
            and hyphen notation both show every individual byte (Windows favors hyphens, Linux and
            most vendor documentation favor colons); Cisco's dotted notation instead groups the
            address into three 16-bit halves separated by dots, which is what shows up in IOS
            commands and <code className="font-mono">show mac address-table</code> output.
          </p>
        }
        whenToUseThis={
          <p>
            Pasting a MAC address from one tool or platform into another that expects a different
            notation -- copying an address out of a Linux <code className="font-mono">ip link</code>{' '}
            listing (colons) to paste into a Cisco IOS ACL or static ARP entry (dots), for instance.
          </p>
        }
        commonMistakes={
          <p>
            Pasting the wrong notation into a command that parses it literally instead of
            normalizing it -- IOS expects the dotted form specifically and won't accept colon- or
            hyphen-separated input in most contexts, so a MAC copied straight from a packet capture
            needs converting first, not just pasting as-is.
          </p>
        }
        relatedReading={
          <p>
            Want to know what device an address actually belongs to instead of just reformatting it?
            The{' '}
            <Link to="/tools/mac-address-lookup" className="text-accent hover:underline">
              MAC address lookup
            </Link>{' '}
            tool checks it against a vendor OUI database.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
