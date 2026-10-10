import type { Household } from '../../lib/household'
import type { Booking, Trip, Traveler } from '../../lib/types'

export const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
export const nf = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
export const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : '')

export const BOOKING_KINDS = [
  { id: 'vol', icon: '✈️', label: 'Vol', cat: 'transport' },
  { id: 'train', icon: '🚆', label: 'Train / bus', cat: 'transport' },
  { id: 'hebergement', icon: '🏨', label: 'Hébergement', cat: 'hebergement' },
  { id: 'location', icon: '🚗', label: 'Location voiture', cat: 'transport' },
  { id: 'activite', icon: '🎟️', label: 'Activité / billet', cat: 'activite' },
  { id: 'autre', icon: '📌', label: 'Autre', cat: 'autre' },
]
export const bookingKind = (id: string) => BOOKING_KINDS.find((k) => k.id === id) ?? BOOKING_KINDS[BOOKING_KINDS.length - 1]

export const CATEGORIES = [
  { id: 'transport', icon: '🚆', label: 'Transport' },
  { id: 'hebergement', icon: '🏨', label: 'Hébergement' },
  { id: 'activite', icon: '🎟️', label: 'Activités' },
  { id: 'repas', icon: '🍽️', label: 'Repas' },
  { id: 'shopping', icon: '🛍️', label: 'Shopping' },
  { id: 'autre', icon: '📌', label: 'Autre' },
]
export const category = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]

export interface SectionProps {
  trip: Trip
  patch: (fn: (t: Trip) => Trip) => void
  household: Household
  travelers: Traveler[]
}

/** Voyageurs : ceux du voyage, ou à défaut tous les membres du foyer. */
export const travelersOf = (t: Trip, members: Household['members']): Traveler[] =>
  t.travelers ?? members.map((m) => ({ id: m.id, name: m.name, member: m.id, kind: 'adulte' as const }))

export interface Line { label: string; cat: string; amount: number; paid: boolean; payer?: string; src: 'resa' | 'prog' | 'depense' }

/** Toutes les lignes de coût du voyage (réservations, programme, dépenses sur place). */
export function costLines(t: Trip): Line[] {
  const lines: Line[] = []
  for (const b of t.bookings ?? []) if (b.cost) lines.push({ label: b.title, cat: bookingKind(b.kind).cat, amount: b.cost, paid: b.paid, payer: b.payer, src: 'resa' })
  for (const p of t.plan) if (p.cost) lines.push({ label: p.label, cat: p.kind, amount: p.cost, paid: !!p.paid, payer: p.payer, src: 'prog' })
  for (const e of t.expenses ?? []) lines.push({ label: e.label, cat: e.category, amount: e.amount, paid: true, payer: e.payer, src: 'depense' })
  return lines
}

export const bookingsOn = (t: Trip, day: string): Booking[] => (t.bookings ?? []).filter((b) => b.date === day)
