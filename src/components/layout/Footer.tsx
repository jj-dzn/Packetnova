import { Link } from 'react-router'

const footerLinks = [
  { to: '/tools', label: 'Tools' },
  { to: '/visualizers', label: 'Visualizers' },
  { to: '/blog', label: 'Blog' },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-8 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="" width={20} height={20} />
          <span>PacketNova -- networking tools built for engineers.</span>
        </div>
        <nav className="flex gap-4">
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
