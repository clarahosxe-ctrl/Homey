import { useState } from 'react'
import Avatar from '../components/Avatar'
import type { Household } from '../lib/household'
import { uid, useStored } from '../lib/storage'
import type { ShoppingItem } from '../lib/types'

const CATEGORIES = ['🥬 Frais', '🥫 Épicerie', '🧴 Maison', '🧊 Surgelés', '📦 Autre']

export function useShopping() {
  return useStored<ShoppingItem[]>('shopping', [])
}

export default function Courses({ household }: { household: Household }) {
  const [items, setItems] = useShopping()
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const { members, current } = household

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const l = label.trim()
    if (!l) return
    setItems((it) => [...it, { id: uid(), label: l, done: false, by: current.id, category }])
    setLabel('')
  }
  const toggle = (id: string) => setItems((it) => it.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  const remove = (id: string) => setItems((it) => it.filter((i) => i.id !== id))
  const clearDone = () => setItems((it) => it.filter((i) => !i.done))

  const todo = items.filter((i) => !i.done)
  const done = items.filter((i) => i.done)

  return (
    <div className="stack">
      <form className="row add-form" onSubmit={add}>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ajouter un article…" aria-label="Article" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Rayon">
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className="btn primary">Ajouter</button>
      </form>

      {items.length === 0 && <p className="empty">Rien à acheter pour l’instant 🎉</p>}

      {CATEGORIES.map((cat) => {
        const list = todo.filter((i) => i.category === cat)
        if (!list.length) return null
        return (
          <section key={cat} className="panel">
            <h3 className="panel-title">{cat}</h3>
            <ul className="list">
              {list.map((i) => (
                <ItemRow key={i.id} item={i} members={members} onToggle={toggle} onRemove={remove} />
              ))}
            </ul>
          </section>
        )
      })}

      {done.length > 0 && (
        <section className="panel muted">
          <div className="row between">
            <h3 className="panel-title">Dans le panier ({done.length})</h3>
            <button className="btn ghost small" onClick={clearDone}>Vider</button>
          </div>
          <ul className="list">
            {done.map((i) => (
              <ItemRow key={i.id} item={i} members={members} onToggle={toggle} onRemove={remove} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function ItemRow({
  item,
  members,
  onToggle,
  onRemove,
}: {
  item: ShoppingItem
  members: Household['members']
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  const who = members.find((m) => m.id === item.by)
  return (
    <li className={'item' + (item.done ? ' done' : '')}>
      <label className="check">
        <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
        <span className="box" />
        <span className="label">{item.label}</span>
      </label>
      {who && (
        <Avatar m={who} title={`Ajouté par ${who.name}`} />
      )}
      <button className="icon-btn" onClick={() => onRemove(item.id)} aria-label={`Supprimer ${item.label}`}>×</button>
    </li>
  )
}
