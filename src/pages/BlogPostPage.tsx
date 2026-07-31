import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { Badge } from '../components/ui/Badge'
import { getPostBySlug, formatPostDate } from '../lib/blog/posts'
import { renderMarkdown } from '../lib/blog/markdown'
import { NotFoundPage } from './NotFoundPage'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined
  const html = useMemo(() => (post ? renderMarkdown(post.body) : ''), [post])

  if (!post) return <NotFoundPage />

  return (
    <div className="py-16">
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
      <div className="pn-prose mt-8 max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
