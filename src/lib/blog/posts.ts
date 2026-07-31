import { parseFrontmatter } from './frontmatter'

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
}

export interface BlogPost extends BlogPostMeta {
  body: string
}

const modules = import.meta.glob('/src/content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function slugFromPath(path: string): string {
  const match = /([^/]+)\.md$/.exec(path)
  return match?.[1] ?? path
}

export const blogPosts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw)
    return {
      slug: slugFromPath(path),
      title: String(data.title),
      description: String(data.description),
      date: String(data.date),
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      body: content,
    }
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export const allTags: string[] = Array.from(new Set(blogPosts.flatMap((post) => post.tags))).sort()

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function formatPostDate(iso: string): string {
  // A date-only string like "2026-07-20" parses as UTC midnight; formatting
  // it in the viewer's local timezone would show the previous day for
  // anyone west of UTC. Force UTC on the way out too, so the displayed
  // date always matches what's written in the post's frontmatter.
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
