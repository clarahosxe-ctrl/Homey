import { useState } from 'react'
import { daysBetween, fmtShort, parse } from '../../lib/dates'
import { uid } from '../../lib/storage'
import type { TripItem } from '../../lib/types'
import { CATEGORIES, bookingKind, bookingsOn, category, euro, type SectionProps } from './shared'

const KIND_ICON = (k: string) => category(k).icon

export default function Plan({ trip, patch, travelers }: SectionProps) {
  const [stopName, setStopName] = useState('')
  const [stopFrom, setStopFrom] = useState(trip.from)
  const [stopTo, setStopTo] = useState(trip.to)
  const [label, setLabel] = useState('')
  const [kind, setKind] = useState('activite')
  const [date, setDate] = useState(trip.from)
  const [cost, setCost] = useState('')

  const stops = [...(trip.stops ?? [])].sort((a, b) => a.from.localeCompare(b.from))
  const days = [...new Set([...trip.plan.map((p) => p.date), ...(trip.bookings ?? []).map((b) => b.date)])].sort()
  const stopOn = (d: string) => stops.find((s) => s.from <= d && d <= s.to)?.name

  const addPlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    const it: TripItem = { id: uid(), date, label: label.trim(), kind, cost: cost ? Number(cost) : undefined }
    patch((t) => ({ ...t, plan: [...t.plan, it] })); setLabel(''); setCost('')
  }

  return (
    <div className="stack">
      <section className="panel stack">
        <h3 className="panel-title">📍 Étapes du voyage</h3>
        {stops.length === 0 && <p className="sub">Un seul lieu ? Inutile d’ajouter des étapes. Pour un itinéraire (Lisbonne → Porto → Algarve), ajoutez chaque étape avec ses dates.</p>}
        <ul className="list">
          {stops.map((s, i) => (
            <li key={s.id} className="item">
              <span className="dot-badge" style={{ background: 'var(--accent)', width: 26, height: 26 }}>{i + 1}</span>
              <div className="grow"><strong>{s.name}</strong><div className="sub">{fmtShort(parse(s.from))} → {fmtShort(parse(s.to))} · {Math.max(1, daysBetween(parse(s.from), parse(s.to)))} nuit{daysBetween(parse(s.from), parse(s.to)) > 1 ? 's' : ''}</div></div>
              <button className="icon-btn" onClick={() => patch((t) => ({ ...t, stops: (t.stops ?? []).filter((x) => x.id !== s.id) }))} aria-label={`Supprimer ${s.name}`}>×</button>
            </li>
          ))}
        </ul>
        <form className="stack vform" style={{ marginLeft: 0 }} onSubmit={(e) => {
          e.preventDefault(); if (!stopName.trim()) return
          patch((t) => ({ ...t, stops: [...(t.stops ?? []), { id: uid(), name: stopName.trim(), from: stopFrom, to: stopTo < stopFrom ? stopFrom : stopTo }] })); setStopName('')
        }}>
          <input value={stopName} onChange={(e) => setStopName(e.target.value)} placeholder="Nom de l’étape (ville, région…)" />
          <div className="row">
            <label className="field">Arrivée<input type="date" value={stopFrom} min={trip.from} max={trip.to} onChange={(e) => setStopFrom(e.target.value)} /></label>
            <label className="field">Départ<input type="date" value={stopTo} min={stopFrom} max={trip.to} onChange={(e) => setStopTo(e.target.value)} /></label>
          </div>
          <button className="btn small">+ Ajouter l’étape</button>
        </form>
      </section>

      {days.map((day) => (
        <section key={day} className="panel">
          <h3 className="panel-title" style={{ textTransform: 'capitalize' }}>
            {parse(day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {stopOn(day) && <span className="pill" style={{ marginLeft: 8, textTransform: 'none' }}>📍 {stopOn(day)}</span>}
          </h3>
          <ul className="list">
            {bookingsOn(trip, day).map((b) => (
              <li key={b.id} className="item">
                <span>{bookingKind(b.kind).icon}</span>
                <div className="grow"><strong>{b.title}</strong><div className="sub">Réservation{b.time && ` · ${b.time}`}{b.ref && ` · réf. ${b.ref}`}</div></div>
              </li>
            ))}
            {trip.plan.filter((p) => p.date === day).map((p) => (
              <li key={p.id} className="item">
                <span>{KIND_ICON(p.kind)}</span>
                <div className="grow"><strong>{p.label}</strong>{p.cost !== undefined && <div className="sub">{euro(p.cost)}{p.paid ? ' · payé ✓' : ''}</div>}</div>
                {p.cost !== undefined && (
                  <button className={'chip small-chip' + (p.paid ? ' on' : '')} onClick={() => patch((t) => ({ ...t, plan: t.plan.map((x) => (x.id === p.id ? { ...x, paid: !x.paid } : x)) }))} aria-pressed={!!p.paid}>{p.paid ? 'Payé' : 'À payer'}</button>
                )}
                {p.cost !== undefined && p.paid && travelers.length > 1 && (
                  <select value={p.payer ?? ''} onChange={(e) => patch((t) => ({ ...t, plan: t.plan.map((x) => (x.id === p.id ? { ...x, payer: e.target.value || undefined } : x)) }))} aria-label="Payé par">
                    <option value="">Par…</option>{travelers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
                <button className="icon-btn" onClick={() => patch((t) => ({ ...t, plan: t.plan.filter((x) => x.id !== p.id) }))} aria-label={`Supprimer ${p.label}`}>×</button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <form className="panel stack" onSubmit={addPlan}>
        <h3 className="panel-title">Ajouter au programme</h3>
        <div className="chips">
          {CATEGORIES.filter((c) => c.id !== 'shopping').map((c) => <button type="button" key={c.id} className={'chip' + (kind === c.id ? ' on' : '')} onClick={() => setKind(c.id)}>{c.icon} {c.label}</button>)}
        </div>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. Visite du château, dîner chez Rui…" />
        <div className="row">
          <label className="field">Date<input type="date" value={date} min={trip.from} max={trip.to} onChange={(e) => setDate(e.target.value)} /></label>
          <label className="field">Coût (€)<input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 110 }} /></label>
        </div>
        <button className="btn primary">Ajouter</button>
      </form>
    </div>
  )
}
