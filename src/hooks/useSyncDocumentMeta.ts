import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getPageMeta, SITE_URL } from '../lib/seo/pageMeta'

function setMetaByAttr(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Runs on every route change to keep <title>, the description meta, the
// canonical link, and the OG/Twitter tags all pointing at the current page
// -- the same lookup (getPageMeta) that already drove title/description
// extends naturally to these, since they're derived from the same
// title/description/URL per page, not separate content to maintain.
export function useSyncDocumentMeta() {
  const location = useLocation()

  useEffect(() => {
    const { title, description } = getPageMeta(location.pathname)
    const url = `${SITE_URL}${location.pathname}`

    document.title = title

    const descriptionMeta = document.querySelector('meta[name="description"]')
    if (descriptionMeta) descriptionMeta.setAttribute('content', description)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    setMetaByAttr('property', 'og:url', url)
    setMetaByAttr('property', 'og:title', title)
    setMetaByAttr('property', 'og:description', description)
    setMetaByAttr('name', 'twitter:title', title)
    setMetaByAttr('name', 'twitter:description', description)
  }, [location.pathname])
}
