import { useState } from 'react'
import { daysBetween, startOfDay } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import { useGifts } from './Cadeaux'
import type { Birthday } from '../lib/types'

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

export const useBirthdays = () => useStored<Birthday[]>('birthdays', [])

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
const daysIn = (m: number, y: number) => new Date(y, m, 0).getDate()

/** Date de l'anniversaire pour une année donnée (le 29 février devient le 28 les années non bissextiles). */
const inYear = (b: Birthday, y: number) =>
  new Date(y, b.month - 1, b.month === 2 && b.day === 29 && !isLeap(y) ? 28 : b.day)

export const birthdayOn = (b: Birthday, d: Date) => inYear(b, d.getFullYear()).getTime() === startOfDay(d).getTime()

/** Prochaine occurrence à partir d'aujourd'hui (incluse). */
export function nextBirthday(b: Birthday) {
  const today = startOfDay()
  const d = inYear(b, today.getFullYear())
  return d >= today ? d : inYear(b, today.getFullYear() + 1)
}

export default function Anniversaires() {
  const [list, setList] = useBirthdays()
  const [gifts] = useGifts()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [day, setDay] = useState(1)
  const [month, setMonth] = useState(1)
  const [year, setYear] = useState('')
  const [note, setNote] = useState('')

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const y = year ? Number(year) : undefined
    setList((l) => [...l, { id: uid(), name: name.trim(), day: Math.min(day, daysIn(month, 2024)), month, year: y, note: note.trim() }])
    setName(''); setYear(''); setNote(''); setAdding(false)
  }

  const sorted = list
    .map((b) => ({ b, next: nextBirthday(b) }))
    .sort((a, c) => a.next.getTime() - c.next.getTime())

  return (
    <div className="stack">
      {list.length === 0 && !adding && <p className="empty">Aucun anniversaire pour l’instant 🎈</p>}

      <ul className="stack">
        {sorted.map(({ b, next }) => {
          const left = daysBetween(new Date(), next)
          const ideas = gifts.filter((g) => g.forId === b.id && g.status !== 'offert').length
          const age = b.year ? next.getFullYear() - b.year : null
          return (
            <li key={b.id} className="panel chore">
              <span className="chore-icon">🎂</span>
              <div className="grow">
                <strong>{b.name}</strong>
                <div className="sub">
                  {b.day} {MONTHS[b.month - 1]}{age !== null && ` · ${age} ans`}{b.note && ` · ${b.note}`}
                </div>
                <span className="pill" data-hot={left <= 7}>{left === 0 ? "c'est aujourd'hui ! 🎉" : left === 1 ? 'demain' : `dans ${left} j`}</span>
                {ideas > 0 && <a className="pill link-pill" href="#/cadeaux"> 🎁 {ideas} idée{ideas > 1 ? 's' : ''}</a>}
              </div>
              <button className="icon-btn" onClick={() => confirm(`Supprimer ${b.name} ?`) && setList((l) => l.filter((x) => x.id !== b.id))} aria-label={`Supprimer ${b.name}`}>×</button>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <h3 className="panel-title">Nouvel anniversaire</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom" autoFocus />
          <div className="row">
            <label className="field">Jour
              <input type="number" min={1} max={daysIn(month, 2024)} value={day} onChange={(e) => setDay(Math.max(1, Number(e.target.value)))} style={{ width: 80 }} />
            </label>
            <label className="field">Mois
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </label>
            <label className="field">Année (facultatif)
              <input type="number" min={1900} max={new Date().getFullYear()} value={year} onChange={(e) => setYear(e.target.value)} placeholder="1990" style={{ width: 110 }} />
            </label>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (ex. belle-sœur, idée cadeau…) — facultatif" />
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Nouvel anniversaire</button>
      )}
    </div>
  )
}
