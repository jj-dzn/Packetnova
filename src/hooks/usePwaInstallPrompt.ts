import { useEffect, useState } from 'react'

// Chromium's non-standard beforeinstallprompt event -- not in lib.dom.d.ts,
// so it needs its own minimal shape here.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// The browser only fires beforeinstallprompt when its own install
// heuristics are satisfied (not already installed, engagement criteria
// met, etc.) and only on Chromium-based browsers -- Safari and Firefox
// never fire it at all. Capturing the event lets a visible "Install app"
// control trigger the native prompt on demand, instead of visitors having
// to find the browser's own, often well-hidden install affordance.
export function usePwaInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredEvent(event as BeforeInstallPromptEvent)
    }
    function onAppInstalled() {
      setInstalled(true)
      setDeferredEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    const { outcome } = await deferredEvent.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredEvent(null)
  }

  return { canInstall: deferredEvent !== null && !installed, promptInstall }
}
