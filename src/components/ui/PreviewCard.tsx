import { Link } from 'react-router'
import { Card } from './Card'
import { Badge } from './Badge'

interface PreviewCardProps {
  category: string
  title: string
  description: string
  href?: string
  comingSoon?: boolean
  /** A second, smaller badge next to the category -- e.g. flagging a
   * scenario as the newer branching/challenge format. */
  tag?: string
}

export function PreviewCard({
  category,
  title,
  description,
  href,
  comingSoon = true,
  tag,
}: PreviewCardProps) {
  const card = (
    <Card interactive={Boolean(href)} tilt={Boolean(href)} className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="accent">{category}</Badge>
          {tag && <Badge tone="neutral">{tag}</Badge>}
        </div>
        {comingSoon && <span className="text-xs text-fg-subtle">Coming soon</span>}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-fg-muted">{description}</p>
    </Card>
  )

  if (!href) return card

  return (
    <Link to={href} className="block">
      {card}
    </Link>
  )
}
