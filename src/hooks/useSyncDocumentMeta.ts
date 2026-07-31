import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getPageMeta } from '../lib/seo/pageMeta'

export function useSyncDocumentMeta() {
  const location = useLocation()

  useEffect(() => {
    const { title, description } = getPageMeta(location.pathname)
    document.title = title

    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
  }, [location.pathname])
}
