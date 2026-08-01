import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { RelatedLinks, type RelatedLink } from '../../components/ui/RelatedLinks'
import { StructuredData } from '../../components/seo/StructuredData'
import { useBreadcrumbSchema } from '../../lib/seo/useBreadcrumbSchema'

interface ToolPageLayoutProps {
  category: string
  title: string
  description: string
  input: ReactNode
  result: ReactNode
  related?: RelatedLink[]
}

export function ToolPageLayout({
  category,
  title,
  description,
  input,
  result,
  related,
}: ToolPageLayoutProps) {
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-6">{input}</div>
        <div className="rounded-lg border border-border bg-surface p-6">{result}</div>
      </div>
    </div>
  )
}
