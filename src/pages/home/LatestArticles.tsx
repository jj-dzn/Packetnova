import { PreviewCard } from '../../components/ui/PreviewCard'
import { SectionHeader } from './SectionHeader'
import { blogPosts } from '../../lib/blog/posts'

export function LatestArticles() {
  return (
    <section className="py-14">
      <SectionHeader
        title="From the blog"
        subtitle="Networking write-ups -- practical, accurate, no fluff"
        viewAllHref="/blog"
        viewAllLabel="Visit the blog"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <PreviewCard
            key={post.slug}
            category="Blog"
            title={post.title}
            description={post.description}
            href={`/blog/${post.slug}`}
            comingSoon={false}
          />
        ))}
      </div>
    </section>
  )
}
