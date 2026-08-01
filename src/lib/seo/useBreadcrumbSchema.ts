import { useLocation } from 'react-router'
import { SITE_URL } from './pageMeta'

// Shared by ToolPageLayout, VisualizerPageLayout, and ReferencePageLayout --
// all three already receive `category`/`title` as props, and the site's
// nav really does have this two-level structure (Tools/Visualizers section
// -> individual page), so a BreadcrumbList is genuinely accurate here, not
// just decorative. Centralized as a hook rather than duplicated three times
// so the three layouts can't drift out of sync with each other.
export function useBreadcrumbSchema(sectionLabel: string, sectionPath: string, title: string) {
  const location = useLocation()

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'PacketNova', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: sectionLabel, item: `${SITE_URL}${sectionPath}` },
      { '@type': 'ListItem', position: 3, name: title, item: `${SITE_URL}${location.pathname}` },
    ],
  }
}
