import { useState } from 'react'
import type { Household } from '../lib/household'

export default function Members({ household }: { household: Household }) {
  const { members, current, setCurrentId, add, rename, remove } = household
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  return (
    <div className="members">
      <div className="avatars">
        {members.map((m) => (
          <button
            key={m.id}
            className={'avatar' + (m.id === current.id ? ' on' : '')}
            style={{ background: m.color }}
            onClick={() => setCurrentId(m.id)}
            title={`Utiliser comme ${m.name}`}
            aria-pressed={m.id === current.id}
          >
            {m.name[0]}
          </button>
        ))}
        <button className="avatar ghost" onClick={() => setOpen(!open)} aria-label="Gérer le foyer">⚙</button>
      </div>
      {open && (
        <div className="popover panel stack">
          <strong>Mon foyer</strong>
          {members.map((m) => (
            <div key={m.id} className="row">
              <span className="dot-badge" style={{ background: m.color }}>{m.name[0]}</span>
              <input value={m.name} onChange={(e) => rename(m.id, e.target.value)} aria-label="Prénom" />
              {members.length > 1 && <button className="icon-btn" onClick={() => remove(m.id)} aria-label="Retirer">×</button>}
            </div>
          ))}
          <form className="row" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { add(name.trim()); setName('') } }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ajouter un membre…" />
            <button className="btn small primary">+</button>
          </form>
        </div>
      )}
    </div>
  )
}
