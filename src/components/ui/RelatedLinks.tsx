import { Link } from 'react-router'

export interface RelatedLink {
  to: string
  label: string
}

interface RelatedLinksProps {
  links: RelatedLink[]
}

// Small "Related" row for cross-linking tools/visualizers that are
// conceptually connected (e.g. MTU -> MSS -> Packet fragmentation) but
// otherwise live on unrelated pages with no other way to discover each
// other besides search or nav.
export function RelatedLinks({ links }: RelatedLinksProps) {
  if (links.length === 0) return null

  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-fg-muted">
      <span className="text-fg-subtle">Related:</span>
      {links.map((link, index) => (
        <span key={link.to}>
          <Link to={link.to} className="text-accent hover:underline">
            {link.label}
          </Link>
          {index < links.length - 1 && <span className="text-fg-subtle">,</span>}
        </span>
      ))}
    </p>
  )
}
