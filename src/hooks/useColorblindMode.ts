import { useEffect, useState } from 'react'

const STORAGE_KEY = 'packetnova-colorblind'

function getInitial(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

// Mirrors useDarkMode's shape exactly (a class toggled on <html>, persisted
// to localStorage) -- the two are independent and combine freely, since
// index.css defines both .colorblind and .dark.colorblind token sets.
export function useColorblindMode() {
  const [colorblind, setColorblind] = useState<boolean>(getInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('colorblind', colorblind)
    window.localStorage.setItem(STORAGE_KEY, String(colorblind))
  }, [colorblind])

  const toggleColorblind = () => setColorblind((current) => !current)

  return { colorblind, toggleColorblind }
}
