import type { Household } from '../lib/household'
import { DAY_SHORT, iso, isSameDay, weekDays } from '../lib/dates'
import { binOccursOn } from '../lib/recurrence'
import { useBins } from '../modules/Poubelles'
import { WORK_KINDS, useWork } from '../modules/Travail'

export default function WeekCalendar({ household }: { household: Household }) {
  const [bins] = useBins()
  const [work] = useWork()
  const days = weekDays()
  const today = new Date()

  return (
    <div className="week">
      {days.map((d) => {
        const key = iso(d)
        const dayBins = bins.filter((b) => binOccursOn(b, d))
        const dayWork = work.filter((w) => w.from <= key && key <= w.to)
        return (
          <div key={key} className={'day' + (isSameDay(d, today) ? ' today' : '') + (d < today && !isSameDay(d, today) ? ' past' : '')}>
            <div className="day-head">
              <span>{DAY_SHORT[d.getDay()]}</span>
              <strong>{d.getDate()}</strong>
            </div>
            <div className="day-body">
              {dayBins.map((b) => (
                <span key={b.id} className="tag" style={{ background: b.color }} title={b.name}>🗑️ {b.name}</span>
              ))}
              {dayWork.map((w) => {
                const m = household.members.find((x) => x.id === w.member)
                return (
                  <span key={w.id} className="tag soft" style={{ borderColor: m?.color, color: m?.color }} title={`${m?.name} · ${WORK_KINDS[w.kind].label}`}>
                    {WORK_KINDS[w.kind].icon} {m?.name}
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
