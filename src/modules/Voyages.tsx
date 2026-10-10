import { useState } from 'react'
import { Album, PhotoMini, PhotoThumb } from '../components/Photo'
import type { Household } from '../lib/household'
import { daysBetween, fmtShort, iso, parse } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Trip } from '../lib/types'
import Bookings from './voyages/Bookings'
import Ideas from './voyages/Ideas'
import Overview from './voyages/Overview'
import Packing from './voyages/Packing'
import Plan from './voyages/Plan'
import { travelersOf, type SectionProps } from './voyages/shared'
import Todos from './voyages/Todos'
import TripBudget from './voyages/TripBudget'

function PhotosTab({ trip, patch }: SectionProps) {
  return <Album ids={trip.photos ?? []} onChange={(photos) => patch((t) => ({ ...t, photos }))} title="📸 Photos du voyage" />
}

export const useTrips = () => useStored<Trip[]>('trips', [])

const TABS = [
  { id: 'apercu', label: '🏠 Aperçu', C: Overview },
  { id: 'programme', label: '🗓️ Programme', C: Plan },
  { id: 'resa', label: '🎫 Réservations', C: Bookings },
  { id: 'budget', label: '💶 Budget', C: TripBudget },
  { id: 'valise', label: '🧳 Valise', C: Packing },
  { id: 'todo', label: '✅ À faire', C: Todos },
  { id: 'idees', label: '✨ Idées', C: Ideas },
  { id: 'photos', label: '📸 Photos', C: PhotosTab },
] as const

export default function Voyages({ household }: { household: Household }) {
  const [trips, setTrips] = useTrips()
  const { members } = household
  const [selId, setSelId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [d, setD] = useState({ name: '', destination: '', from: iso(new Date()), to: iso(new Date()) })

  const sel = trips.find((t) => t.id === selId)
  const patch = (id: string, fn: (t: Trip) => Trip) => setTrips((ts) => ts.map((t) => (t.id === id ? fn(t) : t)))

  if (sel) {
    return <TripView trip={sel} household={household} patch={(fn) => patch(sel.id, fn)} onBack={() => setSelId(null)}
      onDelete={() => { setTrips((ts) => ts.filter((t) => t.id !== sel.id)); setSelId(null) }} />
  }

  const today = iso(new Date())
  const sorted = [...trips].sort((a, b) => a.from.localeCompare(b.from))
  const upcoming = sorted.filter((t) => t.to >= today)
  const past = sorted.filter((t) => t.to < today).reverse()

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!d.name.trim()) return
    const id = uid()
    setTrips((ts) => [...ts, {
      id, name: d.name.trim(), destination: d.destination.trim(), from: d.from, to: d.to < d.from ? d.from : d.to, plan: [], packing: [],
      travelers: members.map((m) => ({ id: m.id, name: m.name, member: m.id, kind: 'adulte' as const })),
    }])
    setAdding(false); setD({ ...d, name: '', destination: '' }); setSelId(id)
  }

  const Card = ({ t, muted }: { t: Trip; muted?: boolean }) => {
    const left = daysBetween(new Date(), parse(t.from))
    const ongoing = t.from <= today && t.to >= today
    return (
      <li>
        <button className={'panel trip' + (muted ? ' muted' : '')} onClick={() => setSelId(t.id)}>
          <PhotoMini id={t.photo} fallback="✈️" size={52} />
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
          <input value={d.destination} onChange={(e) => setD({ ...d, destination: e.target.value })} placeholder="Destination (ville) — pour la météo" />
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

function TripView({ trip, household, patch, onBack, onDelete }: { trip: Trip; household: Household; patch: SectionProps['patch']; onBack: () => void; onDelete: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('apercu')
  const travelers = travelersOf(trip, household.members)
  const days = daysBetween(parse(trip.from), parse(trip.to)) + 1
  const left = daysBetween(new Date(), parse(trip.from))
  const Active = TABS.find((t) => t.id === tab)!.C

  return (
    <div className="stack">
      <button className="link" onClick={onBack}>← Tous les voyages</button>
      <section className="panel stack">
        <div className="row between nowrap">
          <PhotoThumb id={trip.photo} fallback="✈️" size={64} onChange={(photo) => patch((t) => ({ ...t, photo }))} label="Photo de couverture" />
          <div className="grow" style={{ minWidth: 0 }}>
            <input className="title-input" value={trip.name} onChange={(e) => patch((t) => ({ ...t, name: e.target.value }))} aria-label="Nom du voyage" />
            <div className="row" style={{ alignItems: 'center', marginTop: 6 }}>
              <input value={trip.destination} onChange={(e) => patch((t) => ({ ...t, destination: e.target.value, geo: undefined }))} placeholder="Destination" aria-label="Destination" className="grow" />
            </div>
          </div>
          <button className="icon-btn" onClick={() => confirm(`Supprimer « ${trip.name} » ?`) && onDelete()} aria-label="Supprimer le voyage">🗑️</button>
        </div>
        <div className="row" style={{ alignItems: 'center' }}>
          <label className="field">Départ<input type="date" value={trip.from} onChange={(e) => patch((t) => ({ ...t, from: e.target.value, to: t.to < e.target.value ? e.target.value : t.to }))} /></label>
          <label className="field">Retour<input type="date" value={trip.to} min={trip.from} onChange={(e) => patch((t) => ({ ...t, to: e.target.value }))} /></label>
          <span className="pill" data-hot={left >= 0 && left <= 7}>{left > 0 ? `J-${left}` : trip.to >= iso(new Date()) ? 'en cours' : 'terminé'} · {days} j</span>
        </div>
      </section>

      <div className="chips tabs" role="tablist">
        {TABS.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} className={'chip' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>
      <Active trip={trip} patch={patch} household={household} travelers={travelers} />
    </div>
  )
}
