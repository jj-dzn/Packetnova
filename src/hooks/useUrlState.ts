import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

// Debounced rather than immediate: pushing a `navigate()` call (and the
// history.replaceState + route re-render it triggers) on every single
// keystroke is heavy enough that fast typing outruns it -- the input's
// value round-trips through the URL and back on each render, so a
// keystroke that lands before the previous one's navigation has committed
// reads back a stale value and gets dropped or reordered. Typed characters
// go straight into local state (always synchronous, never dropped); only
// the URL write-back is debounced.
const URL_SYNC_DEBOUNCE_MS = 300

// A useState-like hook whose value is synced to a URL search param, so a
// tool's current inputs are baked into the URL itself -- reload, paste, or
// share the link and you land on the exact same inputs, not the tool's
// defaults. Falls back to `defaultValue` when the param is absent, and
// omits the param entirely once a field is set back to its default, so
// untouched tools don't grow a URL full of noise.
export function useUrlState(key: string, defaultValue: string): [string, (next: string) => void] {
  const location = useLocation()
  const navigate = useNavigate()

  const urlValue = new URLSearchParams(location.search).get(key) ?? defaultValue

  const [localValue, setLocalValue] = useState(urlValue)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Tracks the last value *this hook* pushed to the URL, so the sync
  // effect below can tell "the URL changed because our own debounced
  // write just landed" (ignore, local state already has it) apart from
  // "the URL changed for some other reason" (browser back/forward, a
  // preset/topology-load flow rewriting several fields at once) -- only
  // the latter should overwrite local state, or typing would get
  // interrupted by its own echo.
  const lastPushed = useRef(urlValue)

  useEffect(() => {
    if (urlValue !== lastPushed.current) {
      lastPushed.current = urlValue
      setLocalValue(urlValue)
    }
  }, [urlValue])

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  const setValue = useCallback(
    (next: string) => {
      setLocalValue(next)
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        const nextParams = new URLSearchParams(window.location.search)
        // Only the default value itself gets omitted from the URL -- an
        // empty string is a real, distinct state (the user is mid-edit,
        // field cleared) and has to round-trip back out as empty too, not
        // silently snap back to the default and swallow the next keystroke.
        if (next === defaultValue) {
          nextParams.delete(key)
        } else {
          nextParams.set(key, next)
        }
        const search = nextParams.toString()
        lastPushed.current = next
        navigate(
          { pathname: window.location.pathname, search: search ? `?${search}` : '' },
          { replace: true },
        )
      }, URL_SYNC_DEBOUNCE_MS)
    },
    [key, defaultValue, navigate],
  )

  return [localValue, setValue]
}
