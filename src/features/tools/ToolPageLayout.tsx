import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { RelatedLinks, type RelatedLink } from '../../components/ui/RelatedLinks'
import { BookmarkButton } from '../../components/ui/BookmarkButton'
import { PinToNotebookButton } from '../../components/ui/PinToNotebookButton'
import { StructuredData } from '../../components/seo/StructuredData'
import { useBreadcrumbSchema } from '../../lib/seo/useBreadcrumbSchema'
import { useRecordVisit } from '../../hooks/useRecentlyViewed'
import { useIsScenarioEmbed } from '../scenarios/ScenarioEmbedContext'
import { reportMascotMood } from '../../lib/mascotMood'
import { PathContextBanner } from '../paths/PathContextBanner'

interface ToolPageLayoutBaseProps {
  category: string
  title: string
  description: string
  related?: RelatedLink[]
  /** Optional content rendered below the main grid -- e.g. a ToolEducation
   * block. Most tools don't pass this yet. */
  children?: ReactNode
  /** When set, reports a brief, transient mood to the sitewide mascot --
   * 'ok' on a fresh valid result, 'error' on a validation failure. Most
   * tools compute this for free at their own existing `calc.ok` branch
   * point. Omit for tools with no natural success/error state. Skipped
   * while embedded (a scenario stage with several tools on one page
   * shouldn't have them fight over the one global mood). */
  status?: 'ok' | 'error'
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
  const { category, title, description, related, children, status } = props
  const breadcrumbSchema = useBreadcrumbSchema('Tools', '/tools', title)
  const embedded = useIsScenarioEmbed()
  const Heading = embedded ? 'h3' : 'h1'
  const { pathname } = useLocation()
  const resultRef = useRef<HTMLDivElement>(null)

  useRecordVisit(embedded ? null : { href: pathname, title, category })

  useEffect(() => {
    if (status && !embedded) reportMascotMood(status === 'ok' ? 'fast' : 'error')
  }, [status, embedded])

  return (
    <div className={embedded ? '' : 'py-12'}>
      {!embedded && <StructuredData data={breadcrumbSchema} />}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="accent">{category}</Badge>
          {!embedded && (
            <div className="flex items-center gap-2">
              <PinToNotebookButton
                href={pathname}
                title={title}
                category={category}
                getSummaryElement={() => resultRef.current}
              />
              <BookmarkButton item={{ href: pathname, title, category, description }} />
            </div>
          )}
        </div>
        <Heading
          className={embedded ? 'mt-3 text-lg font-semibold' : 'mt-3 text-2xl font-semibold'}
        >
          {title}
        </Heading>
        <p className="mt-2 max-w-2xl text-fg-muted">{description}</p>
        {related && <RelatedLinks links={related} />}
      </div>
      {!embedded && <PathContextBanner />}
      {props.fullWidth !== undefined ? (
        <div ref={resultRef} className="rounded-lg border border-border bg-surface p-6">
          {props.fullWidth}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-6">{props.input}</div>
          <div ref={resultRef} className="rounded-lg border border-border bg-surface p-6">
            {props.result}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
