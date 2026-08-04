import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'

// A useState-like hook whose value is synced to a URL search param, so a
// tool's current inputs are baked into the URL itself -- reload, paste, or
// share the link and you land on the exact same inputs, not the tool's
// defaults. Falls back to `defaultValue` when the param is absent, and
// omits the param entirely once a field is set back to its default, so
// untouched tools don't grow a URL full of noise.
export function useUrlState(key: string, defaultValue: string): [string, (next: string) => void] {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const value = params.get(key) ?? defaultValue

  const setValue = useCallback(
    (next: string) => {
      const nextParams = new URLSearchParams(window.location.search)
      if (next === defaultValue || next === '') {
        nextParams.delete(key)
      } else {
        nextParams.set(key, next)
      }
      const search = nextParams.toString()
      navigate(
        { pathname: window.location.pathname, search: search ? `?${search}` : '' },
        { replace: true },
      )
    },
    [key, defaultValue, navigate],
  )

  return [value, setValue]
}
