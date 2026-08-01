import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { RelatedLinks, type RelatedLink } from '../../components/ui/RelatedLinks'

interface ReferencePageLayoutProps {
  category: string
  title: string
  description: string
  children: ReactNode
  related?: RelatedLink[]
}

export function ReferencePageLayout({
  category,
  title,
  description,
  children,
  related,
}: ReferencePageLayoutProps) {
  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">{category}</Badge>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">{description}</p>
        {related && <RelatedLinks links={related} />}
      </div>
      {children}
    </div>
  )
}
