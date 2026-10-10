import { useState } from 'react'
import { addDays, daysBetween, fmtShort, iso, parse } from '../lib/dates'
import type { TrackerRecord } from '../lib/types'

export const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
export const nf = (n: number, d = 0) => n.toLocaleString('fr-FR', { maximumFractionDigits: d })
export const when = (d: number) => (d < 0 ? `en retard de ${-d} j` : d === 0 ? "aujourd'hui" : d === 1 ? 'demain' : `dans ${d} j`)

/** Date courte ; l'année n'est précisée que si ce n'est pas l'année en cours. */
export const fmtY = (iso_: string) => {
  const d = parse(iso_)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', ...(d.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' as const } : {}) })
}

export const lastOf = (recs: TrackerRecord[], kind: string) => recs.filter((r) => r.kind === kind).sort((a, b) => b.date.localeCompare(a.date))[0]

export interface Saved { date: string; next: string; cost?: number; metric?: number; nextMetric?: number }

/** Ligne "case à cocher" : une action récurrente avec sa dernière date, son rappel et (option) son kilométrage. */
export function CheckRow({ label, hint, icon, every, everyKm, withKm, currentKm, last, quick, onSave, onClear }: {
  label: string; hint?: string; icon?: string; every: number; everyKm?: number; withKm?: boolean; currentKm?: number
  last?: TrackerRecord; quick?: boolean; onSave: (d: Saved) => void; onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(iso(new Date()))
  const [next, setNext] = useState('')
  const [cost, setCost] = useState('')
  const [km, setKm] = useState('')
  const [nextKm, setNextKm] = useState('')
  const days = last?.next ? daysBetween(new Date(), parse(last.next)) : null
  const kmLeft = last?.nextMetric !== undefined && currentKm !== undefined ? last.nextMetric - currentKm : null

  const edit = () => {
    setDate(iso(new Date())); setNext(iso(addDays(new Date(), every))); setCost('')
    setKm(currentKm !== undefined ? String(currentKm) : '')
    setNextKm(everyKm && currentKm !== undefined ? String(currentKm + everyKm) : '')
    setOpen(!open)
  }
  const onKm = (v: string) => { setKm(v); if (everyKm && v !== '' && Number.isFinite(Number(v))) setNextKm(String(Number(v) + everyKm)) }

  return (
    <li className="vrow">
      <div className="row nowrap" style={{ alignItems: 'center' }}>
        <button className={'tick' + (last ? ' on' : '')} onClick={edit} aria-label={`${label} : noter une date`} aria-pressed={!!last}>{last ? '✓' : ''}</button>
        <div className="grow">
          <strong>{icon && `${icon} `}{label}</strong>
          {hint && <div className="sub">{hint}</div>}
          <div className="sub">
            {last ? `Fait le ${fmtY(last.date)}${last.metric !== undefined ? ` à ${nf(last.metric)} km` : ''}` : 'Pas encore noté'}
            {last?.next && ` · rappel le ${fmtY(last.next)}`}
            {last?.nextMetric !== undefined && ` · ou à ${nf(last.nextMetric)} km`}
          </div>
        </div>
        {days !== null && <span className="pill" data-hot={days <= 14}>{when(days)}</span>}
        {kmLeft !== null && <span className="pill" data-hot={kmLeft <= 1500}>{kmLeft >= 0 ? `dans ${nf(kmLeft)} km` : `dépassé de ${nf(-kmLeft)} km`}</span>}
        {quick && <button className="btn small" onClick={() => onSave({ date: iso(new Date()), next: iso(addDays(new Date(), every)) })}>Fait ✓</button>}
        {last && <button className="icon-btn" onClick={() => confirm(`Retirer « ${label} » ?`) && onClear()} aria-label={`Retirer ${label}`}>×</button>}
      </div>
      {open && (
        <form className="stack vform" onSubmit={(e) => {
          e.preventDefault()
          onSave({ date, next, cost: cost ? Number(cost) : undefined, metric: km !== '' ? Number(km) : undefined, nextMetric: nextKm !== '' ? Number(nextKm) : undefined })
          setOpen(false)
        }}>
          <div className="row">
            <label className="field">Date<input type="date" value={date} onChange={(e) => { setDate(e.target.value); setNext(iso(addDays(parse(e.target.value), every))) }} /></label>
            <label className="field">Prochain rappel<input type="date" value={next} min={date} onChange={(e) => setNext(e.target.value)} /></label>
            <label className="field">Coût (€)<input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 90 }} /></label>
          </div>
          {withKm && (
            <div className="row">
              <label className="field">Kilométrage<input type="number" min={0} value={km} onChange={(e) => onKm(e.target.value)} style={{ width: 120 }} /></label>
              <label className="field">Prochain à (km)<input type="number" min={0} value={nextKm} onChange={(e) => setNextKm(e.target.value)} style={{ width: 120 }} /></label>
            </div>
          )}
          <div className="row">
            <button className="btn primary small">Enregistrer</button>
            <button type="button" className="btn ghost small" onClick={() => setOpen(false)}>Annuler</button>
          </div>
        </form>
      )}
    </li>
  )
}

/** Ajout d'un élément hors liste (champ libre). */
export function FreeForm({ placeholder, every, withKm, currentKm, onAdd }: {
  placeholder: string; every: number; withKm?: boolean; currentKm?: number; onAdd: (name: string, d: Saved) => void
}) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(iso(new Date()))
  const [next, setNext] = useState(iso(addDays(new Date(), every)))
  const [cost, setCost] = useState('')
  const [km, setKm] = useState(currentKm !== undefined ? String(currentKm) : '')
  return (
    <form className="stack vform" onSubmit={(e) => {
      e.preventDefault()
      if (!name.trim()) return
      onAdd(name.trim(), { date, next, cost: cost ? Number(cost) : undefined, metric: km !== '' ? Number(km) : undefined })
      setName(''); setCost('')
    }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder} />
      <div className="row">
        <label className="field">Date<input type="date" value={date} onChange={(e) => { setDate(e.target.value); setNext(iso(addDays(parse(e.target.value), every))) }} /></label>
        <label className="field">Rappel<input type="date" value={next} min={date} onChange={(e) => setNext(e.target.value)} /></label>
        <label className="field">Coût (€)<input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 90 }} /></label>
        {withKm && <label className="field">Kilométrage<input type="number" min={0} value={km} onChange={(e) => setKm(e.target.value)} style={{ width: 110 }} /></label>}
      </div>
      <button className="btn small">+ Ajouter</button>
    </form>
  )
}

export { fmtShort }
