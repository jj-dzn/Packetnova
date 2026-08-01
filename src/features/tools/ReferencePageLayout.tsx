import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { RelatedLinks, type RelatedLink } from '../../components/ui/RelatedLinks'
import { StructuredData } from '../../components/seo/StructuredData'
import { useBreadcrumbSchema } from '../../lib/seo/useBreadcrumbSchema'
import { useIsScenarioEmbed } from '../scenarios/ScenarioEmbedContext'

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
  const embedded = useIsScenarioEmbed()
  const Heading = embedded ? 'h3' : 'h1'

  return (
    <div className={embedded ? '' : 'py-12'}>
      {!embedded && <StructuredData data={breadcrumbSchema} />}
      <div className="mb-8">
        <Badge tone="accent">{category}</Badge>
        <Heading
          className={embedded ? 'mt-3 text-lg font-semibold' : 'mt-3 text-2xl font-semibold'}
        >
          {title}
        </Heading>
        <p className="mt-2 max-w-2xl text-fg-muted">{description}</p>
        {related && <RelatedLinks links={related} />}
      </div>
      {children}
    </div>
  )
}
