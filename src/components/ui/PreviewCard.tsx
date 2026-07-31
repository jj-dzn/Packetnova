import { Link } from 'react-router'
import { Card } from './Card'
import { Badge } from './Badge'

interface PreviewCardProps {
  category: string
  title: string
  description: string
  href?: string
}

export function PreviewCard({ category, title, description, href }: PreviewCardProps) {
  const card = (
    <Card interactive={Boolean(href)} className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <Badge tone="accent">{category}</Badge>
        <span className="text-xs text-fg-subtle">Coming soon</span>
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
