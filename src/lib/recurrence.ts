import { addDays, daysBetween, iso, mondayOf, startOfDay } from './dates'
import type { Bin } from './types'

/** La poubelle est-elle ramassée ce jour-là ? */
export function binOccursOn(bin: Bin, date: Date) {
  if (!bin.days.includes(date.getDay())) return false
  const weeks = Math.round(daysBetween(mondayOf(new Date(bin.anchor + 'T00:00')), mondayOf(date)) / 7)
  return weeks >= 0 && weeks % Math.max(1, bin.everyWeeks) === 0
}

/** Prochain ramassage à partir d'aujourd'hui (inclus). */
export function nextPickup(bin: Bin, from = new Date()): Date | null {
  const start = startOfDay(from)
  for (let i = 0; i < 400; i++) {
    const d = addDays(start, i)
    if (binOccursOn(bin, d)) return d
  }
  return null
}

export const recurrenceLabel = (bin: Bin) => {
  const days = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
  const list = [1, 2, 3, 4, 5, 6, 0].filter((d) => bin.days.includes(d)).map((d) => days[d])
  const freq = bin.everyWeeks === 1 ? 'chaque semaine' : `1 semaine sur ${bin.everyWeeks}`
  return `${list.join(', ')} · ${freq}`
}

export const todayIso = () => iso(new Date())
