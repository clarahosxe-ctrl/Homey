import { useState } from 'react'
import type { Household } from '../lib/household'
import { DAY_SHORT, addDays, fmtLong, iso, weekDays } from '../lib/dates'
import { useCalendarSources } from '../lib/prefs'
import { binOccursOn } from '../lib/recurrence'
import { renewsOn, useSubs } from '../modules/Abonnements'
import { birthdayOn, useBirthdays } from '../modules/Anniversaires'
import { useBins } from '../modules/Poubelles'
import { useAppts } from '../modules/Rdv'
import { useMeals } from '../modules/Repas'
import { WORK_KINDS, useHolidays, useWork } from '../modules/Travail'
import { useTrips } from '../modules/Voyages'
import { CalendarSettings } from './PrefsSheets'
import { useDues } from './Tracker'

interface Ev { key: string; icon: string; label: string; detail?: string; color: string; href: string }
const MAX_ICONS = 3

/** Calendrier sobre : la semaine en icônes, le détail du jour touché juste en dessous. */
export default function WeekCalendar({ household }: { household: Household }) {
  const [bins] = useBins()
  const [work] = useWork()
  const [birthdays] = useBirthdays()
  const [meals] = useMeals()
  const [trips] = useTrips()
  const dues = Object.values(useDues(400)).flat()
  const [subs] = useSubs()
  const [holidays] = useHolidays()
  const [appts] = useAppts()
  const src = useCalendarSources()
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState(iso(new Date()))
  const [settings, setSettings] = useState(false)

  const days = weekDays(addDays(new Date(), offset * 7))
  const todayKey = iso(new Date())
  const title = days[3].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const sel = days.find((d) => iso(d) === selected) ?? days.find((d) => iso(d) === todayKey) ?? days[0]
  const selKey = iso(sel)

  const eventsOn = (d: Date, key: string): Ev[] => {
    const out: Ev[] = []
    if (src.on('poubelles')) for (const b of bins) if (binOccursOn(b, d)) out.push({ key: 'b' + b.id, icon: '🗑️', label: b.name, detail: 'Ramassage', color: b.color, href: '#/poubelles' })
    if (src.on('anniversaires')) for (const b of birthdays) if (birthdayOn(b, d)) out.push({ key: 'a' + b.id, icon: '🎂', label: `Anniversaire de ${b.name}`, detail: b.year ? `${d.getFullYear() - b.year} ans` : undefined, color: '#c4607e', href: '#/anniversaires' })
    if (src.on('voyages')) for (const t of trips) if (t.from <= key && key <= t.to) out.push({ key: 't' + t.id, icon: '✈️', label: t.name, detail: key === t.from ? 'Départ' : key === t.to ? 'Retour' : 'En voyage', color: '#2f8fb0', href: '#/voyages' })
    if (src.on('travail')) for (const w of work) if (w.from <= key && key <= w.to) {
      const m = household.members.find((x) => x.id === w.member)
      out.push({ key: 'w' + w.id, icon: WORK_KINDS[w.kind].icon, label: `${m?.name ?? ''} · ${WORK_KINDS[w.kind].label}`, detail: w.half ? 'Demi-journée' : undefined, color: m?.color ?? '#4f7cac', href: '#/travail' })
    }
    if (src.on('feries')) for (const h of holidays) if (h.date === key) out.push({ key: 'h' + h.date, icon: '🎌', label: h.name, detail: 'Jour férié', color: '#8a8f99', href: '#/travail' })
    if (src.on('rdv')) for (const a of appts) if (a.booked === key && a.owner === household.current.id) out.push({ key: 'r' + a.id, icon: a.icon, label: a.name, detail: a.bookedTime ? `à ${a.bookedTime}` : 'Rendez-vous', color: '#c0788a', href: '#/rdv' })
    if (src.on('echeances')) for (const x of dues) if (x.next === key) out.push({ key: 'd' + x.subject.id + x.kind, icon: x.icon, label: `${x.subject.name} · ${x.label}`, detail: 'Échéance', color: '#5f9a58', href: '#/' })
    if (src.on('repas')) for (const m of meals) if (m.date === key && m.slot === 'soir') out.push({ key: 'm' + m.id, icon: '🍽️', label: m.title, detail: 'Dîner', color: '#b8861f', href: '#/repas' })
    if (src.on('abonnements')) for (const s of subs) if (renewsOn(s, d)) out.push({ key: 's' + s.id, icon: '🔁', label: s.name, detail: 'Renouvellement', color: '#6f68b8', href: '#/abonnements' })
    return out
  }

  const selEvents = eventsOn(sel, selKey)

  return (
    <section className="card-flat stack">
      <div className="row between">
        <h3 className="cal-title">{title}</h3>
        <div className="row">
          {offset !== 0 && <button className="link" onClick={() => { setOffset(0); setSelected(todayKey) }}>Aujourd’hui</button>}
          <button className="round" onClick={() => setSettings(true)} aria-label="Choisir ce que le calendrier affiche" title="Contenu du calendrier">⚙</button>
          <button className="round" onClick={() => setOffset(offset - 1)} aria-label="Semaine précédente">‹</button>
          <button className="round" onClick={() => setOffset(offset + 1)} aria-label="Semaine suivante">›</button>
        </div>
      </div>

      <div className="strip" role="tablist" aria-label="Jours de la semaine">
        {days.map((d) => {
          const key = iso(d)
          const evs = eventsOn(d, key)
          return (
            <button key={key} role="tab" aria-selected={key === selKey} className={'sday' + (key === selKey ? ' sel' : '') + (key === todayKey ? ' today' : '')} onClick={() => setSelected(key)}>
              <span className="sday-name">{DAY_SHORT[d.getDay()]}</span>
              <span className="sday-num">{d.getDate()}</span>
              <span className="sday-ev">
                {evs.slice(0, MAX_ICONS).map((e) => <i key={e.key}>{e.icon}</i>)}
                {evs.length > MAX_ICONS && <i className="more">+{evs.length - MAX_ICONS}</i>}
              </span>
            </button>
          )
        })}
      </div>

      <div className="agenda">
        <div className="agenda-title" style={{ textTransform: 'capitalize' }}>{fmtLong(sel)}</div>
        {selEvents.length === 0 && <p className="sub" style={{ margin: 0 }}>Rien de prévu ce jour-là.</p>}
        {selEvents.map((e) => (
          <a key={e.key} className="ev" href={e.href} style={{ ['--ev' as string]: e.color }}>
            <span className="ev-icon">{e.icon}</span>
            <span className="grow"><strong>{e.label}</strong>{e.detail && <span className="sub"> · {e.detail}</span>}</span>
          </a>
        ))}
      </div>
      {settings && <CalendarSettings onClose={() => setSettings(false)} />}
    </section>
  )
}
