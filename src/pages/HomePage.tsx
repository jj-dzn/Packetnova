import { Hero } from './home/Hero'
import { PopularTools } from './home/PopularTools'
import { FeaturedVisualizers } from './home/FeaturedVisualizers'
import { LatestArticles } from './home/LatestArticles'
import { WhyPacketNova } from './home/WhyPacketNova'
import { LabsTeaser } from './home/LabsTeaser'
import { Newsletter } from './home/Newsletter'
import { StructuredData } from '../components/seo/StructuredData'

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PacketNova',
  url: 'https://packetnova.ca/',
  description:
    'Free, client-side networking toolkit: calculators, protocol explorers, and interactive visualizers.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://packetnova.ca/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export function HomePage() {
  return (
    <div className="flex flex-col divide-y divide-border">
      <StructuredData data={WEBSITE_SCHEMA} />
      <Hero />
      <PopularTools />
      <FeaturedVisualizers />
      <LatestArticles />
      <WhyPacketNova />
      <LabsTeaser />
      <Newsletter />
    </div>
  )
}
