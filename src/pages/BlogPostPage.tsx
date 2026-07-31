import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router'
import { Badge } from '../components/ui/Badge'
import { getPostBySlug, formatPostDate } from '../lib/blog/posts'
import { NotFoundPage } from './NotFoundPage'
import { StructuredData } from '../components/seo/StructuredData'

const BlogPostBody = lazy(() =>
  import('./BlogPostBody').then((module) => ({ default: module.BlogPostBody })),
)

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
    url: `https://packetnova.ca/blog/${post.slug}`,
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
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-md bg-surface" />}>
        <BlogPostBody body={post.body} />
      </Suspense>
    </div>
  )
}
