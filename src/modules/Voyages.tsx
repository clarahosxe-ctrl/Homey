import { useState } from 'react'
import { daysBetween, fmtShort, iso, parse } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Trip, TripItem } from '../lib/types'

export const useTrips = () => useStored<Trip[]>('trips', [])

const KINDS = [
  { id: 'transport', icon: '🚆', label: 'Transport' },
  { id: 'hebergement', icon: '🏨', label: 'Hébergement' },
  { id: 'activite', icon: '🎟️', label: 'Activité' },
  { id: 'repas', icon: '🍽️', label: 'Repas' },
  { id: 'autre', icon: '📌', label: 'Autre' },
]
const kindIcon = (id: string) => KINDS.find((k) => k.id === id)?.icon ?? '📌'
const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const STARTER = ['Pièces d’identité / passeport', 'Billets et réservations', 'Carte bancaire', 'Chargeurs et batteries', 'Trousse de toilette', 'Médicaments', 'Vêtements (selon la météo)', 'Sous-vêtements et chaussettes', 'Lunettes de soleil', 'Adaptateur de prise', 'Pochette de documents', 'Bouteille d’eau']

export default function Voyages() {
  const [trips, setTrips] = useTrips()
  const [selId, setSelId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [d, setD] = useState({ name: '', destination: '', from: iso(new Date()), to: iso(new Date()) })

  const sel = trips.find((t) => t.id === selId)
  const patch = (id: string, fn: (t: Trip) => Trip) => setTrips((ts) => ts.map((t) => (t.id === id ? fn(t) : t)))

  if (sel) return <TripView trip={sel} onBack={() => setSelId(null)} patch={(fn) => patch(sel.id, fn)} onDelete={() => { setTrips((ts) => ts.filter((t) => t.id !== sel.id)); setSelId(null) }} />

  const today = iso(new Date())
  const sorted = [...trips].sort((a, b) => a.from.localeCompare(b.from))
  const upcoming = sorted.filter((t) => t.to >= today)
  const past = sorted.filter((t) => t.to < today).reverse()

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!d.name.trim()) return
    const id = uid()
    setTrips((ts) => [...ts, { id, name: d.name.trim(), destination: d.destination.trim(), from: d.from, to: d.to < d.from ? d.from : d.to, plan: [], packing: [] }])
    setAdding(false); setD({ ...d, name: '', destination: '' }); setSelId(id)
  }

  const Card = ({ t, muted }: { t: Trip; muted?: boolean }) => {
    const left = daysBetween(new Date(), parse(t.from))
    const ongoing = t.from <= today && t.to >= today
    return (
      <li>
        <button className={'panel trip' + (muted ? ' muted' : '')} onClick={() => setSelId(t.id)}>
          <span className="chore-icon">✈️</span>
          <div className="grow" style={{ textAlign: 'left' }}>
            <strong>{t.name}</strong>
            <div className="sub">{t.destination && `${t.destination} · `}{fmtShort(parse(t.from))} → {fmtShort(parse(t.to))}</div>
            {!muted && <span className="pill" data-hot={ongoing || left <= 7}>{ongoing ? 'en cours !' : left === 1 ? 'demain' : `dans ${left} j`}</span>}
          </div>
          <span className="sub">›</span>
        </button>
      </li>
    )
  }

  return (
    <div className="stack">
      {trips.length === 0 && !adding && <p className="empty">Aucun voyage prévu. Où partez-vous ? 🌍</p>}
      <ul className="stack">{upcoming.map((t) => <Card key={t.id} t={t} />)}</ul>
      {past.length > 0 && <><h3 className="section-title soon-title">Passés</h3><ul className="stack">{past.map((t) => <Card key={t.id} t={t} muted />)}</ul></>}
      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <h3 className="panel-title">Nouveau voyage</h3>
          <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Nom (ex. Week-end à Lisbonne)" autoFocus />
          <input value={d.destination} onChange={(e) => setD({ ...d, destination: e.target.value })} placeholder="Destination — facultatif" />
          <div className="row">
            <label className="field">Départ<input type="date" value={d.from} onChange={(e) => setD({ ...d, from: e.target.value, to: d.to < e.target.value ? e.target.value : d.to })} /></label>
            <label className="field">Retour<input type="date" value={d.to} min={d.from} onChange={(e) => setD({ ...d, to: e.target.value })} /></label>
          </div>
          <div className="row">
            <button className="btn primary">Créer</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Nouveau voyage</button>
      )}
    </div>
  )
}

function TripView({ trip, onBack, patch, onDelete }: { trip: Trip; onBack: () => void; patch: (fn: (t: Trip) => Trip) => void; onDelete: () => void }) {
  const [tab, setTab] = useState<'plan' | 'valise'>('plan')
  const [label, setLabel] = useState('')
  const [kind, setKind] = useState('activite')
  const [date, setDate] = useState(trip.from)
  const [cost, setCost] = useState('')
  const [item, setItem] = useState('')

  const planned = trip.plan.reduce((s, p) => s + (p.cost ?? 0), 0)
  const days = daysBetween(parse(trip.from), parse(trip.to)) + 1
  const byDate = [...new Set(trip.plan.map((p) => p.date))].sort()
  const done = trip.packing.filter((p) => p.done).length

  const addPlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    const it: TripItem = { id: uid(), date, label: label.trim(), kind, cost: cost ? Number(cost) : undefined }
    patch((t) => ({ ...t, plan: [...t.plan, it] }))
    setLabel(''); setCost('')
  }
  const addPack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item.trim()) return
    patch((t) => ({ ...t, packing: [...t.packing, { id: uid(), label: item.trim(), done: false }] }))
    setItem('')
  }

  return (
    <div className="stack">
      <button className="link" onClick={onBack}>← Tous les voyages</button>
      <section className="panel stack">
        <div className="row between">
          <div>
            <h2 className="sheet-title">{trip.name}</h2>
            <div className="sub">{trip.destination && `${trip.destination} · `}{fmtShort(parse(trip.from))} → {fmtShort(parse(trip.to))} · {days} jour{days > 1 ? 's' : ''}</div>
          </div>
          <button className="icon-btn" onClick={() => confirm(`Supprimer « ${trip.name} » ?`) && onDelete()} aria-label="Supprimer le voyage">🗑️</button>
        </div>
        <div className="row" style={{ alignItems: 'center' }}>
          <div className="grow"><div className="sub">Coût prévu</div><div className="big-num">{euro(planned)}</div></div>
          <label className="field">Budget (€)
            <input type="number" min={0} value={trip.budget ?? ''} onChange={(e) => patch((t) => ({ ...t, budget: e.target.value ? Number(e.target.value) : undefined }))} style={{ width: 110 }} />
          </label>
        </div>
        {trip.budget ? (
          <>
            <div className="bar"><span style={{ width: `${Math.min(100, (planned / trip.budget) * 100)}%`, background: planned > trip.budget ? '#c0392b' : 'var(--accent)' }} /></div>
            <div className="sub">{planned > trip.budget ? `Dépassement de ${euro(planned - trip.budget)}` : `Reste ${euro(trip.budget - planned)}`}</div>
          </>
        ) : null}
      </section>

      <div className="chips">
        <button className={'chip' + (tab === 'plan' ? ' on' : '')} onClick={() => setTab('plan')}>Programme ({trip.plan.length})</button>
        <button className={'chip' + (tab === 'valise' ? ' on' : '')} onClick={() => setTab('valise')}>Valise ({done}/{trip.packing.length})</button>
      </div>

      {tab === 'plan' && (
        <>
          {byDate.map((day) => (
            <section key={day} className="panel">
              <h3 className="panel-title" style={{ textTransform: 'capitalize' }}>{parse(day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <ul className="list">
                {trip.plan.filter((p) => p.date === day).map((p) => (
                  <li key={p.id} className="item">
                    <span>{kindIcon(p.kind)}</span>
                    <div className="grow"><strong>{p.label}</strong>{p.cost !== undefined && <div className="sub">{euro(p.cost)}</div>}</div>
                    <button className="icon-btn" onClick={() => patch((t) => ({ ...t, plan: t.plan.filter((x) => x.id !== p.id) }))} aria-label={`Supprimer ${p.label}`}>×</button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <form className="panel stack" onSubmit={addPlan}>
            <h3 className="panel-title">Ajouter au programme</h3>
            <div className="chips">
              {KINDS.map((k) => <button type="button" key={k.id} className={'chip' + (kind === k.id ? ' on' : '')} onClick={() => setKind(k.id)}>{k.icon} {k.label}</button>)}
            </div>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. Vol Paris → Lisbonne 8h30" />
            <div className="row">
              <label className="field">Date<input type="date" value={date} min={trip.from} max={trip.to} onChange={(e) => setDate(e.target.value)} /></label>
              <label className="field">Coût (€)<input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 110 }} /></label>
            </div>
            <button className="btn primary">Ajouter</button>
          </form>
        </>
      )}

      {tab === 'valise' && (
        <section className="panel stack">
          {trip.packing.length > 0 && <div className="bar"><span style={{ width: `${(done / trip.packing.length) * 100}%` }} /></div>}
          <ul className="list">
            {trip.packing.map((p) => (
              <li key={p.id} className={'item' + (p.done ? ' done' : '')}>
                <label className="check">
                  <input type="checkbox" checked={p.done} onChange={() => patch((t) => ({ ...t, packing: t.packing.map((x) => (x.id === p.id ? { ...x, done: !x.done } : x)) }))} />
                  <span className="box" /><span className="label">{p.label}</span>
                </label>
                <button className="icon-btn" onClick={() => patch((t) => ({ ...t, packing: t.packing.filter((x) => x.id !== p.id) }))} aria-label={`Supprimer ${p.label}`}>×</button>
              </li>
            ))}
          </ul>
          <form className="row add-form" onSubmit={addPack}>
            <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Ajouter à la valise…" />
            <button className="btn primary">Ajouter</button>
          </form>
          {trip.packing.length === 0 && (
            <button className="btn small" onClick={() => patch((t) => ({ ...t, packing: STARTER.map((label) => ({ id: uid(), label, done: false })) }))}>🧳 Ajouter une valise type</button>
          )}
        </section>
      )}
    </div>
  )
}
