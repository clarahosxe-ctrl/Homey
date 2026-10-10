import { useState } from 'react'
import { CheckRow, FreeForm, euro, lastOf, nf, when, type Saved } from '../components/CheckRow'
import { dueItems } from '../components/Tracker'
import type { Household } from '../lib/household'
import { daysBetween, fmtShort, iso, parse } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { TrackerRecord, Vehicle } from '../lib/types'
import { slug } from './animauxCatalog'
import { BRANDS, ENERGIES, VEXPENSES, VTYPES, canCharge, hasCT, isElectric, maintenanceItems, usesFuel, vtype } from './vehiculesCatalog'

const energyLabel = (e?: string) => ENERGIES.find((x) => x.id === e)?.label.replace(/^\S+\s/, '') ?? ''
const fullName = (v: Vehicle) => v.name
const makeModel = (v: Vehicle) => [v.brand, v.model].filter(Boolean).join(' ')

function kindLabel(kind: string, v: Vehicle, recs: TrackerRecord[]) {
  const [base, sub] = kind.split(':')
  if (kind === 'ct') return 'Contrôle technique'
  if (kind === 'assurance') return 'Échéance assurance'
  if (kind === 'pneus') return 'Contrôle des pneus'
  if (base === 'entretien') return maintenanceItems(v.kind, v.energy).find((i) => i.id === sub)?.label ?? lastOf(recs, kind)?.note ?? 'Entretien'
  return kind
}

export default function Vehicules({ household }: { household: Household }) {
  const [vehicles, setVehicles] = useStored<Vehicle[]>('vehicles', [])
  const [records, setRecords] = useStored<TrackerRecord[]>('vehicles-log', [])
  const { current } = household
  const [selId, setSelId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('voiture')

  const sel = vehicles.find((v) => v.id === selId)
  const patch = (id: string, p: Partial<Vehicle>) => setVehicles((vs) => vs.map((x) => (x.id === id ? { ...x, ...p } : x)))
  const addRec = (subject: string, r: Pick<TrackerRecord, 'kind' | 'date'> & Partial<TrackerRecord>) =>
    setRecords((rs) => [...rs, { id: uid(), subject, next: '', note: '', by: current.id, ...r }])

  if (sel) {
    return <Detail v={sel} recs={records.filter((r) => r.subject === sel.id)} patch={(p) => patch(sel.id, p)} addRec={(r) => addRec(sel.id, r)}
      setRecords={setRecords} onBack={() => setSelId(null)}
      onDelete={() => { setVehicles((vs) => vs.filter((x) => x.id !== sel.id)); setRecords((rs) => rs.filter((r) => r.subject !== sel.id)); setSelId(null) }} />
  }

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const id = uid()
    setVehicles((vs) => [...vs, { id, name: name.trim(), emoji: vtype(type)?.icon ?? '🚗', extra: '', kind: type }])
    setName(''); setAdding(false); setSelId(id)
  }

  return (
    <div className="stack">
      {vehicles.length === 0 && !adding && <p className="empty">Aucun véhicule. Ajoutez le premier 🚗</p>}
      <ul className="stack">
        {vehicles.map((v) => {
          const recs = records.filter((r) => r.subject === v.id)
          const dues = dueItems([v], recs, 60).slice(0, 3)
          const bits = [makeModel(v), v.year, energyLabel(v.energy), v.color, v.extra || v.vin].filter(Boolean)
          return (
            <li key={v.id}>
              <button className="panel trip" onClick={() => setSelId(v.id)}>
                <span className="chore-icon">{v.emoji}</span>
                <div className="grow" style={{ textAlign: 'left' }}>
                  <strong>{fullName(v)}</strong>
                  <div className="sub">{bits.join(' · ') || 'Fiche à compléter'}{v.km !== undefined && ` · ${nf(v.km)} km`}</div>
                  {dues.map((d) => <div key={d.kind} className="sub"><span className="pill" data-hot={d.days <= 7}>{when(d.days)}</span> {kindLabel(d.kind, v, recs)}</div>)}
                </div>
                <span className="sub">›</span>
              </button>
            </li>
          )
        })}
      </ul>
      {adding ? (
        <form className="panel stack" onSubmit={create}>
          <h3 className="panel-title">Nouveau véhicule</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom (ex. La Clio de Clara)" autoFocus />
          <div className="chips">
            {VTYPES.map((t) => <button type="button" key={t.id} className={'chip' + (type === t.id ? ' on' : '')} onClick={() => setType(t.id)}>{t.icon} {t.label}</button>)}
          </div>
          <div className="row">
            <button className="btn primary">Créer la fiche</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Ajouter un véhicule</button>
      )}
    </div>
  )
}

type AddRec = (r: Pick<TrackerRecord, 'kind' | 'date'> & Partial<TrackerRecord>) => void
type SetRecs = (u: (r: TrackerRecord[]) => TrackerRecord[]) => void

function Detail({ v, recs, patch, addRec, setRecords, onBack, onDelete }: {
  v: Vehicle; recs: TrackerRecord[]; patch: (p: Partial<Vehicle>) => void; addRec: AddRec; setRecords: SetRecs; onBack: () => void; onDelete: () => void
}) {
  const [tab, setTab] = useState<'entretien' | 'frais' | 'fiche'>('entretien')
  return (
    <div className="stack">
      <button className="link" onClick={onBack}>← Tous mes véhicules</button>
      <section className="panel row nowrap" style={{ alignItems: 'center' }}>
        <span className="chore-icon">{v.emoji}</span>
        <div className="grow">
          <h2 className="sheet-title">{fullName(v)}</h2>
          <div className="sub">{[makeModel(v), v.year, energyLabel(v.energy), v.color, v.extra].filter(Boolean).join(' · ')}{v.km !== undefined && ` · ${nf(v.km)} km`}</div>
        </div>
      </section>
      <div className="chips">
        {([['entretien', '🔧 Entretien'], ['frais', '💶 Frais & assurance'], ['fiche', '📋 Fiche']] as const).map(([k, l]) => (
          <button key={k} className={'chip' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'fiche' && <Fiche v={v} patch={patch} onDelete={onDelete} />}
      {tab === 'entretien' && <Entretien v={v} recs={recs} patch={patch} addRec={addRec} setRecords={setRecords} />}
      {tab === 'frais' && <Frais v={v} recs={recs} patch={patch} addRec={addRec} setRecords={setRecords} />}
    </div>
  )
}

/* ---------------- Fiche ---------------- */
function Fiche({ v, patch, onDelete }: { v: Vehicle; patch: (p: Partial<Vehicle>) => void; onDelete: () => void }) {
  const num = (s: string) => (s === '' ? undefined : Number(s))
  return (
    <div className="stack">
      <section className="panel stack">
        <h3 className="panel-title">Identité</h3>
        <input value={v.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Nom" aria-label="Nom" />
        <div className="chips" role="group" aria-label="Type">
          {VTYPES.map((t) => <button key={t.id} className={'chip' + (v.kind === t.id ? ' on' : '')} onClick={() => patch({ kind: t.id, emoji: t.icon })}>{t.icon} {t.label}</button>)}
        </div>
        <div className="row">
          <label className="field grow">Marque<input value={v.brand ?? ''} onChange={(e) => patch({ brand: e.target.value })} list="brands" /></label>
          <label className="field grow">Modèle<input value={v.model ?? ''} onChange={(e) => patch({ model: e.target.value })} /></label>
        </div>
        <datalist id="brands">{BRANDS.map((b) => <option key={b} value={b} />)}</datalist>
        <div className="row">
          <label className="field">Année<input type="number" min={1950} max={new Date().getFullYear() + 1} value={v.year ?? ''} onChange={(e) => patch({ year: num(e.target.value) })} style={{ width: 100 }} /></label>
          <label className="field grow">Couleur<input value={v.color ?? ''} onChange={(e) => patch({ color: e.target.value })} /></label>
        </div>
        <label className="field">Immatriculation<input value={v.extra} onChange={(e) => patch({ extra: e.target.value.toUpperCase() })} placeholder="AB-123-CD" /></label>
        <label className="field">N° de série (VIN) — facultatif<input value={v.vin ?? ''} onChange={(e) => patch({ vin: e.target.value.toUpperCase() })} /></label>
        <strong>Énergie</strong>
        <div className="chips" role="group" aria-label="Énergie">
          {ENERGIES.map((e) => <button key={e.id} className={'chip' + (v.energy === e.id ? ' on' : '')} onClick={() => patch({ energy: v.energy === e.id ? undefined : e.id })}>{e.label}</button>)}
        </div>
      </section>

      {canCharge(v.energy) && (
        <section className="panel stack">
          <h3 className="panel-title">⚡ Recharge</h3>
          <div className="row">
            <label className="field">Batterie (kWh)<input type="number" min={0} step="0.1" value={v.battery ?? ''} onChange={(e) => patch({ battery: num(e.target.value) })} style={{ width: 110 }} /></label>
            <label className="field">Autonomie (km)<input type="number" min={0} value={v.range ?? ''} onChange={(e) => patch({ range: num(e.target.value) })} style={{ width: 110 }} /></label>
            <label className="field">Tarif maison (€/kWh)<input type="number" min={0} step="0.001" value={v.homeRate ?? ''} onChange={(e) => patch({ homeRate: num(e.target.value) })} style={{ width: 120 }} /></label>
          </div>
          <p className="sub">Le tarif maison sert à calculer le coût d’une recharge à domicile quand vous ne saisissez que les kWh.</p>
        </section>
      )}

      <section className="panel stack">
        <h3 className="panel-title">Notes</h3>
        <textarea value={v.notes ?? ''} onChange={(e) => patch({ notes: e.target.value })} rows={4} placeholder="Pression des pneus, code radio, garage habituel…" />
      </section>
      <button className="btn ghost" onClick={() => confirm(`Supprimer ${fullName(v)} et tout son historique ?`) && onDelete()}>🗑️ Supprimer ce véhicule</button>
    </div>
  )
}

/* ---------------- Entretien ---------------- */
function Entretien({ v, recs, patch, addRec, setRecords }: { v: Vehicle; recs: TrackerRecord[]; patch: (p: Partial<Vehicle>) => void; addRec: AddRec; setRecords: SetRecs }) {
  const today = iso(new Date())
  const items = maintenanceItems(v.kind, v.energy)
  const clearKind = (kind: string) => setRecords((rs) => rs.filter((r) => !(r.subject === v.id && r.kind === kind)))
  const customKinds = [...new Set(recs.filter((r) => r.kind.startsWith('entretien:c-')).map((r) => r.kind))]
  const customLabel = (k: string) => lastOf(recs, k)?.note ?? k
  const [km, setKm] = useState(v.km !== undefined ? String(v.km) : '')
  const save = (kind: string, note = '') => (d: Saved) => {
    addRec({ kind, date: d.date, next: d.next, cost: d.cost, metric: d.metric, nextMetric: d.nextMetric, note: note || undefined })
    if (d.metric !== undefined && (v.km === undefined || d.metric > v.km)) { patch({ km: d.metric, kmDate: today }); setKm(String(d.metric)) }
  }

  return (
    <div className="stack">
      <section className="panel stack">
        <h3 className="panel-title">📍 Kilométrage actuel</h3>
        <form className="row" onSubmit={(e) => { e.preventDefault(); if (km !== '') patch({ km: Number(km), kmDate: today }) }}>
          <input type="number" min={0} value={km} onChange={(e) => setKm(e.target.value)} placeholder="km" style={{ width: 150 }} aria-label="Kilométrage actuel" />
          <button className="btn small">Mettre à jour</button>
          {v.kmDate && <span className="sub">relevé le {fmtShort(parse(v.kmDate))}</span>}
        </form>
      </section>

      {hasCT(v.kind) && (
        <section className="panel stack">
          <h3 className="panel-title">✅ Contrôle technique</h3>
          <ul className="list">
            <CheckRow label="Contrôle technique" hint="Tous les 2 ans (le 1er à 4 ans pour un véhicule neuf)" every={730} last={lastOf(recs, 'ct')} onSave={save('ct')} onClear={() => clearKind('ct')} />
          </ul>
        </section>
      )}

      <Pneus v={v} recs={recs} patch={patch} addRec={addRec} setRecords={setRecords} />

      <section className="panel stack">
        <h3 className="panel-title">🔧 Entretien</h3>
        <ul className="list">
          {items.map((i) => {
            const kind = `entretien:${i.id}`
            return <CheckRow key={kind} label={i.label} hint={i.hint} every={i.every} everyKm={i.everyKm} withKm currentKm={v.km} last={lastOf(recs, kind)} onSave={save(kind)} onClear={() => clearKind(kind)} />
          })}
          {customKinds.map((kind) => (
            <CheckRow key={kind} label={customLabel(kind)} every={365} withKm currentKm={v.km} last={lastOf(recs, kind)} onSave={save(kind, customLabel(kind))} onClear={() => clearKind(kind)} />
          ))}
        </ul>
        <strong className="sub">Autre entretien ou intervention</strong>
        <FreeForm placeholder="Ex. Changement d’essuie-glaces, amortisseurs…" every={365} withKm currentKm={v.km}
          onAdd={(name, d) => save(`entretien:c-${slug(name)}`, name)(d)} />
        <p className="sub">Liste indicative : suivez le carnet d’entretien de votre constructeur.</p>
      </section>
    </div>
  )
}

/* ---------------- Pneus ---------------- */
function Pneus({ v, recs, patch, addRec, setRecords }: { v: Vehicle; recs: TrackerRecord[]; patch: (p: Partial<Vehicle>) => void; addRec: AddRec; setRecords: SetRecs }) {
  const t = v.tires ?? {}
  const set = (p: Partial<NonNullable<Vehicle['tires']>>) => patch({ tires: { ...t, ...p } })
  const num = (s: string) => (s === '' ? undefined : Number(s))
  const check = lastOf(recs, 'pneus')
  const lifespan = t.lifespan ?? 40000
  const used = t.km !== undefined && v.km !== undefined ? Math.max(0, v.km - t.km) : null
  const pct = used !== null ? Math.min(100, (used / lifespan) * 100) : null
  const monthsOld = t.fitted ? Math.floor(daysBetween(parse(t.fitted), new Date()) / 30.4) : null
  const wear = t.depth === undefined ? null : t.depth <= 1.6 ? { l: '🔴 Sous la limite légale (1,6 mm) : à changer', hot: true } : t.depth <= 3 ? { l: '🟠 À surveiller : à changer bientôt', hot: true } : { l: '🟢 Bon état', hot: false }

  return (
    <section className="panel stack">
      <h3 className="panel-title">🛞 Pneus</h3>
      <div className="row">
        <label className="field">Montés le<input type="date" value={t.fitted ?? ''} onChange={(e) => set({ fitted: e.target.value })} /></label>
        <label className="field">Au km<input type="number" min={0} value={t.km ?? ''} onChange={(e) => set({ km: num(e.target.value) })} style={{ width: 110 }} /></label>
      </div>
      <div className="row">
        <label className="field grow">Marque<input value={t.brand ?? ''} onChange={(e) => set({ brand: e.target.value })} /></label>
        <label className="field">Dimension<input value={t.size ?? ''} onChange={(e) => set({ size: e.target.value })} placeholder="205/55 R16" style={{ width: 130 }} /></label>
      </div>
      <div className="row">
        <label className="field">Profondeur des sculptures (mm)<input type="number" min={0} step="0.1" value={t.depth ?? ''} onChange={(e) => set({ depth: num(e.target.value) })} style={{ width: 110 }} /></label>
        <label className="field">Durée de vie visée (km)<input type="number" min={5000} step="1000" value={t.lifespan ?? ''} placeholder="40000" onChange={(e) => set({ lifespan: num(e.target.value) })} style={{ width: 130 }} /></label>
      </div>
      {wear && <span className="pill" data-hot={wear.hot}>{wear.l}</span>}
      {pct !== null && used !== null && (
        <div className="stack" style={{ gap: 4 }}>
          <div className="bar"><span style={{ width: `${pct}%`, background: pct >= 90 ? '#c0392b' : pct >= 70 ? '#e0a030' : 'var(--accent)' }} /></div>
          <div className="sub">{nf(used)} km parcourus · {used >= lifespan ? `durée visée dépassée de ${nf(used - lifespan)} km` : `≈ ${nf(lifespan - used)} km restants`}{monthsOld !== null && ` · montés il y a ${monthsOld} mois`}</div>
        </div>
      )}
      {monthsOld !== null && monthsOld >= 72 && <p className="sub">⚠️ Des pneus de plus de 6 ans méritent un contrôle, même peu usés.</p>}
      <label className="field">Prochain contrôle / remplacement prévu
        <input type="date" value={check?.next ?? ''} onChange={(e) => {
          setRecords((rs) => rs.filter((r) => !(r.subject === v.id && r.kind === 'pneus')))
          if (e.target.value) addRec({ kind: 'pneus', date: iso(new Date()), next: e.target.value })
        }} />
      </label>
      {t.depth === undefined && <p className="sub">Astuce : une pièce de 1 € dans la rainure permet une première estimation, mais la mesure au garage reste la plus fiable.</p>}
    </section>
  )
}

/* ---------------- Frais & assurance ---------------- */
function Frais({ v, recs, patch, addRec, setRecords }: { v: Vehicle; recs: TrackerRecord[]; patch: (p: Partial<Vehicle>) => void; addRec: AddRec; setRecords: SetRecs }) {
  const year = String(new Date().getFullYear())
  const today = iso(new Date())
  const cats = VEXPENSES.filter((c) => (c.id === 'carburant' ? usesFuel(v.energy) : c.id === 'recharge' ? canCharge(v.energy) : true))
  const [cat, setCat] = useState(cats[0].id)
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState('')
  const [qty, setQty] = useState('')
  const [km, setKm] = useState('')
  const [place, setPlace] = useState('domicile')
  const [note, setNote] = useState('')
  const renewal = lastOf(recs, 'assurance')

  const catOf = (r: TrackerRecord) => {
    if (r.kind.startsWith('frais:')) return VEXPENSES.find((c) => c.id === r.kind.slice(6)) ?? VEXPENSES[VEXPENSES.length - 1]
    if (r.kind === 'carburant') return VEXPENSES[0]
    if (r.kind === 'reparation') return VEXPENSES[2]
    return { id: 'entretien', label: 'Entretien & contrôles', icon: '🔧' }
  }
  const costs = recs.filter((r) => r.cost !== undefined && r.date.startsWith(year))
  const byCat = new Map<string, { label: string; icon: string; total: number }>()
  for (const r of costs) { const c = catOf(r); byCat.set(c.id, { label: c.label, icon: c.icon, total: (byCat.get(c.id)?.total ?? 0) + (r.cost ?? 0) }) }
  const total = costs.reduce((t, r) => t + (r.cost ?? 0), 0)
  const insuranceYear = (v.insurancePrice ?? 0) * 12
  const top = Math.max(1, ...[...byCat.values()].map((c) => c.total))

  /** Consommation : somme des quantités (hors 1er plein) / distance entre le 1er et le dernier relevé. */
  const stats = (kind: string, unit: string) => {
    const rs = recs.filter((r) => r.kind === kind && r.qty !== undefined && r.metric !== undefined).sort((a, b) => (a.metric ?? 0) - (b.metric ?? 0))
    if (rs.length < 2) return null
    const dist = (rs[rs.length - 1].metric ?? 0) - (rs[0].metric ?? 0)
    if (dist <= 0) return null
    const qtySum = rs.slice(1).reduce((t, r) => t + (r.qty ?? 0), 0)
    const costSum = rs.slice(1).reduce((t, r) => t + (r.cost ?? 0), 0)
    return { conso: (qtySum / dist) * 100, cost100: (costSum / dist) * 100, unit }
  }
  const fuelStats = stats('frais:carburant', 'L'), chargeStats = stats('frais:recharge', 'kWh')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = qty ? Number(qty.replace(',', '.')) : undefined
    let n = amount ? Number(amount.replace(',', '.')) : NaN
    if (!(n > 0) && cat === 'recharge' && place === 'domicile' && q && v.homeRate) n = Math.round(q * v.homeRate * 100) / 100
    if (!(n > 0)) return
    const odo = km ? Number(km) : undefined
    addRec({ kind: `frais:${cat}`, date, cost: n, qty: q, metric: odo, detail: cat === 'recharge' ? place : undefined, note: note.trim() })
    if (odo !== undefined && (v.km === undefined || odo > v.km)) patch({ km: odo, kmDate: date })
    setAmount(''); setQty(''); setKm(''); setNote('')
  }
  const expenses = recs.filter((r) => r.kind.startsWith('frais:')).sort((a, b) => b.date.localeCompare(a.date))
  const energyCat = cat === 'carburant' || cat === 'recharge'
  const unit = cat === 'carburant' ? 'Litres' : 'kWh'

  return (
    <div className="stack">
      <section className="panel stack">
        <h3 className="panel-title">🛡️ Assurance</h3>
        <input value={v.insurer ?? ''} onChange={(e) => patch({ insurer: e.target.value })} placeholder="Assureur" aria-label="Assureur" />
        <div className="row">
          <label className="field grow">N° de contrat<input value={v.insuranceNo ?? ''} onChange={(e) => patch({ insuranceNo: e.target.value })} /></label>
          <label className="field">Prix (€/mois)<input type="number" min={0} step="0.01" value={v.insurancePrice ?? ''} onChange={(e) => patch({ insurancePrice: e.target.value ? Number(e.target.value) : undefined })} style={{ width: 110 }} /></label>
        </div>
        <label className="field">Formule<input value={v.insuranceFormula ?? ''} onChange={(e) => patch({ insuranceFormula: e.target.value })} placeholder="Tous risques, tiers, tiers+…" /></label>
        <label className="field">Prochaine échéance du contrat
          <input type="date" value={renewal?.next ?? ''} onChange={(e) => {
            setRecords((rs) => rs.filter((r) => !(r.subject === v.id && r.kind === 'assurance')))
            if (e.target.value) addRec({ kind: 'assurance', date: today, next: e.target.value })
          }} />
        </label>
        {insuranceYear > 0 && <p className="sub">≈ {euro(insuranceYear)} par an.</p>}
      </section>

      <section className="panel stack">
        <div className="row between" style={{ alignItems: 'baseline' }}>
          <h3 className="panel-title">Dépenses {year}</h3>
          <div style={{ textAlign: 'right' }}><div className="big-num">{euro(total)}</div>{insuranceYear > 0 && <div className="sub">+ assurance ≈ {euro(insuranceYear)}</div>}</div>
        </div>
        {[...byCat.entries()].sort((a, b) => b[1].total - a[1].total).map(([id, c]) => (
          <div key={id} className="stack" style={{ gap: 3 }}>
            <div className="row between"><span>{c.icon} {c.label}</span><strong>{euro(c.total)}</strong></div>
            <div className="bar thin"><span style={{ width: `${(c.total / top) * 100}%` }} /></div>
          </div>
        ))}
        {byCat.size === 0 && <p className="sub">Aucune dépense notée cette année.</p>}
        {fuelStats && <p className="sub">⛽ Consommation ≈ <strong>{nf(fuelStats.conso, 1)} L/100 km</strong> · ≈ {euro(fuelStats.cost100)} / 100 km</p>}
        {chargeStats && <p className="sub">⚡ Consommation ≈ <strong>{nf(chargeStats.conso, 1)} kWh/100 km</strong> · ≈ {euro(chargeStats.cost100)} / 100 km{isElectric(v.energy) && v.battery ? ` · autonomie réelle ≈ ${nf((v.battery / chargeStats.conso) * 100)} km` : ''}</p>}
        <p className="sub">Les coûts saisis sur l’entretien et les contrôles sont comptés dans « Entretien & contrôles ». Pour la consommation, notez le kilométrage à chaque plein ou recharge.</p>
      </section>

      <form className="panel stack" onSubmit={submit}>
        <h3 className="panel-title">Ajouter une dépense</h3>
        <div className="chips">
          {cats.map((c) => <button type="button" key={c.id} className={'chip' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)}>{c.icon} {c.label}</button>)}
        </div>
        <div className="row">
          <label className="field">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          {energyCat && <label className="field">{unit}<input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" style={{ width: 90 }} /></label>}
          <label className="field">Montant (€){cat === 'recharge' && place === 'domicile' && v.homeRate ? ' — auto' : ''}<input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" style={{ width: 110 }} /></label>
        </div>
        {cat === 'recharge' && (
          <div className="chips" role="group" aria-label="Lieu de recharge">
            {[['domicile', '🏠 À domicile'], ['publique', '🔌 Borne publique'], ['travail', '🏢 Au travail']].map(([k, l]) => <button type="button" key={k} className={'chip' + (place === k ? ' on' : '')} onClick={() => setPlace(k)}>{l}</button>)}
          </div>
        )}
        <div className="row">
          {energyCat && <label className="field">Kilométrage<input type="number" min={0} value={km} onChange={(e) => setKm(e.target.value)} style={{ width: 120 }} /></label>}
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note — facultatif" className="grow" aria-label="Note" />
        </div>
        <button className="btn primary">Ajouter</button>
      </form>

      {expenses.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">Dernières dépenses</h3>
          <ul className="list">
            {expenses.slice(0, 8).map((r) => {
              const c = catOf(r)
              return (
                <li key={r.id} className="item">
                  <span>{c.icon}</span>
                  <div className="grow">
                    <strong>{c.label}</strong>
                    <div className="sub">{fmtShort(parse(r.date))}{r.qty !== undefined && ` · ${nf(r.qty, 1)} ${r.kind === 'frais:recharge' ? 'kWh' : 'L'}`}{r.metric !== undefined && ` · ${nf(r.metric)} km`}{r.detail && r.kind === 'frais:recharge' && ` · ${r.detail}`}{r.note && ` · ${r.note}`}</div>
                  </div>
                  <strong>{euro(r.cost ?? 0)}</strong>
                  <button className="icon-btn" onClick={() => setRecords((rs) => rs.filter((x) => x.id !== r.id))} aria-label="Supprimer">×</button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
