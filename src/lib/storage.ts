import { useEffect, useState } from 'react'

const PREFIX = 'homey:'

/** useState persisté dans localStorage, synchronisé entre composants/onglets. */
export function useStored<T>(key: string, initial: T) {
  const full = PREFIX + key
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(full)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(full, JSON.stringify(value))
      window.dispatchEvent(new CustomEvent('homey-store', { detail: full }))
    } catch {
      /* quota / mode privé : on continue en mémoire */
    }
  }, [full, value])

  useEffect(() => {
    const sync = (e: Event) => {
      const changed = e instanceof StorageEvent ? e.key : (e as CustomEvent).detail
      if (changed !== full) return
      try {
        const raw = localStorage.getItem(full)
        if (raw && raw !== JSON.stringify(value)) setValue(JSON.parse(raw) as T)
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', sync)
    window.addEventListener('homey-store', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('homey-store', sync)
    }
  })

  return [value, setValue] as const
}

export const uid = () => Math.random().toString(36).slice(2, 10)
