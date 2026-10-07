import { useState } from 'react'
import type { Household } from '../lib/household'
import { eachDay, fmtShort, iso, parse } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { WorkEntry, WorkKind } from '../lib/types'

export const WORK_KINDS: Record<WorkKind, { label: string; icon: string }> = {
  teletravail: { label: 'Télétravail', icon: '🏠' },
  deplacement: { label: 'Déplacement pro', icon: '🧳' },
  cp: { label: 'Congé payé', icon: '🌴' },
  rtt: { label: 'RTT', icon: '🛋️' },
  maladie: { label: 'Arrêt maladie', icon: '🤒' },
  autre: { label: 'Autre', icon: '📌' },
}

export const useWork = () => useStored<WorkEntry[]>('work', [])

export default function Travail({ household }: { household: Household }) {
  const [entries, setEntries] = useWork()
  const { members, current } = household
  const today = iso(new Date())
  const [kind, setKind] = useState<WorkKind>('cp')
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [note, setNote] = useState('')
  const [who, setWho] = useState(current.id)

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const end = to < from ? from : to
    setEntries((es) => [...es, { id: uid(), member: who, kind, from, to: end, note: note.trim() }])
    setNote('')
  }

  const year = new Date().getFullYear()
  const countDays = (member: string, k: WorkKind) =>
    entries
      .filter((e) => e.member === member && e.kind === k)
      .flatMap((e) => eachDay(e.from, e.to))
      .filter((d) => d.startsWith(String(year)) && ![0, 6].includes(parse(d).getDay())).length

  const upcoming = [...entries].filter((e) => e.to >= today).sort((a, b) => a.from.localeCompare(b.from))
  const past = [...entries].filter((e) => e.to < today).sort((a, b) => b.from.localeCompare(a.from)).slice(0, 5)

  return (
    <div className="stack">
      <section className="panel">
        <h3 className="panel-title">Jours posés en {year} <span className="sub">(jours ouvrés)</span></h3>
        <div className="stats">
          {members.map((m) => (
            <div key={m.id} className="stat" style={{ borderTopColor: m.color }}>
              <strong>{m.name}</strong>
              <span>🌴 {countDays(m.id, 'cp')} CP</span>
              <span>🛋️ {countDays(m.id, 'rtt')} RTT</span>
              <span>🏠 {countDays(m.id, 'teletravail')} télétravail</span>
            </div>
          ))}
        </div>
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
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (lieu, client…) — facultatif" />
        <button className="btn primary">Ajouter</button>
      </form>

      <Entries title="À venir" entries={upcoming} members={members} onRemove={(id) => setEntries((es) => es.filter((e) => e.id !== id))} />
      <Entries title="Récemment" entries={past} members={members} muted onRemove={(id) => setEntries((es) => es.filter((e) => e.id !== id))} />
    </div>
  )
}

function Entries({ title, entries, members, muted, onRemove }: {
  title: string
  entries: WorkEntry[]
  members: Household['members']
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
          return (
            <li key={e.id} className="item">
              <span className="dot-badge" style={{ background: m?.color }}>{m?.name[0]}</span>
              <div className="grow">
                <strong>{k.icon} {k.label}</strong>
                <div className="sub">
                  {e.from === e.to ? fmtShort(parse(e.from)) : `${fmtShort(parse(e.from))} → ${fmtShort(parse(e.to))}`}
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
