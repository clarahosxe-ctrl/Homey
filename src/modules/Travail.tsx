import { useState } from 'react'
import Avatar from '../components/Avatar'
import type { Household } from '../lib/household'
import { eachDay, fmtShort, iso, parse } from '../lib/dates'
import { frenchHolidays } from '../lib/holidays'
import { uid, useStored } from '../lib/storage'
import type { Holiday, WorkEntry, WorkKind } from '../lib/types'

export const WORK_KINDS: Record<WorkKind, { label: string; icon: string }> = {
  teletravail: { label: 'Télétravail', icon: '🏠' },
  deplacement: { label: 'Déplacement pro', icon: '🧳' },
  cp: { label: 'Congé payé', icon: '🌴' },
  rtt: { label: 'RTT', icon: '🛋️' },
  maladie: { label: 'Arrêt maladie', icon: '🤒' },
  autre: { label: 'Autre', icon: '📌' },
}

export const useWork = () => useStored<WorkEntry[]>('work', [])
export const useHolidays = () => useStored<Holiday[]>('holidays', [])
type Quota = Record<string, { cp?: number; rtt?: number }>

const isWeekend = (d: string) => [0, 6].includes(parse(d).getDay())
const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })

/** Jours réellement décomptés : ni week-ends, ni jours fériés. */
export function countedDays(from: string, to: string, holidays: Set<string>) {
  return eachDay(from, to).filter((d) => !isWeekend(d) && !holidays.has(d))
}
const factor = (e: WorkEntry) => (e.half && e.from === e.to ? 0.5 : 1)

export default function Travail({ household }: { household: Household }) {
  const [entries, setEntries] = useWork()
  const [holidays, setHolidays] = useHolidays()
  const [quota, setQuota] = useStored<Quota>('work-quota', {})
  const { members, current } = household
  const today = iso(new Date())
  const [kind, setKind] = useState<WorkKind>('cp')
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [half, setHalf] = useState(false)
  const [note, setNote] = useState('')
  const [who, setWho] = useState(current.id)
  const [holYear, setHolYear] = useState(new Date().getFullYear())
  const [hDate, setHDate] = useState(today)
  const [hName, setHName] = useState('')

  const holSet = new Set(holidays.map((h) => h.date))
  const end = to < from ? from : to
  const all = eachDay(from, end)
  const weekends = all.filter(isWeekend).length
  const feries = all.filter((d) => !isWeekend(d) && holSet.has(d)).length
  const counted = all.length - weekends - feries
  const preview = counted * (half && from === end ? 0.5 : 1)

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    setEntries((es) => [...es, { id: uid(), member: who, kind, from, to: end, note: note.trim(), half: half && from === end ? true : undefined }])
    setNote(''); setHalf(false)
  }

  const year = new Date().getFullYear()
  const amountIn = (e: WorkEntry, y: number) => countedDays(e.from, e.to, holSet).filter((d) => d.startsWith(String(y))).length * factor(e)
  const countDays = (member: string, k: WorkKind) => entries.filter((e) => e.member === member && e.kind === k).reduce((t, e) => t + amountIn(e, year), 0)

  const setQ = (member: string, k: 'cp' | 'rtt', v: string) =>
    setQuota((q) => ({ ...q, [member]: { ...q[member], [k]: v === '' ? undefined : Number(v) } }))

  const upcoming = [...entries].filter((e) => e.to >= today).sort((a, b) => a.from.localeCompare(b.from))
  const past = [...entries].filter((e) => e.to < today).sort((a, b) => b.from.localeCompare(a.from)).slice(0, 5)

  const yearHolidays = holidays.filter((h) => h.date.startsWith(String(holYear))).sort((a, b) => a.date.localeCompare(b.date))
  const fillHolidays = () => setHolidays((hs) => {
    const have = new Set(hs.map((h) => h.date))
    return [...hs, ...frenchHolidays(holYear).filter((h) => !have.has(h.date))]
  })

  return (
    <div className="stack">
      <section className="panel stack">
        <h3 className="panel-title">Jours posés en {year} <span className="sub">(jours ouvrés, hors week-ends et fériés)</span></h3>
        <div className="stats">
          {members.map((m) => {
            const cp = countDays(m.id, 'cp'), rtt = countDays(m.id, 'rtt')
            const q = quota[m.id] ?? {}
            return (
              <div key={m.id} className="stat" style={{ borderTopColor: m.color }}>
                <strong>{m.name}</strong>
                <span>🌴 {fmt(cp)} CP pris{q.cp !== undefined && <> · reste <b>{fmt(q.cp - cp)}</b></>}</span>
                <span>🛋️ {fmt(rtt)} RTT pris{q.rtt !== undefined && <> · reste <b>{fmt(q.rtt - rtt)}</b></>}</span>
                <span>🏠 {fmt(countDays(m.id, 'teletravail'))} télétravail</span>
                <div className="row nowrap quota">
                  <label>CP/an <input type="number" min={0} step="0.5" value={q.cp ?? ''} onChange={(e) => setQ(m.id, 'cp', e.target.value)} aria-label={`CP annuels de ${m.name}`} /></label>
                  <label>RTT/an <input type="number" min={0} step="0.5" value={q.rtt ?? ''} onChange={(e) => setQ(m.id, 'rtt', e.target.value)} aria-label={`RTT annuels de ${m.name}`} /></label>
                </div>
              </div>
            )
          })}
        </div>
        <p className="sub">Renseignez vos droits annuels (CP/an, RTT/an) pour voir ce qu’il vous reste.</p>
      </section>

      <form className="panel stack" onSubmit={add}>
        <h3 className="panel-title">Ajouter</h3>
        <div className="chips" role="group" aria-label="Type">
          {(Object.keys(WORK_KINDS) as WorkKind[]).map((k) => (
            <button type="button" key={k} className={'chip' + (kind === k ? ' on' : '')} onClick={() => setKind(k)}>
              {WORK_KINDS[k].icon} {WORK_KINDS[k].label}
            </button>
          ))}
        </div>
        <div className="row">
          <label className="field">Qui
            <select value={who} onChange={(e) => setWho(e.target.value)}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <label className="field">Du
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); if (to < e.target.value) setTo(e.target.value) }} />
          </label>
          <label className="field">Au
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
        {from === end && (
          <label className="check inline">
            <input type="checkbox" checked={half} onChange={(e) => setHalf(e.target.checked)} />
            <span className="box" /> <span>Demi-journée</span>
          </label>
        )}
        <p className="sub preview">
          = <strong>{fmt(preview)} jour{preview > 1 ? 's' : ''} décompté{preview > 1 ? 's' : ''}</strong>
          {weekends > 0 && ` · ${weekends} jour${weekends > 1 ? 's' : ''} de week-end non décompté${weekends > 1 ? 's' : ''}`}
          {feries > 0 && ` · ${feries} férié${feries > 1 ? 's' : ''} non décompté${feries > 1 ? 's' : ''}`}
        </p>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (lieu, client…) — facultatif" />
        <button className="btn primary">Ajouter</button>
      </form>

      <Entries title="À venir" entries={upcoming} members={members} holidays={holSet} onRemove={(id) => setEntries((es) => es.filter((e) => e.id !== id))} />
      <Entries title="Récemment" entries={past} members={members} holidays={holSet} muted onRemove={(id) => setEntries((es) => es.filter((e) => e.id !== id))} />

      <section className="panel stack">
        <div className="row between">
          <h3 className="panel-title">🎌 Jours fériés</h3>
          <div className="row">
            <button className="round" onClick={() => setHolYear(holYear - 1)} aria-label="Année précédente">‹</button>
            <strong>{holYear}</strong>
            <button className="round" onClick={() => setHolYear(holYear + 1)} aria-label="Année suivante">›</button>
          </div>
        </div>
        {yearHolidays.length === 0 && <p className="sub">Aucun jour férié enregistré pour {holYear}.</p>}
        <button className="btn small" onClick={fillHolidays}>➕ Ajouter les jours fériés français {holYear}</button>
        {yearHolidays.length > 0 && (
          <ul className="list">
            {yearHolidays.map((h) => (
              <li key={h.date} className="item">
                <span className="sub" style={{ width: 92 }}>{parse(h.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className="grow">{h.name}</span>
                <button className="icon-btn" onClick={() => setHolidays((hs) => hs.filter((x) => x.date !== h.date))} aria-label={`Retirer ${h.name}`}>×</button>
              </li>
            ))}
          </ul>
        )}
        <form className="row add-form" onSubmit={(e) => {
          e.preventDefault()
          if (!hName.trim() || holSet.has(hDate)) return
          setHolidays((hs) => [...hs, { date: hDate, name: hName.trim() }]); setHName('')
        }}>
          <input type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} aria-label="Date" />
          <input value={hName} onChange={(e) => setHName(e.target.value)} placeholder="Autre jour (pont, solidarité…)" />
          <button className="btn small">Ajouter</button>
        </form>
        <p className="sub">Ces jours, comme les week-ends, ne sont jamais décomptés de vos congés.</p>
      </section>
    </div>
  )
}

function Entries({ title, entries, members, holidays, muted, onRemove }: {
  title: string
  entries: WorkEntry[]
  members: Household['members']
  holidays: Set<string>
  muted?: boolean
  onRemove: (id: string) => void
}) {
  if (!entries.length) return null
  return (
    <section className={'panel' + (muted ? ' muted' : '')}>
      <h3 className="panel-title">{title}</h3>
      <ul className="list">
        {entries.map((e) => {
          const m = members.find((x) => x.id === e.member)
          const k = WORK_KINDS[e.kind]
          const n = countedDays(e.from, e.to, holidays).length * factor(e)
          return (
            <li key={e.id} className="item">
              {m && <Avatar m={m} />}
              <div className="grow">
                <strong>{k.icon} {k.label}{e.half && ' (½ j)'}</strong>
                <div className="sub">
                  {e.from === e.to ? fmtShort(parse(e.from)) : `${fmtShort(parse(e.from))} → ${fmtShort(parse(e.to))}`}
                  {` · ${fmt(n)} j décompté${n > 1 ? 's' : ''}`}
                  {e.note && ` · ${e.note}`}
                </div>
              </div>
              <button className="icon-btn" onClick={() => onRemove(e.id)} aria-label="Supprimer">×</button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

