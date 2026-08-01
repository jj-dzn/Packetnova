import { lazy, Suspense, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { getPostBySlug, formatPostDate } from '../lib/blog/posts'
import { NotFoundPage } from './NotFoundPage'
import { StructuredData } from '../components/seo/StructuredData'
import { SITE_URL } from '../lib/seo/pageMeta'
import {
  TopologyCanvas,
  type TopologyEdge,
  type TopologyNode,
} from '../features/diagram/TopologyCanvas'

const BlogPostBody = lazy(() =>
  import('./BlogPostBody').then((module) => ({ default: module.BlogPostBody })),
)

// Live companion widget for the "How ADVPN works" post -- markdown is
// rendered to a static HTML string (see lib/blog/markdown.ts), so a
// stateful component like this can't live inline in the post body itself.
// Special-cased by slug and placed alongside the rendered post instead.
const HUB_ID = 'hub'
const SPOKE_A_ID = 'a'
const SPOKE_B_ID = 'b'

function AdvpnShortcutExample() {
  const [showShortcut, setShowShortcut] = useState(false)

  const nodes: TopologyNode[] = [
    { id: HUB_ID, x: 150, y: 40, label: 'Hub', icon: 'router' },
    { id: SPOKE_A_ID, x: 60, y: 170, label: 'Spoke A', icon: 'router' },
    { id: SPOKE_B_ID, x: 240, y: 170, label: 'Spoke B', icon: 'router' },
  ]

  const edges: TopologyEdge[] = [
    { from: HUB_ID, to: SPOKE_A_ID },
    { from: HUB_ID, to: SPOKE_B_ID },
  ]
  if (showShortcut) {
    edges.push({
      from: SPOKE_A_ID,
      to: SPOKE_B_ID,
      label: 'shortcut',
      stroke: 'var(--color-accent-alt)',
      strokeWidth: 3,
    })
  }

  return (
    <div className="mt-8 max-w-md rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-medium">
        {showShortcut
          ? 'After: Spoke A and Spoke B talk directly -- the hub is out of the path.'
          : 'Before: Spoke A -> Spoke B traffic still detours through the hub.'}
      </p>
      <TopologyCanvas nodes={nodes} edges={edges} viewWidth={300} viewHeight={220} />
      <Button
        type="button"
        variant="secondary"
        onClick={() => setShowShortcut((current) => !current)}
        className="mt-3"
      >
        {showShortcut ? 'Show before (hub-and-spoke only)' : 'Show after (shortcut established)'}
      </Button>
    </div>
  )
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) return <NotFoundPage />

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: { '@type': 'Organization', name: 'PacketNova' },
  }

  return (
    <div className="py-16">
      <StructuredData data={articleSchema} />
      <Link to="/blog" className="text-sm font-medium text-accent hover:underline">
        ← Back to blog
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        {post.tags.map((tag) => (
          <Badge key={tag} tone="accent">
            {tag}
          </Badge>
        ))}
      </div>
      <h1 className="mt-3 text-2xl font-semibold">{post.title}</h1>
      <p className="mt-2 text-sm text-fg-subtle">{formatPostDate(post.date)}</p>
      {post.slug === 'how-advpn-works' && <AdvpnShortcutExample />}
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-md bg-surface" />}>
        <BlogPostBody body={post.body} />
      </Suspense>
    </div>
  )
}
