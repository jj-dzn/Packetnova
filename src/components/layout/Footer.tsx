import { Link } from 'react-router'
import { TrafficStarfield } from '../../pages/home/TrafficStarfield'
import { LatencyOrb } from '../../pages/home/LatencyOrb'

const footerLinks = [
  { to: '/tools', label: 'Tools' },
  { to: '/visualizers', label: 'Visualizers' },
  { to: '/scenarios', label: 'Scenarios' },
  { to: '/labs', label: 'Fun Labs' },
  { to: '/about', label: 'About' },
]

// The hero's atmosphere (starfield, live-signal pulse) only used to exist at
// the top of the homepage -- every other page, and the bottom of every page,
// went quiet. A thin sliver of the same starfield (minimal: no nodes,
// packets, or links -- just stars) plus the same LatencyOrb pulse extends
// that presence to the one piece of chrome every single page shares.
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="relative h-10 w-full overflow-hidden border-b border-border/60">
        <TrafficStarfield minimal starCount={18} />
      </div>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-8 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="" width={20} height={20} />
          <span>PacketNova -- networking tools built for engineers.</span>
          <LatencyOrb />
        </div>
        <nav className="flex flex-wrap gap-4">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-fg">
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/jj-dzn/Packetnova"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fg"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
