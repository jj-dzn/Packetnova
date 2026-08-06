import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { RelatedLinks, type RelatedLink } from '../../components/ui/RelatedLinks'
import { ExportButton } from '../../components/ui/ExportButton'
import { PinToNotebookButton } from '../../components/ui/PinToNotebookButton'
import { StructuredData } from '../../components/seo/StructuredData'
import { useBreadcrumbSchema } from '../../lib/seo/useBreadcrumbSchema'
import { useDiagramExport } from '../../hooks/useDiagramExport'
import { useIsScenarioEmbed } from '../scenarios/ScenarioEmbedContext'
import { PathContextBanner } from '../paths/PathContextBanner'

interface VisualizerPageLayoutProps {
  category: string
  title: string
  description: string
  children: ReactNode
  related?: RelatedLink[]
}

export function VisualizerPageLayout({
  category,
  title,
  description,
  children,
  related,
}: VisualizerPageLayoutProps) {
  const breadcrumbSchema = useBreadcrumbSchema('Visualizers', '/visualizers', title)
  const embedded = useIsScenarioEmbed()
  const Heading = embedded ? 'h3' : 'h1'
  const { ref, exportAs, pending } = useDiagramExport<HTMLDivElement>(title)
  const { pathname } = useLocation()

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
      {!embedded && <PathContextBanner />}
      {!embedded && (
        <div className="mb-2 flex items-center justify-end gap-2">
          <PinToNotebookButton
            href={pathname}
            title={title}
            category={category}
            getSummaryElement={() => ref.current}
          />
          <ExportButton exportAs={exportAs} pending={pending} />
        </div>
      )}
      <div ref={ref} className="rounded-lg border border-border bg-surface p-6">
        {children}
      </div>
    </div>
  )
}
