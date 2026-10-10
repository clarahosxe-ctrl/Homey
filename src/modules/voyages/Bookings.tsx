import { useState } from 'react'
import { fmtShort, parse } from '../../lib/dates'
import { uid } from '../../lib/storage'
import type { Booking } from '../../lib/types'
import { BOOKING_KINDS, bookingKind, euro, safeUrl, type SectionProps } from './shared'

export default function Bookings({ trip, patch, travelers }: SectionProps) {
  const [adding, setAdding] = useState(false)
  const [d, setD] = useState({ kind: 'vol', title: '', ref: '', date: trip.from, time: '', endDate: '', link: '', cost: '', paid: false, payer: '', note: '' })
  const list = [...(trip.bookings ?? [])].sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
  const set = (p: Partial<typeof d>) => setD((x) => ({ ...x, ...p }))
  const update = (id: string, p: Partial<Booking>) => patch((t) => ({ ...t, bookings: (t.bookings ?? []).map((b) => (b.id === id ? { ...b, ...p } : b)) }))
  const [copied, setCopied] = useState('')

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!d.title.trim()) return
    const b: Booking = { id: uid(), kind: d.kind, title: d.title.trim(), ref: d.ref.trim(), date: d.date, time: d.time || undefined, endDate: d.endDate || undefined, link: d.link.trim(), cost: d.cost ? Number(d.cost) : undefined, paid: d.paid, payer: d.payer || undefined, note: d.note.trim() }
    patch((t) => ({ ...t, bookings: [...(t.bookings ?? []), b] }))
    setD({ ...d, title: '', ref: '', time: '', endDate: '', link: '', cost: '', paid: false, note: '' }); setAdding(false)
  }
  const copy = async (ref: string) => { try { await navigator.clipboard.writeText(ref); setCopied(ref); setTimeout(() => setCopied(''), 1500) } catch { /* ignore */ } }

  return (
    <div className="stack">
      {list.length === 0 && !adding && <p className="empty">Aucune réservation. Notez ici vols, trains, hôtels et n° de dossier 🎫</p>}
      <ul className="stack">
        {list.map((b) => {
          const k = bookingKind(b.kind)
          const url = safeUrl(b.link)
          return (
            <li key={b.id} className="panel stack" style={{ gap: 8 }}>
              <div className="row nowrap" style={{ alignItems: 'center' }}>
                <span className="chore-icon">{k.icon}</span>
                <div className="grow">
                  <strong>{b.title}</strong>
                  <div className="sub">{fmtShort(parse(b.date))}{b.time && ` à ${b.time}`}{b.endDate && ` → ${fmtShort(parse(b.endDate))}`}</div>
                </div>
                <button className="icon-btn" onClick={() => confirm(`Supprimer « ${b.title} » ?`) && patch((t) => ({ ...t, bookings: (t.bookings ?? []).filter((x) => x.id !== b.id) }))} aria-label={`Supprimer ${b.title}`}>×</button>
              </div>
              {b.ref && <button className="refcode" onClick={() => copy(b.ref)} title="Copier le numéro">🔖 {b.ref} <span className="sub">{copied === b.ref ? 'copié ✓' : 'copier'}</span></button>}
              <div className="row" style={{ alignItems: 'center' }}>
                {b.cost !== undefined && <strong>{euro(b.cost)}</strong>}
                {b.cost !== undefined && <button className={'chip small-chip' + (b.paid ? ' on' : '')} onClick={() => update(b.id, { paid: !b.paid })} aria-pressed={b.paid}>{b.paid ? 'Payé ✓' : 'À payer'}</button>}
                {b.cost !== undefined && b.paid && travelers.length > 1 && (
                  <select value={b.payer ?? ''} onChange={(e) => update(b.id, { payer: e.target.value || undefined })} aria-label="Payé par">
                    <option value="">Payé par…</option>{travelers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
                {url && <a className="btn small" href={url} target="_blank" rel="noopener noreferrer">🔗 Ouvrir</a>}
              </div>
              {b.note && <div className="sub">{b.note}</div>}
            </li>
          )
        })}
      </ul>

      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <h3 className="panel-title">Nouvelle réservation</h3>
          <div className="chips">{BOOKING_KINDS.map((k) => <button type="button" key={k.id} className={'chip' + (d.kind === k.id ? ' on' : '')} onClick={() => set({ kind: k.id })}>{k.icon} {k.label}</button>)}</div>
          <input value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="Ex. Vol Paris → Lisbonne, Hôtel Avenida…" autoFocus />
          <input value={d.ref} onChange={(e) => set({ ref: e.target.value })} placeholder="N° de réservation / dossier" />
          <div className="row">
            <label className="field">{d.kind === 'hebergement' ? 'Arrivée' : 'Date'}<input type="date" value={d.date} min={trip.from} max={trip.to} onChange={(e) => set({ date: e.target.value })} /></label>
            <label className="field">Heure<input type="time" value={d.time} onChange={(e) => set({ time: e.target.value })} /></label>
            {(d.kind === 'hebergement' || d.kind === 'location') && <label className="field">{d.kind === 'hebergement' ? 'Départ' : 'Retour'}<input type="date" value={d.endDate} min={d.date} max={trip.to} onChange={(e) => set({ endDate: e.target.value })} /></label>}
          </div>
          <input value={d.link} onChange={(e) => set({ link: e.target.value })} placeholder="Lien (https://…) — facultatif" inputMode="url" />
          <div className="row">
            <label className="field">Coût (€)<input type="number" min={0} step="0.01" value={d.cost} onChange={(e) => set({ cost: e.target.value })} style={{ width: 110 }} /></label>
            <label className="check inline"><input type="checkbox" checked={d.paid} onChange={(e) => set({ paid: e.target.checked })} /><span className="box" /> <span>Déjà payé</span></label>
            {d.paid && travelers.length > 1 && (
              <select value={d.payer} onChange={(e) => set({ payer: e.target.value })} aria-label="Payé par"><option value="">Payé par…</option>{travelers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            )}
          </div>
          <input value={d.note} onChange={(e) => set({ note: e.target.value })} placeholder="Note (terminal, code porte, annulation gratuite jusqu’au…)" />
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Nouvelle réservation</button>
      )}
    </div>
  )
}
