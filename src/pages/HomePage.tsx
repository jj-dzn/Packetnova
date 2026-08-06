import { Hero } from './home/Hero'
import { LabsTeaser } from './home/LabsTeaser'
import { ContinuePathTeaser } from './home/ContinuePathTeaser'
import { BookmarksTeaser } from './home/BookmarksTeaser'
import { FlagshipShowcase } from './home/FlagshipShowcase'
import { PopularTools } from './home/PopularTools'
import { FeaturedVisualizers } from './home/FeaturedVisualizers'
import { WhyPacketNova } from './home/WhyPacketNova'
import { StructuredData } from '../components/seo/StructuredData'
import { SITE_URL } from '../lib/seo/pageMeta'

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PacketNova',
  url: `${SITE_URL}/`,
  description:
    'Free, client-side networking toolkit: calculators, protocol explorers, and interactive visualizers.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export function HomePage() {
  return (
    <div className="flex flex-col divide-y divide-border">
      <StructuredData data={WEBSITE_SCHEMA} />
      <Hero />
      <LabsTeaser />
      <ContinuePathTeaser />
      <BookmarksTeaser />
      <FlagshipShowcase />
      <PopularTools />
      <FeaturedVisualizers />
      <WhyPacketNova />
    </div>
  )
}
