import { useCallback, useSyncExternalStore } from 'react'
import {
  getNotebookEntries,
  subscribeToNotebook,
  pinToNotebook,
  removeFromNotebook,
  clearNotebook,
  type NotebookEntry,
} from '../lib/storage/notebook'

export function useNotebook() {
  const entries = useSyncExternalStore(subscribeToNotebook, getNotebookEntries, () => [])

  const pin = useCallback(
    (entry: Omit<NotebookEntry, 'id' | 'pinnedAt'>) => pinToNotebook(entry),
    [],
  )
  const remove = useCallback((id: string) => removeFromNotebook(id), [])
  const clear = useCallback(() => clearNotebook(), [])

  return { entries, pin, remove, clear }
}
