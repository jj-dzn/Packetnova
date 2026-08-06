import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Button } from '../ui/Button'
import { SearchBar } from '../ui/SearchBar'
import { Mascot } from '../ui/Mascot'
import { useDarkMode } from '../../hooks/useDarkMode'
import { useColorblindMode } from '../../hooks/useColorblindMode'
import { useMascotMood } from '../../hooks/useMascotMood'
import { openCommandPalette } from '../../lib/commandPalette'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

const navLinks = [
  { to: '/tools', label: 'Tools' },
  { to: '/visualizers', label: 'Visualizers' },
  { to: '/scenarios', label: 'Scenarios' },
  { to: '/journey', label: 'Journey' },
  { to: '/paths', label: 'Paths' },
  { to: '/labs', label: 'Labs' },
  { to: '/notebook', label: 'Notebook' },
]

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="group-hover:motion-safe:animate-pn-icon-pop"
    >
      {open ? (
        <path
          d="M5 5L15 15M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M3 5H17M3 10H17M3 15H17"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export function Nav() {
  const { theme, toggleTheme } = useDarkMode()
  const { colorblind, toggleColorblind } = useColorblindMode()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mood = useMascotMood()

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <img src="/logo.svg" alt="" width={28} height={28} />
          <span className="text-lg font-semibold">PacketNova</span>
          <Mascot mood={mood} className="h-5 w-5 shrink-0" label={`PacketNova, ${mood}`} />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-accent' : 'text-fg-muted hover:text-fg'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden flex-wrap items-center justify-end gap-3 md:flex">
          <SearchBar className="w-48 lg:w-64" />
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command palette"
            className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs text-fg-subtle transition-colors hover:border-accent/40 hover:text-fg lg:flex"
          >
            <kbd className="font-sans">{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd className="font-sans">K</kbd>
          </button>
          <Button
            variant="secondary"
            onClick={toggleColorblind}
            aria-pressed={colorblind}
            aria-label="Toggle colorblind-safe colors"
          >
            {colorblind ? 'Standard colors' : 'Colorblind-safe'}
          </Button>
          <Button variant="secondary" onClick={toggleTheme} aria-label="Toggle color theme">
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
        </div>

        <button
          type="button"
          className="group inline-flex items-center justify-center rounded-md border border-border p-2 text-fg transition-colors hover:border-accent md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <MenuIcon open={mobileOpen} />
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-3 border-t border-border px-4 py-3 md:hidden">
          <SearchBar onNavigate={() => setMobileOpen(false)} />
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-fg-muted hover:bg-surface hover:text-fg'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={toggleColorblind}
              aria-pressed={colorblind}
              className="rounded-md px-3 py-2 text-left text-sm font-medium text-fg-muted hover:bg-surface hover:text-fg"
            >
              {colorblind ? 'Switch to standard colors' : 'Switch to colorblind-safe colors'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md px-3 py-2 text-left text-sm font-medium text-fg-muted hover:bg-surface hover:text-fg"
            >
              Switch to {theme === 'dark' ? 'light' : 'dark'} mode
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
