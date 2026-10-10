import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { PhotoThumb, usePhoto } from '../components/Photo'
import type { Household } from '../lib/household'
import { removePhoto } from '../lib/photos'
import { uid, useStored } from '../lib/storage'
import type { CodeFormat, LoyaltyCard } from '../lib/types'

const COLORS = ['#c4593a', '#1f4a42', '#4f7cac', '#e0b73a', '#9a6fb0', '#6a7480']

const FORMATS: { id: CodeFormat; label: string; hint: string }[] = [
  { id: 'CODE128', label: 'Code-barres', hint: 'Chiffres et lettres (le plus courant)' },
  { id: 'CODE39', label: 'Code 39', hint: 'Lettres MAJUSCULES, chiffres et - . $ / + %' },
  { id: 'EAN13', label: 'EAN-13', hint: '13 chiffres (produits, certaines cartes)' },
  { id: 'EAN8', label: 'EAN-8', hint: '8 chiffres' },
  { id: 'UPC', label: 'UPC', hint: '12 chiffres' },
  { id: 'QR', label: 'QR code', hint: 'Texte libre' },
  { id: 'NONE', label: 'Photo seulement', hint: 'Code non recréable : on garde la photo de la carte' },
]

export const useCards = () => useStored<LoyaltyCard[]>('loyalty', [])

/** Correspondance entre les formats détectés par le navigateur (BarcodeDetector) et les nôtres. */
const DETECTED: Record<string, CodeFormat> = { code_128: 'CODE128', code_39: 'CODE39', ean_13: 'EAN13', ean_8: 'EAN8', upc_a: 'UPC', qr_code: 'QR' }

/** Lit un code-barres sur une photo, si le navigateur le permet (Chrome / Android) ; sinon ne fait rien. */
async function detectCode(file: Blob): Promise<{ number: string; format: CodeFormat } | null> {
  try {
    const BD = (window as unknown as { BarcodeDetector?: new (o?: { formats: string[] }) => { detect: (i: ImageBitmap) => Promise<{ rawValue: string; format: string }[]> } }).BarcodeDetector
    if (!BD) return null
    const bmp = await createImageBitmap(file)
    const found = await new BD({ formats: Object.keys(DETECTED) }).detect(bmp)
    const hit = found.find((f) => f.rawValue)
    return hit ? { number: hit.rawValue, format: DETECTED[hit.format] ?? 'CODE128' } : null
  } catch {
    return null
  }
}

function Code({ card }: { card: LoyaltyCard }) {
  const svg = useRef<SVGSVGElement>(null)
  const [qr, setQr] = useState('')
  const [fell, setFell] = useState(false)
  useEffect(() => {
    setFell(false)
    if (card.format === 'QR') {
      QRCode.toDataURL(card.number, { margin: 1, width: 360 }).then(setQr, () => setQr(''))
      return
    }
    if (!svg.current) return
    const opts = { displayValue: false, margin: 0, height: 90, width: 2.4 }
    try { JsBarcode(svg.current, card.number, { format: card.format, ...opts }); return } catch { /* format incompatible avec ce numéro */ }
    try { JsBarcode(svg.current, card.number, { format: 'CODE128', ...opts }); setFell(true) } catch { /* caractères non pris en charge */ }
  }, [card])
  return (
    <>
      {card.format === 'QR' ? <img src={qr} alt="QR code" className="qr" /> : <svg ref={svg} className="barcode" />}
      {fell && <p className="sub">Ce numéro ne correspond pas au format {FORMATS.find((f) => f.id === card.format)?.label} : affiché en code-barres standard. Vérifiez qu’il est lisible en caisse, sinon ajoutez la photo de la carte.</p>}
    </>
  )
}

interface Draft { name: string; number: string; format: CodeFormat; color: string; photo?: string; photoBack?: string; note: string }

function CardForm({ initial, title, submit, onSubmit, onCancel }: { initial: Draft; title: string; submit: string; onSubmit: (d: Draft) => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(initial)
  const [detected, setDetected] = useState('')
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))

  const onFront = async (f: File) => {
    const found = await detectCode(f)
    if (found) { setD((x) => ({ ...x, number: x.number || found.number, format: x.number ? x.format : found.format })); setDetected(found.number) }
  }
  // Photos remplacées : on supprime l'ancienne à l'enregistrement, ou la nouvelle si on annule.
  const cleanup = (keep: 'old' | 'new') => {
    for (const k of ['photo', 'photoBack'] as const) {
      const drop = keep === 'new' ? initial[k] : d[k]
      if (initial[k] !== d[k] && drop) void removePhoto(drop)
    }
  }
  const ready = d.name.trim() && (d.format === 'NONE' ? d.photo : d.number.trim())

  return (
    <form className="panel stack" onSubmit={(e) => { e.preventDefault(); if (ready) { cleanup('new'); onSubmit({ ...d, name: d.name.trim(), number: d.number.trim(), note: d.note.trim() }) } }}>
      <h3 className="panel-title">{title}</h3>
      <input value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="Enseigne (Carrefour, Decathlon…)" autoFocus />

      <div className="stack">
        <strong className="sub">Photo de la carte (facultatif)</strong>
        <div className="row" style={{ alignItems: 'center' }}>
          <PhotoThumb id={d.photo} fallback="💳" size={72} keepOld onChange={(photo) => set({ photo })} onFile={onFront} label="Photo du recto" />
          <PhotoThumb id={d.photoBack} fallback="↩️" size={72} keepOld onChange={(photoBack) => set({ photoBack })} label="Photo du verso" />
          <span className="sub grow">Recto puis verso. Utile si le code ne peut pas être recréé.</span>
        </div>
        {detected && <p className="alert" data-hot="false">✅ Code lu sur la photo : <strong>{detected}</strong></p>}
      </div>

      <input value={d.number} onChange={(e) => set({ number: e.target.value })} placeholder={d.format === 'NONE' ? 'Numéro (facultatif, chiffres et lettres)' : 'Numéro de la carte (chiffres et lettres)'} autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false} aria-label="Numéro de la carte" />
      <div className="chips" role="group" aria-label="Type de code">
        {FORMATS.map((f) => <button type="button" key={f.id} className={'chip' + (d.format === f.id ? ' on' : '')} onClick={() => set({ format: f.id })}>{f.label}</button>)}
      </div>
      <p className="sub">{FORMATS.find((f) => f.id === d.format)?.hint}</p>
      <div className="chips">
        {COLORS.map((c) => <button type="button" key={c} className={'swatch' + (d.color === c ? ' on' : '')} style={{ background: c }} onClick={() => set({ color: c })} aria-label={c} />)}
      </div>
      <input value={d.note} onChange={(e) => set({ note: e.target.value })} placeholder="Note (code PIN, avantages…) — facultatif" />
      <div className="row">
        <button className="btn primary" disabled={!ready}>{submit}</button>
        <button type="button" className="btn ghost" onClick={() => { cleanup('old'); onCancel() }}>Annuler</button>
      </div>
    </form>
  )
}

function CardPhoto({ id }: { id?: string }) {
  const src = usePhoto(id, true)
  return src ? <img src={src} alt="Carte" className="cardphoto" /> : <p className="sub">Chargement de la photo…</p>
}

export default function Fidelite({ household }: { household: Household }) {
  const [cards, setCards] = useCards()
  const { members, current } = household
  const [shownId, setShownId] = useState<string | null>(null)
  const [view, setView] = useState<'code' | 'front' | 'back'>('code')
  const [q, setQ] = useState('')
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')

  const shown = cards.find((c) => c.id === shownId) ?? null
  const list = cards.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  const open = (c: LoyaltyCard) => { setShownId(c.id); setView(c.format === 'NONE' ? 'front' : 'code') }

  const blank: Draft = { name: '', number: '', format: 'CODE128', color: COLORS[0], note: '' }

  if (mode === 'add' || (mode === 'edit' && shown)) {
    const edit = mode === 'edit' && shown
    return (
      <div className="stack">
        <CardForm
          title={edit ? `Modifier ${shown.name}` : 'Nouvelle carte'}
          submit={edit ? 'Enregistrer' : 'Ajouter'}
          initial={edit ? { name: shown.name, number: shown.number, format: shown.format, color: shown.color, photo: shown.photo, photoBack: shown.photoBack, note: shown.note ?? '' } : blank}
          onCancel={() => setMode('list')}
          onSubmit={(d) => {
            if (edit) setCards((cs) => cs.map((c) => (c.id === shown.id ? { ...c, ...d } : c)))
            else setCards((cs) => [...cs, { id: uid(), owner: current.id, ...d }])
            setMode('list')
          }}
        />
      </div>
    )
  }

  return (
    <div className="stack">
      {cards.length > 3 && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une carte…" />}
      {cards.length === 0 && <p className="empty">Aucune carte. Ajoutez la première 💳</p>}

      <div className="wallet">
        {list.map((c) => {
          const o = members.find((m) => m.id === c.owner)
          return (
            <button key={c.id} className="loyalty" style={{ background: c.color }} onClick={() => open(c)}>
              <strong>{c.name}</strong>
              <span>{o ? o.name : 'Foyer'}{c.photo && ' · 📷'}</span>
            </button>
          )
        })}
      </div>

      <button className="btn primary" onClick={() => setMode('add')}>+ Nouvelle carte</button>

      {shown && (
        <div className="overlay" onClick={() => setShownId(null)} role="dialog" aria-label={shown.name}>
          <div className="ticket" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-head" style={{ background: shown.color }}>{shown.name}</div>
            {(shown.photo || shown.photoBack) && shown.format !== 'NONE' && (
              <div className="chips" style={{ padding: '0 16px' }} role="tablist">
                <button className={'chip small-chip' + (view === 'code' ? ' on' : '')} onClick={() => setView('code')}>Code</button>
                {shown.photo && <button className={'chip small-chip' + (view === 'front' ? ' on' : '')} onClick={() => setView('front')}>Recto</button>}
                {shown.photoBack && <button className={'chip small-chip' + (view === 'back' ? ' on' : '')} onClick={() => setView('back')}>Verso</button>}
              </div>
            )}
            <div className="ticket-body">
              {view === 'code' && shown.format !== 'NONE' && <><Code card={shown} /><div className="ticket-num">{shown.number}</div></>}
              {view === 'front' && (shown.photo ? <CardPhoto id={shown.photo} /> : <p className="sub">Pas de photo du recto.</p>)}
              {view === 'back' && (shown.photoBack ? <CardPhoto id={shown.photoBack} /> : <p className="sub">Pas de photo du verso.</p>)}
              {shown.format === 'NONE' && view === 'front' && shown.number && <div className="ticket-num">{shown.number}</div>}
              {shown.format === 'NONE' && !shown.photo && <p className="sub">Ajoutez une photo de la carte avec « Modifier ».</p>}
            </div>
            {shown.note && <p className="sub" style={{ padding: '0 20px', margin: 0 }}>{shown.note}</p>}
            <div className="row between">
              <button className="btn ghost small" onClick={() => confirm(`Supprimer la carte ${shown.name} ?`) && (shown.photo && void removePhoto(shown.photo), shown.photoBack && void removePhoto(shown.photoBack), setCards((cs) => cs.filter((c) => c.id !== shown.id)), setShownId(null))}>Supprimer</button>
              <div className="row">
                <button className="btn small" onClick={() => setMode('edit')}>✎ Modifier</button>
                <button className="btn primary small" onClick={() => setShownId(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
