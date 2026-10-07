import { useState } from 'react'
import { DAY_ORDER, DAY_SHORT, fmtLong, iso, daysBetween } from '../lib/dates'
import { nextPickup, recurrenceLabel } from '../lib/recurrence'
import { uid, useStored } from '../lib/storage'
import type { Bin } from '../lib/types'

const COLORS = ['#e0b73a', '#4f7cac', '#5c8a6f', '#8a6d4f', '#6a7480', '#9a6fb0']

const DEFAULT_BINS: Bin[] = [
  { id: 'b1', name: 'Ordures ménagères', color: '#6a7480', days: [2], everyWeeks: 1, anchor: iso(new Date()) },
  { id: 'b2', name: 'Tri sélectif', color: '#e0b73a', days: [5], everyWeeks: 2, anchor: iso(new Date()) },
]

export const useBins = () => useStored<Bin[]>('bins', DEFAULT_BINS)

const blank = (): Bin => ({ id: '', name: '', color: COLORS[0], days: [1], everyWeeks: 1, anchor: iso(new Date()) })

export default function Poubelles() {
  const [bins, setBins] = useBins()
  const [draft, setDraft] = useState<Bin | null>(null)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft || !draft.name.trim() || !draft.days.length) return
    setBins((bs) => (draft.id ? bs.map((b) => (b.id === draft.id ? draft : b)) : [...bs, { ...draft, id: uid() }]))
    setDraft(null)
  }
  const toggleDay = (d: number) =>
    setDraft((x) => x && { ...x, days: x.days.includes(d) ? x.days.filter((v) => v !== d) : [...x.days, d] })

  return (
    <div className="stack">
      <ul className="stack">
        {bins.map((b) => {
          const next = nextPickup(b)
          const delta = next ? daysBetween(new Date(), next) : null
          return (
            <li key={b.id} className="panel bin" style={{ borderLeftColor: b.color }}>
              <div className="grow">
                <strong>{b.name}</strong>
                <div className="sub">{recurrenceLabel(b)}</div>
                {next && (
                  <div className="sub">
                    Prochain : {fmtLong(next)}{' '}
                    <span className="pill" data-hot={delta !== null && delta <= 1}>
                      {delta === 0 ? "aujourd'hui" : delta === 1 ? 'demain' : `dans ${delta} j`}
                    </span>
                  </div>
                )}
              </div>
              <button className="btn ghost small" onClick={() => setDraft(b)}>Modifier</button>
              <button className="icon-btn" onClick={() => setBins((bs) => bs.filter((x) => x.id !== b.id))} aria-label="Supprimer">×</button>
            </li>
          )
        })}
      </ul>

      {!draft && (
        <button className="btn primary" onClick={() => setDraft(blank())}>+ Nouvelle poubelle</button>
      )}

      {draft && (
        <form className="panel stack" onSubmit={save}>
          <h3 className="panel-title">{draft.id ? 'Modifier' : 'Nouvelle poubelle'}</h3>
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Nom (ex. Verre, Encombrants…)" autoFocus />
          <div className="chips" role="group" aria-label="Couleur">
            {COLORS.map((c) => (
              <button type="button" key={c} className={'swatch' + (draft.color === c ? ' on' : '')} style={{ background: c }} onClick={() => setDraft({ ...draft, color: c })} aria-label={c} />
            ))}
          </div>
          <div className="chips" role="group" aria-label="Jours">
            {DAY_ORDER.map((d) => (
              <button type="button" key={d} className={'chip' + (draft.days.includes(d) ? ' on' : '')} onClick={() => toggleDay(d)}>
                {DAY_SHORT[d]}
              </button>
            ))}
          </div>
          <div className="row">
            <label className="field">
              Fréquence
              <select value={draft.everyWeeks} onChange={(e) => setDraft({ ...draft, everyWeeks: Number(e.target.value) })}>
                <option value={1}>Chaque semaine</option>
                <option value={2}>1 semaine sur 2</option>
                <option value={3}>1 semaine sur 3</option>
                <option value={4}>1 semaine sur 4</option>
              </select>
            </label>
            {draft.everyWeeks > 1 && (
              <label className="field">
                Une semaine de ramassage
                <input type="date" value={draft.anchor} onChange={(e) => setDraft({ ...draft, anchor: e.target.value })} />
              </label>
            )}
          </div>
          <div className="row">
            <button className="btn primary">Enregistrer</button>
            <button type="button" className="btn ghost" onClick={() => setDraft(null)}>Annuler</button>
          </div>
        </form>
      )}
    </div>
  )
}
