import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import type { Household } from '../lib/household'
import { uid, useStored } from '../lib/storage'
import type { CodeFormat, LoyaltyCard } from '../lib/types'

const COLORS = ['#c4593a', '#1f4a42', '#4f7cac', '#e0b73a', '#9a6fb0', '#6a7480']

export const useCards = () => useStored<LoyaltyCard[]>('loyalty', [])

function Code({ card }: { card: LoyaltyCard }) {
  const svg = useRef<SVGSVGElement>(null)
  const [qr, setQr] = useState('')
  useEffect(() => {
    if (card.format === 'QR') {
      QRCode.toDataURL(card.number, { margin: 1, width: 360 }).then(setQr, () => setQr(''))
      return
    }
    if (!svg.current) return
    try {
      JsBarcode(svg.current, card.number, { format: card.format, displayValue: false, margin: 0, height: 90, width: 2.4 })
    } catch {
      // ex. EAN13 invalide → on retombe sur CODE128
      try { JsBarcode(svg.current, card.number, { format: 'CODE128', displayValue: false, margin: 0, height: 90, width: 2.4 }) } catch { /* ignore */ }
    }
  }, [card])
  return card.format === 'QR' ? <img src={qr} alt="QR code" className="qr" /> : <svg ref={svg} className="barcode" />
}

export default function Fidelite({ household }: { household: Household }) {
  const [cards, setCards] = useCards()
  const { members, current } = household
  const [shown, setShown] = useState<LoyaltyCard | null>(null)
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const [d, setD] = useState({ name: '', number: '', format: 'CODE128' as CodeFormat, color: COLORS[0] })

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!d.name.trim() || !d.number.trim()) return
    setCards((cs) => [...cs, { id: uid(), name: d.name.trim(), number: d.number.trim(), format: d.format, color: d.color, owner: current.id }])
    setD({ ...d, name: '', number: '' }); setAdding(false)
  }
  const list = cards.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="stack">
      {cards.length > 3 && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une carte…" />}
      {cards.length === 0 && !adding && <p className="empty">Aucune carte. Ajoutez la première 💳</p>}

      <div className="wallet">
        {list.map((c) => {
          const o = members.find((m) => m.id === c.owner)
          return (
            <button key={c.id} className="loyalty" style={{ background: c.color }} onClick={() => setShown(c)}>
              <strong>{c.name}</strong>
              <span>{o ? o.name : 'Foyer'}</span>
            </button>
          )
        })}
      </div>

      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <h3 className="panel-title">Nouvelle carte</h3>
          <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Enseigne (Carrefour, Decathlon…)" autoFocus />
          <input value={d.number} onChange={(e) => setD({ ...d, number: e.target.value })} placeholder="Numéro de la carte" inputMode="numeric" />
          <div className="chips">
            {(['CODE128', 'EAN13', 'QR'] as CodeFormat[]).map((f) => (
              <button type="button" key={f} className={'chip' + (d.format === f ? ' on' : '')} onClick={() => setD({ ...d, format: f })}>
                {f === 'QR' ? 'QR code' : f === 'EAN13' ? 'EAN-13' : 'Code-barres'}
              </button>
            ))}
          </div>
          <div className="chips">
            {COLORS.map((c) => <button type="button" key={c} className={'swatch' + (d.color === c ? ' on' : '')} style={{ background: c }} onClick={() => setD({ ...d, color: c })} aria-label={c} />)}
          </div>
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Nouvelle carte</button>
      )}

      {shown && (
        <div className="overlay" onClick={() => setShown(null)} role="dialog" aria-label={shown.name}>
          <div className="ticket" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-head" style={{ background: shown.color }}>{shown.name}</div>
            <div className="ticket-body">
              <Code card={shown} />
              <div className="ticket-num">{shown.number}</div>
            </div>
            <div className="row between">
              <button className="btn ghost small" onClick={() => { setCards((cs) => cs.filter((c) => c.id !== shown.id)); setShown(null) }}>Supprimer</button>
              <button className="btn primary small" onClick={() => setShown(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
