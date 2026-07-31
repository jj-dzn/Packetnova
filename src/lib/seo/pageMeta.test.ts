import { describe, expect, it } from 'vitest'
import { getPageMeta } from './pageMeta'
import { toolCategories } from '../../content/reference/tools'
import { visualizers } from '../../content/reference/visualizers'
import { blogPosts } from '../blog/posts'

describe('getPageMeta', () => {
  it('gives the homepage a site-wide title and description', () => {
    const meta = getPageMeta('/')
    expect(meta.title).toContain('PacketNova')
    expect(meta.description.length).toBeGreaterThan(0)
  })

  it('gives each static listing page its own title', () => {
    for (const path of [
      '/tools',
      '/visualizers',
      '/blog',
      '/search',
      '/labs',
      '/labs/ping-pet',
      '/labs/ip-zodiac',
      '/labs/handle-generator',
      '/labs/cursed-config',
      '/labs/hacker-typer',
      '/labs/dial-up',
      '/labs/blue-screen',
      '/terminal',
    ]) {
      const meta = getPageMeta(path)
      expect(meta.title).toContain('PacketNova')
      expect(meta.description.length).toBeGreaterThan(0)
    }
  })

  it("uses a tool's real name and description for its page", () => {
    const cidr = toolCategories.flatMap((c) => c.tools).find((t) => t.slug === 'cidr-calculator')!
    const meta = getPageMeta('/tools/cidr-calculator')
    expect(meta.title).toBe(`${cidr.name} - PacketNova`)
    expect(meta.description).toBe(cidr.description)
  })

  it("uses a visualizer's real name and description for its page", () => {
    const tcp = visualizers.find((v) => v.slug === 'tcp-three-way-handshake')!
    const meta = getPageMeta('/visualizers/tcp-three-way-handshake')
    expect(meta.title).toBe(`${tcp.name} - PacketNova`)
    expect(meta.description).toBe(tcp.description)
  })

  it("uses a blog post's real title and description for its page", () => {
    const post = blogPosts.find((p) => p.slug === 'understanding-mtu')!
    const meta = getPageMeta('/blog/understanding-mtu')
    expect(meta.title).toBe(`${post.title} - PacketNova`)
    expect(meta.description).toBe(post.description)
  })

  it('every live tool, visualizer, and post resolves to a real title (no fallback leaking through)', () => {
    for (const category of toolCategories) {
      for (const tool of category.tools) {
        if (!tool.slug) continue
        const meta = getPageMeta(`/tools/${tool.slug}`)
        expect(meta.title).toBe(`${tool.name} - PacketNova`)
      }
    }
    for (const visualizer of visualizers) {
      if (!visualizer.slug) continue
      const meta = getPageMeta(`/visualizers/${visualizer.slug}`)
      expect(meta.title).toBe(`${visualizer.name} - PacketNova`)
    }
    for (const post of blogPosts) {
      const meta = getPageMeta(`/blog/${post.slug}`)
      expect(meta.title).toBe(`${post.title} - PacketNova`)
    }
  })

  it('falls back to a not-found title for an unknown slug', () => {
    expect(getPageMeta('/tools/does-not-exist').title).toBe('Page not found - PacketNova')
    expect(getPageMeta('/visualizers/does-not-exist').title).toBe('Page not found - PacketNova')
    expect(getPageMeta('/blog/does-not-exist').title).toBe('Page not found - PacketNova')
  })

  it('falls back to a not-found title for a completely unmatched path', () => {
    expect(getPageMeta('/some/random/path').title).toBe('Page not found - PacketNova')
  })
})
