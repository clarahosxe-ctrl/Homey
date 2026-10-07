import { useCallback, useEffect, useState } from 'react'
import { markDirty, scheduleFlush } from './sync'

const PREFIX = 'homey:'

/** useState persisté dans localStorage, synchronisé entre composants/onglets et avec le foyer. */
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
    scheduleFlush(key)
  }, [full, key, value])

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

  /** Modification faite par l'utilisateur (marquée "à envoyer" au foyer). */
  const set = useCallback(
    (u: T | ((prev: T) => T)) => {
      markDirty(key)
      setValue(u)
    },
    [key],
  )

  return [value, set] as const
}

export const uid = () => Math.random().toString(36).slice(2, 10)
