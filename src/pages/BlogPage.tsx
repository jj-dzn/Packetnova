import { useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Pill } from '../components/ui/Pill'
import { blogPosts, allTags, formatPostDate } from '../lib/blog/posts'

export function BlogPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const visiblePosts = activeTag
    ? blogPosts.filter((post) => post.tags.includes(activeTag))
    : blogPosts

  return (
    <div className="py-16">
      <div className="mb-12 text-center">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="mx-auto mt-2 max-w-xl text-fg-muted">
          Networking write-ups -- practical, accurate, no fluff.
        </p>
      </div>

      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <Pill
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
            className="capitalize"
          >
            All
          </Pill>
          {allTags.map((tag) => (
            <Pill
              key={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              className="capitalize"
            >
              {tag}
            </Pill>
          ))}
        </div>
      )}

      {visiblePosts.length === 0 ? (
        <p className="text-center text-fg-muted">No posts match that tag yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block">
              <Card interactive className="flex h-full flex-col gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge key={tag} tone="accent">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h2 className="font-medium">{post.title}</h2>
                <p className="text-sm text-fg-muted">{post.description}</p>
                <p className="mt-auto text-xs text-fg-subtle">{formatPostDate(post.date)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
