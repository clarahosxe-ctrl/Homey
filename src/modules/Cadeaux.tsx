import { useState } from 'react'
import Avatar from '../components/Avatar'
import type { Household } from '../lib/household'
import { uid, useStored } from '../lib/storage'
import type { Gift, GiftStatus } from '../lib/types'
import { useBirthdays } from './Anniversaires'

export const useGifts = () => useStored<Gift[]>('gifts', [])

const OCCASIONS = ['Anniversaire', 'Noël', 'Naissance', 'Mariage', 'Remerciement', 'Autre']
const STATUS: Record<GiftStatus, { label: string; icon: string; next: GiftStatus }> = {
  idee: { label: 'Idée', icon: '💡', next: 'achete' },
  achete: { label: 'Acheté', icon: '🛍️', next: 'offert' },
  offert: { label: 'Offert', icon: '🎉', next: 'idee' },
}
const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : '')

export default function Cadeaux({ household }: { household: Household }) {
  const [gifts, setGifts] = useGifts()
  const [birthdays] = useBirthdays()
  const { members, current } = household
  const [filter, setFilter] = useState<GiftStatus | 'all'>('all')
  const [adding, setAdding] = useState(false)

  // Recipients proposés : autres membres du foyer + anniversaires connus + saisie libre.
  const people = [
    ...members.filter((m) => m.id !== current.id).map((m) => ({ id: m.id, name: m.name })),
    ...birthdays.map((b) => ({ id: b.id, name: b.name })),
  ]
  const [d, setD] = useState({ title: '', who: people[0]?.id ?? '__custom', custom: '', occasion: OCCASIONS[0], price: '', url: '', note: '' })

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const person = people.find((p) => p.id === d.who)
    const forName = person?.name ?? d.custom.trim()
    if (!d.title.trim() || !forName) return
    setGifts((gs) => [...gs, {
      id: uid(), title: d.title.trim(), forId: person?.id ?? '', forName, occasion: d.occasion, status: 'idee',
      price: d.price ? Number(d.price) : undefined, url: d.url.trim(), note: d.note.trim(), by: current.id,
    }])
    setD({ ...d, title: '', price: '', url: '', note: '' })
    setAdding(false)
  }
  const advance = (id: string) => setGifts((gs) => gs.map((g) => (g.id === id ? { ...g, status: STATUS[g.status].next } : g)))

  // Les cadeaux destinés à l'utilisateur lui-même restent cachés (surprise !).
  const visible = gifts.filter((g) => g.forId !== current.id && (filter === 'all' || g.status === filter))
  const byPerson = [...new Set(visible.map((g) => g.forName))].sort((a, b) => a.localeCompare(b, 'fr'))
  const spent = (list: Gift[]) => list.filter((g) => g.status !== 'idee').reduce((s, g) => s + (g.price ?? 0), 0)

  return (
    <div className="stack">
      <div className="chips" role="group" aria-label="Filtre">
        {(['all', 'idee', 'achete', 'offert'] as const).map((f) => (
          <button key={f} className={'chip' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Tous' : `${STATUS[f].icon} ${STATUS[f].label}s`}
          </button>
        ))}
      </div>

      {byPerson.length === 0 && !adding && <p className="empty">Pas encore d’idée cadeau 🎁</p>}

      {byPerson.map((name) => {
        const list = visible.filter((g) => g.forName === name)
        const total = spent(list)
        return (
          <section key={name} className="panel">
            <div className="row between">
              <h3 className="panel-title">{name}</h3>
              {total > 0 && <span className="sub">{euro(total)} dépensés</span>}
            </div>
            <ul className="list">
              {list.map((g) => {
                const by = members.find((m) => m.id === g.by)
                const url = safeUrl(g.url)
                return (
                  <li key={g.id} className="item">
                    <div className="grow">
                      <strong className={g.status === 'offert' ? 'struck' : ''}>{g.title}</strong>
                      <div className="sub">
                        {g.occasion}{g.price !== undefined && ` · ${euro(g.price)}`}{g.note && ` · ${g.note}`}
                        {url && <> · <a href={url} target="_blank" rel="noopener noreferrer">lien</a></>}
                      </div>
                    </div>
                    {by && <Avatar m={by} title={`Ajouté par ${by.name}`} />}
                    <button className="chip small-chip on" data-status={g.status} onClick={() => advance(g.id)} title="Changer le statut">
                      {STATUS[g.status].icon} {STATUS[g.status].label}
                    </button>
                    <button className="icon-btn" onClick={() => setGifts((gs) => gs.filter((x) => x.id !== g.id))} aria-label={`Supprimer ${g.title}`}>×</button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <h3 className="panel-title">Nouveau cadeau</h3>
          <input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="Idée de cadeau" autoFocus />
          <div className="row">
            <label className="field">Pour
              <select value={d.who} onChange={(e) => setD({ ...d, who: e.target.value })}>
                {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                <option value="__custom">✏️ Quelqu’un d’autre…</option>
              </select>
            </label>
            <label className="field">Occasion
              <select value={d.occasion} onChange={(e) => setD({ ...d, occasion: e.target.value })}>
                {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          </div>
          {!people.some((p) => p.id === d.who) && (
            <input value={d.custom} onChange={(e) => setD({ ...d, custom: e.target.value })} placeholder="Prénom" />
          )}
          <div className="row">
            <label className="field">Prix (€)
              <input type="number" min={0} step="0.01" value={d.price} onChange={(e) => setD({ ...d, price: e.target.value })} style={{ width: 110 }} />
            </label>
            <label className="field grow">Lien (facultatif)
              <input value={d.url} onChange={(e) => setD({ ...d, url: e.target.value })} placeholder="https://…" inputMode="url" />
            </label>
          </div>
          <input value={d.note} onChange={(e) => setD({ ...d, note: e.target.value })} placeholder="Note (taille, couleur…) — facultatif" />
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Nouveau cadeau</button>
      )}
      <p className="sub center">🤫 Les cadeaux qui vous sont destinés restent cachés.</p>
    </div>
  )
}
