import { addDays, iso } from './dates'
import type { Holiday } from './types'

/** Dimanche de Pâques (algorithme grégorien, Meeus/Jones/Butcher). */
export function easter(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/** Les 11 jours fériés légaux en France métropolitaine. */
export function frenchHolidays(year: number): Holiday[] {
  const p = easter(year)
  const fixed = (m: number, d: number) => iso(new Date(year, m - 1, d))
  return [
    { date: fixed(1, 1), name: 'Jour de l’an' },
    { date: iso(addDays(p, 1)), name: 'Lundi de Pâques' },
    { date: fixed(5, 1), name: 'Fête du Travail' },
    { date: fixed(5, 8), name: 'Victoire 1945' },
    { date: iso(addDays(p, 39)), name: 'Ascension' },
    { date: iso(addDays(p, 50)), name: 'Lundi de Pentecôte' },
    { date: fixed(7, 14), name: 'Fête nationale' },
    { date: fixed(8, 15), name: 'Assomption' },
    { date: fixed(11, 1), name: 'Toussaint' },
    { date: fixed(11, 11), name: 'Armistice' },
    { date: fixed(12, 25), name: 'Noël' },
  ]
}
