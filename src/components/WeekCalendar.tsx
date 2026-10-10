import { useState } from 'react'
import type { Household } from '../lib/household'
import { DAY_SHORT, addDays, iso, isSameDay, weekDays } from '../lib/dates'
import { binOccursOn } from '../lib/recurrence'
import { useBins } from '../modules/Poubelles'
import { birthdayOn, useBirthdays } from '../modules/Anniversaires'
import { useMeals } from '../modules/Repas'
import { dueItems, useTracker } from './Tracker'
import { useTrips } from '../modules/Voyages'
import { PETS, VEHICLES } from '../modules/trackers'
import { WORK_KINDS, useWork } from '../modules/Travail'

export default function WeekCalendar({ household }: { household: Household }) {
  const [bins] = useBins()
  const [work] = useWork()
  const [birthdays] = useBirthdays()
  const [meals] = useMeals()
  const [trips] = useTrips()
  const pets = useTracker('pets')
  const cars = useTracker('vehicles')
  const dues = [
    ...dueItems(pets.subjects, pets.records, 400).map((d) => ({ ...d, icon: PETS.kinds.find((k) => k.id === d.kind)?.icon ?? '🐾' })),
    ...dueItems(cars.subjects, cars.records, 400).map((d) => ({ ...d, icon: VEHICLES.kinds.find((k) => k.id === d.kind)?.icon ?? '🚗' })),
  ]
  const [offset, setOffset] = useState(0)
  const days = weekDays(addDays(new Date(), offset * 7))
  const today = new Date()
  const title = days[3].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <section className="card-flat">
      <div className="row between">
        <h3 className="cal-title">{title}</h3>
        <div className="row">
          {offset !== 0 && <button className="link" onClick={() => setOffset(0)}>Aujourd’hui</button>}
          <button className="round" onClick={() => setOffset(offset - 1)} aria-label="Semaine précédente">‹</button>
          <button className="round" onClick={() => setOffset(offset + 1)} aria-label="Semaine suivante">›</button>
        </div>
      </div>
      <div className="week">
        {days.map((d) => {
          const key = iso(d)
          const isToday = isSameDay(d, today)
          return (
            <div key={key} className={'day' + (isToday ? ' today' : '')}>
              <div className="day-head">{DAY_SHORT[d.getDay()]} {d.getDate()}</div>
              <div className="day-body">
                {birthdays.filter((b) => birthdayOn(b, d)).map((b) => (
                  <span key={b.id} className="tag" style={{ background: '#c4607e' }} title={`Anniversaire de ${b.name}`}>🎂<b>{b.name}</b></span>
                ))}
                {trips.filter((t) => t.from <= key && key <= t.to).map((t) => (
                  <span key={t.id} className="tag" style={{ background: '#2f8fb0' }} title={t.name}>✈️<b>{t.name}</b></span>
                ))}
                {dues.filter((x) => x.next === key).map((x) => (
                  <span key={x.subject.id + x.kind} className="tag" style={{ background: '#5f9a58' }} title={`${x.subject.name} : ${x.kind}`}>{x.icon}<b>{x.subject.name}</b></span>
                ))}
                {meals.filter((m) => m.date === key && m.slot === 'soir').map((m) => (
                  <span key={m.id} className="tag" style={{ background: '#b8861f' }} title={`Dîner : ${m.title}`}>🍽️<b>{m.title}</b></span>
                ))}
                {bins.filter((b) => binOccursOn(b, d)).map((b) => (
                  <span key={b.id} className="tag" style={{ background: b.color }} title={b.name}>🗑️<b>{b.name}</b></span>
                ))}
                {work.filter((w) => w.from <= key && key <= w.to).map((w) => {
                  const m = household.members.find((x) => x.id === w.member)
                  return (
                    <span key={w.id} className="tag soft" style={{ borderColor: m?.color, color: m?.color }} title={`${m?.name} · ${WORK_KINDS[w.kind].label}`}>
                      {WORK_KINDS[w.kind].icon}<b>{m?.name}</b>
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
