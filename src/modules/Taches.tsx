import { useState } from 'react'
import type { Household } from '../lib/household'
import { addDays, daysBetween, fmtShort, iso, parse, startOfDay } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Chore, Member } from '../lib/types'

const PRESETS: [string, string, number][] = [
  ['🧹', 'Passer l’aspirateur', 7],
  ['🚿', 'Salle de bain', 7],
  ['🍳', 'Nettoyer la cuisine', 7],
  ['🛏️', 'Changer les draps', 14],
  ['🪟', 'Vitres', 30],
  ['🧊', 'Nettoyer le frigo', 30],
  ['🧺', 'Lessive', 3],
  ['🚽', 'Toilettes', 7],
]

export const useChores = () => useStored<Chore[]>('chores', [])

/** À qui le tour ? */
export function turnOf(c: Chore, members: Member[]) {
  if (!c.rotate) return members.find((m) => m.id === c.assignee)
  const i = members.findIndex((m) => m.id === c.lastBy)
  return members[(i + 1) % members.length]
}

export const dueDate = (c: Chore) => (c.lastDone ? addDays(parse(c.lastDone), c.everyDays) : startOfDay())
/** Jours avant l'échéance (négatif = en retard). */
export const daysLeft = (c: Chore) => daysBetween(new Date(), dueDate(c))

export default function Taches({ household }: { household: Household }) {
  const [chores, setChores] = useChores()
  const { members, current } = household
  const [adding, setAdding] = useState(false)
  const [preset, setPreset] = useState(0)
  const [name, setName] = useState('')
  const [every, setEvery] = useState(7)
  const [rotate, setRotate] = useState(true)

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const p = PRESETS[preset]
    const label = name.trim() || p[1]
    setChores((cs) => [...cs, { id: uid(), name: label, icon: name.trim() ? '✨' : p[0], everyDays: every, rotate, assignee: current.id, lastDone: '', lastBy: current.id, history: [] }])
    setName(''); setAdding(false)
  }
  const done = (id: string) =>
    setChores((cs) => cs.map((c) => c.id === id
      ? { ...c, lastDone: iso(new Date()), lastBy: current.id, history: [...c.history, { by: current.id, date: iso(new Date()) }].slice(-60) }
      : c))

  const sorted = [...chores].sort((a, b) => daysLeft(a) - daysLeft(b))
  const month = iso(new Date()).slice(0, 7)
  const score = (id: string) => chores.flatMap((c) => c.history).filter((h) => h.by === id && h.date.startsWith(month)).length

  return (
    <div className="stack">
      {chores.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">Ce mois-ci</h3>
          <div className="stats">
            {members.map((m) => (
              <div key={m.id} className="stat" style={{ borderTopColor: m.color }}>
                <strong>{m.name}</strong>
                <span>✅ {score(m.id)} tâche{score(m.id) > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {chores.length === 0 && !adding && <p className="empty">Aucune tâche. Ajoutez-en une pour commencer 🧼</p>}

      <ul className="stack">
        {sorted.map((c) => {
          const left = daysLeft(c)
          const who = turnOf(c, members)
          return (
            <li key={c.id} className="panel chore">
              <span className="chore-icon">{c.icon}</span>
              <div className="grow">
                <strong>{c.name}</strong>
                <div className="sub">
                  {c.lastDone ? `Fait le ${fmtShort(parse(c.lastDone))}` : 'Jamais fait'} · tous les {c.everyDays} j
                </div>
                <span className="pill" data-hot={left <= 0}>
                  {left < 0 ? `en retard de ${-left} j` : left === 0 ? "aujourd'hui" : `dans ${left} j`}
                </span>
                {who && <span className="sub"> · à {who.name}</span>}
              </div>
              <button className="btn primary small" onClick={() => done(c.id)}>Fait ✓</button>
              <button className="icon-btn" onClick={() => setChores((cs) => cs.filter((x) => x.id !== c.id))} aria-label="Supprimer">×</button>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <h3 className="panel-title">Nouvelle tâche</h3>
          <select value={preset} onChange={(e) => { const i = Number(e.target.value); setPreset(i); setEvery(PRESETS[i][2]) }}>
            {PRESETS.map((p, i) => <option key={p[1]} value={i}>{p[0]} {p[1]}</option>)}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="…ou nom personnalisé" />
          <div className="row">
            <label className="field">Tous les (jours)
              <input type="number" min={1} max={365} value={every} onChange={(e) => setEvery(Math.max(1, Number(e.target.value)))} />
            </label>
            <label className="check inline">
              <input type="checkbox" checked={rotate} onChange={(e) => setRotate(e.target.checked)} />
              <span className="box" /> <span>À tour de rôle</span>
            </label>
          </div>
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Nouvelle tâche</button>
      )}
    </div>
  )
}
