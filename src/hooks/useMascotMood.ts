import { useSyncExternalStore } from 'react'
import { getMascotMood, subscribeToMascotMood } from '../lib/mascotMood'

export function useMascotMood() {
  return useSyncExternalStore(subscribeToMascotMood, getMascotMood, () => 'idle' as const)
}
