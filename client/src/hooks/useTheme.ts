import { useState, useCallback, useEffect } from 'react'
import type { Theme } from '@/types'
import { THEME_STORAGE_KEY } from '@/config/constants'

const defaultTheme: Theme = 'light'

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return defaultTheme
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return (stored === 'dark' || stored === 'light') ? stored : defaultTheme
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  return { theme, setTheme, toggleTheme }
}
