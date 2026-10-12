import { useStored } from './storage'
import type { ModuleInfo } from '../modules/registry'

/* Préférences d'affichage propres à chaque appareil (donc à chaque personne) : jamais synchronisées. */

export const HOME_SECTIONS = [
  { id: 'calendar', label: 'Calendrier de la semaine', icon: '📅' },
  { id: 'weather', label: 'Météo', icon: '🌤️' },
]

export function useHomePrefs() {
  const [hiddenApps, setHiddenApps] = useStored<string[]>('apps-hidden', [])
  const [order, setOrder] = useStored<string[]>('apps-order', [])
  const [hiddenSections, setHiddenSections] = useStored<string[]>('home-hidden', [])

  const sort = (mods: ModuleInfo[]) => {
    const rank = (m: ModuleInfo, i: number) => { const k = order.indexOf(m.id); return k >= 0 ? k : 1000 + i }
    return mods.map((m, i) => [m, rank(m, i)] as const).sort((a, b) => a[1] - b[1]).map(([m]) => m)
  }
  const toggle = (set: (u: (l: string[]) => string[]) => void, id: string) => set((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))

  return {
    sort,
    appVisible: (id: string) => !hiddenApps.includes(id),
    toggleApp: (id: string) => toggle(setHiddenApps, id),
    showAll: () => setHiddenApps([]),
    hideAll: (ids: string[]) => setHiddenApps(ids),
    hiddenCount: hiddenApps.length,
    move: (ids: string[], id: string, dir: -1 | 1) => {
      const i = ids.indexOf(id), j = i + dir
      if (i < 0 || j < 0 || j >= ids.length) return
      const next = [...ids]; [next[i], next[j]] = [next[j], next[i]]
      setOrder(next)
    },
    sectionVisible: (id: string) => !hiddenSections.includes(id),
    toggleSection: (id: string) => toggle(setHiddenSections, id),
  }
}

/** Ce qui apparaît dans le calendrier de la semaine. `def` = valeur par défaut (sobre). */
export const CALENDAR_SOURCES = [
  { id: 'poubelles', label: 'Poubelles', icon: '🗑️', def: true },
  { id: 'anniversaires', label: 'Anniversaires', icon: '🎂', def: true },
  { id: 'voyages', label: 'Voyages', icon: '✈️', def: true },
  { id: 'travail', label: 'Absences et télétravail', icon: '💼', def: true },
  { id: 'feries', label: 'Jours fériés', icon: '🎌', def: true },
  { id: 'rdv', label: 'Mes rendez-vous (coiffeur, beauté…)', icon: '💇', def: true },
  { id: 'echeances', label: 'Échéances (vaccins, contrôle technique, garanties…)', icon: '📌', def: false },
  { id: 'repas', label: 'Dîners prévus', icon: '🍽️', def: false },
  { id: 'abonnements', label: 'Renouvellements d’abonnements', icon: '🔁', def: false },
]

export function useCalendarSources() {
  const [override, setOverride] = useStored<Record<string, boolean>>('cal-sources', {})
  const def = (id: string) => CALENDAR_SOURCES.find((s) => s.id === id)?.def ?? true
  return {
    on: (id: string) => override[id] ?? def(id),
    toggle: (id: string) => setOverride((o) => ({ ...o, [id]: !(o[id] ?? def(id)) })),
    reset: () => setOverride({}),
  }
}
