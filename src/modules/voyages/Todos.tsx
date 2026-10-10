import { useState } from 'react'
import { addDays, daysBetween, fmtShort, iso, parse } from '../../lib/dates'
import { uid } from '../../lib/storage'
import { TODO_PRESETS } from './catalog'
import type { SectionProps } from './shared'

export default function Todos({ trip, patch }: SectionProps) {
  const todos = [...(trip.todos ?? [])].sort((a, b) => Number(a.done) - Number(b.done) || (a.due ?? '9').localeCompare(b.due ?? '9'))
  const [label, setLabel] = useState('')
  const [due, setDue] = useState('')
  const today = iso(new Date())
  const have = new Set(todos.map((t) => t.label))
  const dueFor = (before: number) => { const d = iso(addDays(parse(trip.from), -before)); return d < today ? today : d }

  const add = (l: string, d?: string) => patch((t) => ({ ...t, todos: [...(t.todos ?? []), { id: uid(), label: l, done: false, due: d || undefined }] }))
  const toggle = (id: string) => patch((t) => ({ ...t, todos: (t.todos ?? []).map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }))
  const done = todos.filter((t) => t.done).length

  return (
    <div className="stack">
      {todos.length > 0 && <section className="panel stack"><strong>{done}/{todos.length} fait{done > 1 ? 's' : ''}</strong><div className="bar"><span style={{ width: `${(done / todos.length) * 100}%` }} /></div></section>}
      {todos.length === 0 && <p className="empty">Rien à préparer pour l’instant. Ajoutez les suggestions ci-dessous ✅</p>}

      {todos.length > 0 && (
        <section className="panel">
          <ul className="list">
            {todos.map((x) => {
              const left = x.due ? daysBetween(new Date(), parse(x.due)) : null
              return (
                <li key={x.id} className={'item' + (x.done ? ' done' : '')}>
                  <label className="check"><input type="checkbox" checked={x.done} onChange={() => toggle(x.id)} /><span className="box" /><span className="label">{x.label}</span></label>
                  {!x.done && left !== null && <span className="pill" data-hot={left <= 3}>{left < 0 ? `en retard (${fmtShort(parse(x.due!))})` : left === 0 ? "aujourd'hui" : `avant le ${fmtShort(parse(x.due!))}`}</span>}
                  <button className="icon-btn" onClick={() => patch((t) => ({ ...t, todos: (t.todos ?? []).filter((y) => y.id !== x.id) }))} aria-label={`Supprimer ${x.label}`}>×</button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="panel stack">
        <h3 className="panel-title">Suggestions</h3>
        <div className="chips">
          {TODO_PRESETS.filter((p) => !have.has(p.label)).map((p) => <button key={p.label} className="chip" onClick={() => add(p.label, dueFor(p.before))}>+ {p.label}</button>)}
        </div>
        {TODO_PRESETS.every((p) => have.has(p.label)) && <p className="sub">Toutes les suggestions sont ajoutées.</p>}
        <form className="row add-form" onSubmit={(e) => { e.preventDefault(); if (label.trim()) { add(label.trim(), due); setLabel(''); setDue('') } }}>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Autre chose à faire avant le départ…" />
          <input type="date" value={due} max={trip.from} onChange={(e) => setDue(e.target.value)} aria-label="À faire avant le" />
          <button className="btn small">Ajouter</button>
        </form>
        <p className="sub">Les échéances sont calculées par rapport à la date de départ ({fmtShort(parse(trip.from))}).</p>
      </section>
    </div>
  )
}
