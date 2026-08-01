import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { RelatedLinks, type RelatedLink } from '../../components/ui/RelatedLinks'
import { StructuredData } from '../../components/seo/StructuredData'
import { useBreadcrumbSchema } from '../../lib/seo/useBreadcrumbSchema'

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
  const breadcrumbSchema = useBreadcrumbSchema('Tools', '/tools', title)

  return (
    <div className="py-12">
      <StructuredData data={breadcrumbSchema} />
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
