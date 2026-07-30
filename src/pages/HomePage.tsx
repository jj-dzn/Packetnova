import { Hero } from './home/Hero'
import { PopularTools } from './home/PopularTools'
import { FeaturedVisualizers } from './home/FeaturedVisualizers'
import { LatestArticles } from './home/LatestArticles'
import { WhyPacketNova } from './home/WhyPacketNova'
import { Newsletter } from './home/Newsletter'

export function HomePage() {
  return (
    <div className="flex flex-col divide-y divide-border">
      <Hero />
      <PopularTools />
      <FeaturedVisualizers />
      <LatestArticles />
      <WhyPacketNova />
      <Newsletter />
    </div>
  )
}
