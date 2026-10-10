import { useState } from 'react'
import { daysBetween, fmtShort, iso, parse } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Meter, Reading } from '../lib/types'

export const useMeters = () => useStored<Meter[]>('meters', [])
export const useReadings = () => useStored<Reading[]>('readings', [])

const PRESETS = [
  { name: 'Électricité', emoji: '⚡', unit: 'kWh' },
  { name: 'Gaz', emoji: '🔥', unit: 'kWh' },
  { name: 'Eau', emoji: '💧', unit: 'm³' },
]
const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const num = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })

/** Compteurs dont le dernier relevé date de plus de 30 jours (ou jamais relevés). */
export function metersToRead(meters: Meter[], readings: Reading[]) {
  return meters.filter((m) => {
    const last = readings.filter((r) => r.meter === m.id).sort((a, b) => b.date.localeCompare(a.date))[0]
    return !last || daysBetween(parse(last.date), new Date()) > 30
  }).length
}

export default function Energie() {
  const [meters, setMeters] = useMeters()
  const [readings, setReadings] = useReadings()
  const [adding, setAdding] = useState(false)
  const [logFor, setLogFor] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('kWh')
  const [emoji, setEmoji] = useState('⚡')
  const [date, setDate] = useState(iso(new Date()))
  const [index, setIndex] = useState('')
  const [cost, setCost] = useState('')

  const addMeter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setMeters((ms) => [...ms, { id: uid(), name: name.trim(), emoji, unit: unit.trim() || 'kWh' }])
    setName(''); setAdding(false)
  }
  const addReading = (e: React.FormEvent) => {
    e.preventDefault()
    const i = Number(index.replace(',', '.'))
    if (!logFor || !Number.isFinite(i) || index === '') return
    setReadings((rs) => [...rs, { id: uid(), meter: logFor, date, index: i, cost: cost ? Number(cost) : undefined }])
    setLogFor(null); setIndex(''); setCost('')
  }

  return (
    <div className="stack">
      {meters.length === 0 && !adding && <p className="empty">Ajoutez vos compteurs (électricité, gaz, eau) ⚡</p>}

      {meters.map((m) => {
        const rs = readings.filter((r) => r.meter === m.id).sort((a, b) => a.date.localeCompare(b.date) || a.index - b.index)
        const last = rs[rs.length - 1]
        const prev = rs[rs.length - 2]
        const days = last && prev ? Math.max(1, daysBetween(parse(prev.date), parse(last.date))) : 0
        const conso = last && prev ? last.index - prev.index : 0
        const sinceLast = last ? daysBetween(parse(last.date), new Date()) : null
        const year = String(new Date().getFullYear())
        const spent = rs.filter((r) => r.date.startsWith(year)).reduce((t, r) => t + (r.cost ?? 0), 0)
        return (
          <section key={m.id} className="panel stack">
            <div className="row between nowrap">
              <div className="row nowrap" style={{ alignItems: 'center', minWidth: 0 }}>
                <span className="chore-icon">{m.emoji}</span>
                <div>
                  <strong>{m.name}</strong>
                  <div className="sub">{last ? `Index ${num(last.index)} ${m.unit} · ${fmtShort(parse(last.date))}` : 'Aucun relevé'}{spent > 0 && ` · ${euro(spent)} en ${year}`}</div>
                </div>
              </div>
              <button className="icon-btn" onClick={() => confirm(`Supprimer ${m.name} et ses relevés ?`) && (setMeters((ms) => ms.filter((x) => x.id !== m.id)), setReadings((r) => r.filter((x) => x.meter !== m.id)))} aria-label={`Supprimer ${m.name}`}>×</button>
            </div>

            {last && prev && (
              <div className="stats">
                <div className="stat" style={{ borderTopColor: 'var(--accent)' }}><strong>{num(conso)} {m.unit}</strong><span>depuis le {fmtShort(parse(prev.date))}</span></div>
                <div className="stat" style={{ borderTopColor: 'var(--accent)' }}><strong>{num(conso / days)} {m.unit}/j</strong><span>soit ≈ {num((conso / days) * 30)} {m.unit}/mois</span></div>
              </div>
            )}
            {(sinceLast === null || sinceLast > 30) && <span className="pill" data-hot="true">relevé à faire</span>}

            {logFor === m.id ? (
              <form className="stack" onSubmit={addReading}>
                <div className="row">
                  <label className="field">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
                  <label className="field">Index ({m.unit})<input value={index} onChange={(e) => setIndex(e.target.value)} inputMode="decimal" style={{ width: 130 }} autoFocus /></label>
                  <label className="field">Facture (€)<input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 110 }} /></label>
                </div>
                <div className="row">
                  <button className="btn primary small">Enregistrer</button>
                  <button type="button" className="btn ghost small" onClick={() => setLogFor(null)}>Annuler</button>
                </div>
              </form>
            ) : (
              <button className="btn small" onClick={() => { setLogFor(m.id); setDate(iso(new Date())) }}>+ Ajouter un relevé</button>
            )}

            {rs.length > 0 && (
              <ul className="list">
                {[...rs].reverse().slice(0, 4).map((r) => {
                  const before = rs[rs.indexOf(r) - 1]
                  return (
                    <li key={r.id} className="item">
                      <div className="grow">
                        <strong>{num(r.index)} {m.unit}</strong>
                        <div className="sub">{fmtShort(parse(r.date))}{before && ` · +${num(r.index - before.index)} ${m.unit}`}{r.cost !== undefined && ` · ${euro(r.cost)}`}</div>
                      </div>
                      <button className="icon-btn" onClick={() => setReadings((x) => x.filter((y) => y.id !== r.id))} aria-label="Supprimer">×</button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}

      {adding ? (
        <form className="panel stack" onSubmit={addMeter}>
          <h3 className="panel-title">Nouveau compteur</h3>
          <div className="chips">
            {PRESETS.map((p) => <button type="button" key={p.name} className={'chip' + (name === p.name ? ' on' : '')} onClick={() => { setName(p.name); setUnit(p.unit); setEmoji(p.emoji) }}>{p.emoji} {p.name}</button>)}
          </div>
          <div className="row">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" className="grow" />
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unité" style={{ width: 90 }} />
          </div>
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Ajouter un compteur</button>
      )}
    </div>
  )
}
