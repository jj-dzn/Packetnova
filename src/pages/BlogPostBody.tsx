import { useMemo } from 'react'
import { renderMarkdown } from '../lib/blog/markdown'

interface BlogPostBodyProps {
  body: string
}

// Split out from BlogPostPage so only this piece -- the actual consumer of
// the remark/rehype/unified pipeline -- is what gets lazy-loaded. The page
// shell (title, tags, date) has all the data it needs immediately, so it
// renders with no loading gap; only this component needs a Suspense
// fallback, which keeps the layout shift confined to the content area
// instead of the whole page swapping in at once.
export function BlogPostBody({ body }: BlogPostBodyProps) {
  const html = useMemo(() => renderMarkdown(body), [body])
  return <div className="pn-prose mt-8 max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />
}
