import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { RelatedLinks, type RelatedLink } from '../../components/ui/RelatedLinks'
import { StructuredData } from '../../components/seo/StructuredData'
import { useBreadcrumbSchema } from '../../lib/seo/useBreadcrumbSchema'
import { useIsScenarioEmbed } from '../scenarios/ScenarioEmbedContext'

interface ToolPageLayoutBaseProps {
  category: string
  title: string
  description: string
  related?: RelatedLink[]
  /** Optional content rendered below the main grid -- e.g. a ToolEducation
   * block. Most tools don't pass this yet. */
  children?: ReactNode
}

type ToolPageLayoutProps = ToolPageLayoutBaseProps &
  (
    | { input: ReactNode; result: ReactNode; fullWidth?: undefined }
    | {
        input?: undefined
        result?: undefined
        /** Escape hatch from the standard input/result two-column split,
         * for a tool whose own content needs the full page width to be
         * usable -- e.g. the text diff viewer's side-by-side panes, which
         * were unworkably cramped squeezed into half the page. */
        fullWidth: ReactNode
      }
  )

export function ToolPageLayout(props: ToolPageLayoutProps) {
  const { category, title, description, related, children } = props
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
      {props.fullWidth !== undefined ? (
        <div className="rounded-lg border border-border bg-surface p-6">{props.fullWidth}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-6">{props.input}</div>
          <div className="rounded-lg border border-border bg-surface p-6">{props.result}</div>
        </div>
      )}
      {children}
    </div>
  )
}
