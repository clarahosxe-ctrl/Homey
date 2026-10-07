/** Dates "jour" au format local YYYY-MM-DD (pas de piège de fuseau horaire). */
export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d: Date, n: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Lundi de la semaine contenant d. */
export const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7))

export const weekDays = (d = new Date()) => {
  const m = mondayOf(d)
  return Array.from({ length: 7 }, (_, i) => addDays(m, i))
}

export const DAY_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
export const DAY_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
/** Ordre d'affichage lundi → dimanche (valeurs = Date.getDay()). */
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const isSameDay = (a: Date, b: Date) => iso(a) === iso(b)

export const fmtLong = (d: Date) =>
  d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export const fmtShort = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

export const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000)

/** Liste de jours de `from` à `to` inclus. */
export function eachDay(from: string, to: string) {
  const out: string[] = []
  for (let d = parse(from), end = parse(to); d <= end; d = addDays(d, 1)) out.push(iso(d))
  return out
}
