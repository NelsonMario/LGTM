export const THEME_STORAGE_KEY = 'theme'

export function getWsUrl(): string {
  if (import.meta.env.DEV) return 'ws://localhost:8081/ws'
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}
