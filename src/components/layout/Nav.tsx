import { useState } from 'react'
import { Link, NavLink } from 'react-router'
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
  { to: '/labs', label: 'Fun Labs' },
  { to: '/notebook', label: 'Notebook' },
]

function ThemeIcon({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="group-hover:motion-safe:animate-pn-icon-pop"
    >
      {theme === 'dark' ? (
        <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="10" cy="10" r="3.4" />
          <path d="M10 2.2v2M10 15.8v2M2.2 10h2M15.8 10h2M4.6 4.6l1.4 1.4M14 14l1.4 1.4M4.6 15.4l1.4-1.4M14 6l1.4-1.4" />
        </g>
      ) : (
        <path
          d="M17 12.1A6.8 6.8 0 0 1 7.9 3a6.8 6.8 0 1 0 9.1 9.1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

function ColorblindIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="group-hover:motion-safe:animate-pn-icon-pop"
    >
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 3a7 7 0 0 1 0 14Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
                `whitespace-nowrap text-sm font-medium transition-colors ${
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
          <button
            type="button"
            onClick={toggleColorblind}
            aria-pressed={colorblind}
            aria-label="Toggle colorblind-safe colors"
            title={colorblind ? 'Switch to standard colors' : 'Switch to colorblind-safe colors'}
            className={`group inline-flex items-center justify-center rounded-md border p-2 transition-colors ${
              colorblind
                ? 'border-accent/40 text-accent'
                : 'border-border text-fg-subtle hover:border-accent/40 hover:text-fg'
            }`}
          >
            <ColorblindIcon active={colorblind} />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="group inline-flex items-center justify-center rounded-md border border-border p-2 text-fg-subtle transition-colors hover:border-accent/40 hover:text-fg"
          >
            <ThemeIcon theme={theme} />
          </button>
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
