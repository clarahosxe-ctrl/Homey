import { useState } from 'react'
import { fmtShort, parse } from '../../lib/dates'
import { uid } from '../../lib/storage'
import { safeUrl, type SectionProps } from './shared'

const CATS = [
  { id: 'voir', icon: '👀', label: 'À voir' },
  { id: 'resto', icon: '🍽️', label: 'Resto' },
  { id: 'activite', icon: '🎟️', label: 'Activité' },
  { id: 'shopping', icon: '🛍️', label: 'Shopping' },
  { id: 'autre', icon: '✨', label: 'Autre' },
]
const cat = (id: string) => CATS.find((c) => c.id === id) ?? CATS[CATS.length - 1]

export default function Ideas({ trip, patch }: SectionProps) {
  const ideas = trip.ideas ?? []
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('voir')
  const [note, setNote] = useState('')
  const [link, setLink] = useState('')
  const [planning, setPlanning] = useState<string | null>(null)
  const [pdate, setPdate] = useState(trip.from)
  const [filter, setFilter] = useState('all')

  const upd = (id: string, p: Partial<(typeof ideas)[number]>) => patch((t) => ({ ...t, ideas: (t.ideas ?? []).map((i) => (i.id === id ? { ...i, ...p } : i)) }))
  const shown = ideas.filter((i) => filter === 'all' || i.category === filter).sort((a, b) => Number(a.done) - Number(b.done))

  const planIt = (id: string) => {
    const i = ideas.find((x) => x.id === id)
    if (!i) return
    patch((t) => ({
      ...t,
      plan: [...t.plan, { id: uid(), date: pdate, label: i.title, kind: i.category === 'resto' ? 'repas' : i.category === 'shopping' ? 'autre' : 'activite' }],
      ideas: (t.ideas ?? []).map((x) => (x.id === id ? { ...x, planned: true } : x)),
    }))
    setPlanning(null)
  }

  return (
    <div className="stack">
      {ideas.length > 0 && (
        <div className="chips" role="group" aria-label="Filtre">
          <button className={'chip' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>Tout</button>
          {CATS.map((c) => <button key={c.id} className={'chip' + (filter === c.id ? ' on' : '')} onClick={() => setFilter(c.id)}>{c.icon} {c.label}</button>)}
        </div>
      )}
      {ideas.length === 0 && <p className="empty">Lieux à voir, bonnes adresses… notez vos idées ici ✨</p>}

      {shown.length > 0 && (
        <section className="panel">
          <ul className="list">
            {shown.map((i) => {
              const url = safeUrl(i.link)
              return (
                <li key={i.id} className={'vrow' + (i.done ? ' done' : '')}>
                  <div className="row nowrap" style={{ alignItems: 'center' }}>
                    <label className="check grow">
                      <input type="checkbox" checked={i.done} onChange={() => upd(i.id, { done: !i.done })} /><span className="box" />
                      <span className="label">{cat(i.category).icon} {i.title}{i.note && <span className="sub"> · {i.note}</span>}</span>
                    </label>
                    {url && <a className="icon-btn" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir le lien de ${i.title}`}>🔗</a>}
                    {!i.planned && !i.done && <button className="btn small" onClick={() => { setPlanning(planning === i.id ? null : i.id); setPdate(trip.from) }}>📅</button>}
                    {i.planned && <span className="pill" data-hot="false">au programme</span>}
                    <button className="icon-btn" onClick={() => patch((t) => ({ ...t, ideas: (t.ideas ?? []).filter((x) => x.id !== i.id) }))} aria-label={`Supprimer ${i.title}`}>×</button>
                  </div>
                  {planning === i.id && (
                    <div className="row vform" style={{ margin: '8px 0 0 0' }}>
                      <input type="date" value={pdate} min={trip.from} max={trip.to} onChange={(e) => setPdate(e.target.value)} aria-label="Jour au programme" />
                      <button className="btn primary small" onClick={() => planIt(i.id)}>Ajouter au programme du {fmtShort(parse(pdate))}</button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <form className="panel stack" onSubmit={(e) => {
        e.preventDefault(); if (!title.trim()) return
        patch((t) => ({ ...t, ideas: [...(t.ideas ?? []), { id: uid(), title: title.trim(), category, note: note.trim(), link: link.trim(), done: false }] }))
        setTitle(''); setNote(''); setLink('')
      }}>
        <h3 className="panel-title">Nouvelle idée</h3>
        <div className="chips">{CATS.map((c) => <button type="button" key={c.id} className={'chip' + (category === c.id ? ' on' : '')} onClick={() => setCategory(c.id)}>{c.icon} {c.label}</button>)}</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Tour de Belém, pastéis de nata…" />
        <div className="row">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (adresse, horaires…)" className="grow" />
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Lien https://…" inputMode="url" className="grow" />
        </div>
        <button className="btn primary">Ajouter</button>
      </form>
    </div>
  )
}
