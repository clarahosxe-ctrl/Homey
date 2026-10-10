import { useState } from 'react'
import Avatar from '../components/Avatar'
import type { Household } from '../lib/household'
import { uid, useStored } from '../lib/storage'
import type { Wish } from '../lib/types'

export const useWishes = () => useStored<Wish[]>('wishes', [])

const CATS = [
  { id: 'resto', icon: '🍽️', label: 'Resto' },
  { id: 'film', icon: '🎬', label: 'Film / série' },
  { id: 'sortie', icon: '🎭', label: 'Sortie' },
  { id: 'escapade', icon: '🧳', label: 'Escapade' },
  { id: 'achat', icon: '🛍️', label: 'Achat' },
  { id: 'autre', icon: '✨', label: 'Autre' },
]
const cat = (id: string) => CATS.find((c) => c.id === id) ?? CATS[CATS.length - 1]

export default function Envies({ household }: { household: Household }) {
  const [wishes, setWishes] = useWishes()
  const { members, current } = household
  const [filter, setFilter] = useState('all')
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('resto')
  const [note, setNote] = useState('')

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setWishes((ws) => [...ws, { id: uid(), title: title.trim(), category, done: false, likes: [current.id], note: note.trim(), by: current.id }])
    setTitle(''); setNote(''); setAdding(false)
  }
  const like = (id: string) => setWishes((ws) => ws.map((w) => (w.id === id ? { ...w, likes: w.likes.includes(current.id) ? w.likes.filter((x) => x !== current.id) : [...w.likes, current.id] } : w)))
  const toggle = (id: string) => setWishes((ws) => ws.map((w) => (w.id === id ? { ...w, done: !w.done } : w)))

  const shown = wishes.filter((w) => filter === 'all' || w.category === filter)
    .sort((a, b) => Number(a.done) - Number(b.done) || b.likes.length - a.likes.length)

  return (
    <div className="stack">
      <div className="chips" role="group" aria-label="Filtre">
        <button className={'chip' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>Tout</button>
        {CATS.map((c) => <button key={c.id} className={'chip' + (filter === c.id ? ' on' : '')} onClick={() => setFilter(c.id)}>{c.icon} {c.label}</button>)}
      </div>

      {shown.length === 0 && !adding && <p className="empty">Rien sur la liste. De quoi avez-vous envie ? ✨</p>}

      {shown.length > 0 && (
        <section className="panel">
          <ul className="list">
            {shown.map((w) => {
              const by = members.find((m) => m.id === w.by)
              const liked = w.likes.includes(current.id)
              return (
                <li key={w.id} className={'item' + (w.done ? ' done' : '')}>
                  <label className="check">
                    <input type="checkbox" checked={w.done} onChange={() => toggle(w.id)} />
                    <span className="box" />
                    <span className="label">
                      {cat(w.category).icon} {w.title}
                      {w.note && <span className="sub"> · {w.note}</span>}
                    </span>
                  </label>
                  {by && <Avatar m={by} title={`Proposé par ${by.name}`} />}
                  <button className={'like' + (liked ? ' on' : '')} onClick={() => like(w.id)} aria-pressed={liked} aria-label="J’ai envie aussi">
                    ❤️ {w.likes.length}
                  </button>
                  <button className="icon-btn" onClick={() => setWishes((ws) => ws.filter((x) => x.id !== w.id))} aria-label={`Supprimer ${w.title}`}>×</button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <h3 className="panel-title">Nouvelle envie</h3>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Le nouveau resto italien, Dune 3…" autoFocus />
          <div className="chips">
            {CATS.map((c) => <button type="button" key={c.id} className={'chip' + (category === c.id ? ' on' : '')} onClick={() => setCategory(c.id)}>{c.icon} {c.label}</button>)}
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (adresse, plateforme…) — facultatif" />
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Nouvelle envie</button>
      )}
      <p className="sub center">❤️ Touchez le cœur pour dire « moi aussi » : les envies les plus partagées montent en haut.</p>
    </div>
  )
}
