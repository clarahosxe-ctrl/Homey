import type { Household } from '../lib/household'
import { fmtLong } from '../lib/dates'
import { nextPickup } from '../lib/recurrence'
import { daysBetween } from '../lib/dates'
import { MODULES } from '../modules/registry'
import { useShopping } from '../modules/Courses'
import { useBins } from '../modules/Poubelles'
import Weather from './Weather'
import WeekCalendar from './WeekCalendar'

function greeting() {
  const h = new Date().getHours()
  return h < 6 ? 'Bonne nuit' : h < 18 ? 'Bonjour' : 'Bonsoir'
}

export default function Dashboard({ household }: { household: Household }) {
  const [shopping] = useShopping()
  const [bins] = useBins()

  const todo = shopping.filter((i) => !i.done).length
  const soonest = bins
    .map((b) => ({ b, next: nextPickup(b) }))
    .filter((x): x is { b: typeof x.b; next: Date } => !!x.next)
    .sort((a, b) => a.next.getTime() - b.next.getTime())[0]

  const summary: Record<string, string | undefined> = {
    courses: todo ? `${todo} à acheter` : 'Liste vide',
    poubelles: soonest
      ? `${soonest.b.name} · ${daysBetween(new Date(), soonest.next) === 0 ? "aujourd'hui" : daysBetween(new Date(), soonest.next) === 1 ? 'demain' : fmtLong(soonest.next)}`
      : undefined,
  }

  return (
    <div className="stack big-gap">
      <section className="hero">
        <div>
          <p className="eyebrow">{fmtLong(new Date())}</p>
          <h2>{greeting()}, {household.current.name} 👋</h2>
        </div>
        <Weather />
      </section>

      <section>
        <h3 className="section-title">Cette semaine</h3>
        <WeekCalendar household={household} />
      </section>

      <section>
        <h3 className="section-title">Mes mini-applis</h3>
        <div className="grid">
          {MODULES.map((m) =>
            m.ready ? (
              <a key={m.id} href={`#/${m.id}`} className="card" style={{ ['--hue' as string]: m.hue }}>
                <span className="card-icon">{m.icon}</span>
                <strong>{m.title}</strong>
                <span className="sub">{summary[m.id] ?? m.blurb}</span>
              </a>
            ) : (
              <div key={m.id} className="card soon" style={{ ['--hue' as string]: m.hue }} title="Bientôt">
                <span className="card-icon">{m.icon}</span>
                <strong>{m.title}</strong>
                <span className="sub">{m.blurb}</span>
                <span className="badge-soon">bientôt</span>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  )
}
