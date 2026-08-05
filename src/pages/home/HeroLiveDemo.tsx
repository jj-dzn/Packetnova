import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { calculateCidr } from '../../lib/calculations/cidr'
import { reportMascotMood } from '../../lib/mascotMood'

const DEFAULT_CIDR = '192.168.1.0/24'

// The one thing every prior revision of this hero was missing: something
// that actually works, not a description of something that works. A
// skeptical visitor shouldn't have to click through to believe the tool
// quality -- typing a real CIDR block here computes a real answer with the
// same calculateCidr() the full tool page uses, live, right in the hero.
// Reports to the sitewide mascot mood exactly like a real tool page would,
// so the very first interaction on the site already demonstrates that
// system too.
export function HeroLiveDemo() {
  const [input, setInput] = useState(DEFAULT_CIDR)
  const calc = calculateCidr(input)

  useEffect(() => {
    reportMascotMood(calc.ok ? 'fast' : 'error')
  }, [calc.ok])

  return (
    <div className="pointer-events-auto w-full max-w-md rounded-lg border border-border bg-surface/90 p-4 text-left shadow-[0_0_32px_-12px_var(--color-accent)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="hero-cidr-input" className="text-xs font-medium text-fg-muted">
          Try it -- type a CIDR block
        </label>
        <span className="font-mono text-[10px] uppercase tracking-wide text-accent">Live</span>
      </div>
      <input
        id="hero-cidr-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        spellCheck={false}
        className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
      />
      {calc.ok ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-xs">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-fg-subtle">Network</dt>
            <dd className="text-fg">{calc.result.networkAddress}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-fg-subtle">Broadcast</dt>
            <dd className="text-fg">{calc.result.broadcastAddress}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-fg-subtle">Usable hosts</dt>
            <dd className="text-fg">{calc.result.usableHosts.toLocaleString()}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-fg-subtle">Mask</dt>
            <dd className="text-fg">{calc.result.subnetMask}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-xs text-danger">{calc.error}</p>
      )}
      <Link
        to={`/tools/cidr-calculator?cidr=${encodeURIComponent(input)}`}
        className="pointer-events-auto mt-3 inline-block text-xs text-accent hover:underline"
      >
        Open the full CIDR calculator &rarr;
      </Link>
    </div>
  )
}
