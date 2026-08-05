import { useEffect, useRef, type RefObject } from 'react'
import { useLocation } from 'react-router'

// Client-side navigation never resets scroll position or focus the way a
// full page load does. Two fixes, both applied on every route change
// (skipped on the very first render, which is the initial load -- scroll
// and focus should stay at the browser's own defaults there):
//
// 1. Scroll to the top of the page. Without this, navigating away from a
//    scrolled-down page leaves the viewport at the same pixel offset on
//    the new page -- on a shorter page, or one where <main> starts higher
//    up, that can scroll the persistent Nav header (which sits above
//    <main>, not fixed/sticky) out of view entirely.
// 2. Move focus to the main landmark, mirroring what a real page load
//    does -- without this, focus stays on whatever link was clicked,
//    often now far from the new page's content, and screen reader users
//    get no signal the page changed at all. `preventScroll: true` is
//    required here: focusing an off-screen-until-a-moment-ago element
//    triggers the browser's own "scroll it into view" behavior, which
//    would immediately re-scroll past the Nav header we just fixed above
//    (this is, in fact, exactly how the Nav-header-goes-missing bug
//    happened before this comment existed).
export function useFocusMainOnNavigate(mainRef: RefObject<HTMLElement | null>) {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [location.pathname, mainRef])
}
