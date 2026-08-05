import { useCallback, useSyncExternalStore } from 'react'
import {
  getPathProgress,
  toggleStepComplete,
  subscribeToPathProgress,
  type PathProgress,
} from '../lib/storage/pathProgress'

const EMPTY_PROGRESS: PathProgress = {}

export function usePathProgress() {
  const progress = useSyncExternalStore(
    subscribeToPathProgress,
    getPathProgress,
    () => EMPTY_PROGRESS,
  )
  const toggle = useCallback((pathSlug: string, stepKey: string) => {
    toggleStepComplete(pathSlug, stepKey)
  }, [])
  return { progress, toggle }
}
