import { SectionHeader } from './SectionHeader'
import { PreviewCard } from '../../components/ui/PreviewCard'

const articles = [
  {
    title: 'Understanding MTU',
    description: 'Why packet size limits matter and how they cause silent failures.',
  },
  {
    title: 'BGP best path explained',
    description: 'How routers actually choose which path wins.',
  },
  {
    title: 'Troubleshooting packet loss',
    description: 'A practical walkthrough for tracking down where packets go missing.',
  },
]

export function LatestArticles() {
  return (
    <section className="py-16">
      <SectionHeader
        title="From the blog"
        subtitle="Networking write-ups, coming soon"
        viewAllHref="/blog"
        viewAllLabel="Visit the blog"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <PreviewCard key={article.title} category="Blog" href="/blog" {...article} />
        ))}
      </div>
    </section>
  )
}
