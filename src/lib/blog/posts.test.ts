import { describe, expect, it } from 'vitest'
import { blogPosts, allTags, getPostBySlug, formatPostDate } from './posts'

describe('formatPostDate', () => {
  it('formats a date-only string without shifting a day in a non-UTC timezone', () => {
    // Regression test: new Date('2026-07-20') is UTC midnight, and
    // formatting that in a timezone behind UTC without forcing UTC back
    // out showed "Jul 19" instead of "Jul 20".
    expect(formatPostDate('2026-07-20')).toBe('Jul 20, 2026')
  })

  it('formats the first and last day of a month correctly', () => {
    expect(formatPostDate('2026-01-01')).toBe('Jan 1, 2026')
    expect(formatPostDate('2026-12-31')).toBe('Dec 31, 2026')
  })
})

describe('blogPosts', () => {
  it('loads every markdown file in content/blog', () => {
    expect(blogPosts.length).toBeGreaterThan(0)
  })

  it('gives every post a title, description, date, and slug', () => {
    for (const post of blogPosts) {
      expect(post.title.length).toBeGreaterThan(0)
      expect(post.description.length).toBeGreaterThan(0)
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.slug.length).toBeGreaterThan(0)
    }
  })

  it('sorts newest first', () => {
    const dates = blogPosts.map((post) => post.date)
    const sorted = [...dates].sort().reverse()
    expect(dates).toEqual(sorted)
  })
})

describe('allTags', () => {
  it('includes every tag used by at least one post, with no duplicates', () => {
    const expected = new Set(blogPosts.flatMap((post) => post.tags))
    expect(new Set(allTags)).toEqual(expected)
    expect(allTags.length).toBe(new Set(allTags).size)
  })
})

describe('getPostBySlug', () => {
  it('finds a real post by slug', () => {
    const first = blogPosts[0]!
    expect(getPostBySlug(first.slug)?.title).toBe(first.title)
  })

  it('returns undefined for an unknown slug', () => {
    expect(getPostBySlug('does-not-exist')).toBeUndefined()
  })
})
