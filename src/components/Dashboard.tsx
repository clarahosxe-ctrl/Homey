import type { Household } from '../lib/household'
import { daysBetween, fmtLong } from '../lib/dates'
import { nextPickup } from '../lib/recurrence'
import { MODULES } from '../modules/registry'
import { useShopping } from '../modules/Courses'
import { useBins } from '../modules/Poubelles'
import { daysLeft, useChores } from '../modules/Taches'
import { nextBirthday, useBirthdays } from '../modules/Anniversaires'
import { useGifts } from '../modules/Cadeaux'
import { useCards } from '../modules/Fidelite'
import Art from './Art'
import Weather from './Weather'
import WeekCalendar from './WeekCalendar'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function Dashboard({ household, hhName }: { household: Household; hhName: string }) {
  const [shopping] = useShopping()
  const [bins] = useBins()
  const [chores] = useChores()
  const [cards] = useCards()
  const [birthdays] = useBirthdays()
  const [gifts] = useGifts()
  const soonBirthdays = birthdays.filter((b) => daysBetween(new Date(), nextBirthday(b)) <= 7).length

  const toBuy = shopping.filter((i) => !i.done).length
  const choresDue = chores.filter((c) => daysLeft(c) <= 0).length
  const soonest = bins
    .map((b) => ({ b, next: nextPickup(b) }))
    .filter((x): x is { b: typeof x.b; next: Date } => !!x.next)
    .sort((a, b) => a.next.getTime() - b.next.getTime())[0]
  const delta = soonest ? daysBetween(new Date(), soonest.next) : 0

  const badge: Record<string, string | number | undefined> = {
    courses: toBuy || undefined,
    taches: choresDue || undefined,
    poubelles: soonest && delta <= 1 ? (delta === 0 ? 'auj.' : 'dem.') : undefined,
    fidelite: cards.length || undefined,
    anniversaires: soonBirthdays || undefined,
    cadeaux: gifts.filter((g) => g.status === 'achete' && g.forId !== household.current.id).length || undefined,
  }

  const ready = MODULES.filter((m) => m.ready)
  const soon = MODULES.filter((m) => !m.ready)

  return (
    <div className="stack big-gap">
      <header>
        <h2 className="date">{cap(fmtLong(new Date()))}</h2>
        <p className="sub lead">{hhName} · {household.members.length} membre{household.members.length > 1 ? 's' : ''}</p>
      </header>

      <WeekCalendar household={household} />
      <Weather />

      <section className="sheet-apps">
        <h3 className="section-title">Mes applis</h3>
        <div className="grid">
          {ready.map((m) => (
            <a key={m.id} href={`#/${m.id}`} className="tile" style={{ ['--from' as string]: m.tint![0], ['--to' as string]: m.tint![1] }}>
              <strong>{m.title}</strong>
              <Art id={m.id} />
              {badge[m.id] !== undefined && <span className="count">{badge[m.id]}</span>}
            </a>
          ))}
        </div>

        <h3 className="section-title soon-title">Bientôt</h3>
        <div className="chips">
          {soon.map((m) => (
            <span key={m.id} className="chip ghosty" title={m.blurb}>{m.icon} {m.title}</span>
          ))}
        </div>
      </section>
    </div>
  )
}
