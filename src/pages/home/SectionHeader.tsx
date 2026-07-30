import { Link } from 'react-router'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  viewAllHref?: string
  viewAllLabel?: string
}

export function SectionHeader({ title, subtitle, viewAllHref, viewAllLabel }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link to={viewAllHref} className="text-sm font-medium text-accent hover:underline">
          {viewAllLabel ?? 'View all'}
        </Link>
      )}
    </div>
  )
}
