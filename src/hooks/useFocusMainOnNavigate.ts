import { useEffect, useRef, type RefObject } from 'react'
import { useLocation } from 'react-router'

// Client-side navigation never resets focus the way a full page load does
// -- without this, focus stays on whatever link was clicked (often now far
// from the new page's content) and screen reader users get no signal the
// page changed at all. Moving focus to the main landmark on every route
// change is the standard SPA fix, mirroring what a real page load does.
// Skipped on the very first render: that's the initial load, where focus
// belongs at the browser's own default rather than being yanked away from
// the address bar.
export function useFocusMainOnNavigate(mainRef: RefObject<HTMLElement | null>) {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
  }, [location.pathname, mainRef])
}
