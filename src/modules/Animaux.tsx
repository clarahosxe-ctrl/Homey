import { useState } from 'react'
import { dueItems } from '../components/Tracker'
import type { Household } from '../lib/household'
import { addDays, daysBetween, fmtShort, iso, parse } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Pet, TrackerRecord } from '../lib/types'
import { BREEDS, EXPENSES, SOINS, SOINS_DEFAULT, SPECIES, VACCINES, slug, speciesOf, type Item } from './animauxCatalog'

const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const when = (d: number) => (d < 0 ? `en retard de ${-d} j` : d === 0 ? "aujourd'hui" : d === 1 ? 'demain' : `dans ${d} j`)

function ageOf(birth?: string) {
  if (!birth) return ''
  const b = parse(birth), t = new Date()
  let m = (t.getFullYear() - b.getFullYear()) * 12 + t.getMonth() - b.getMonth()
  if (t.getDate() < b.getDate()) m--
  if (m < 0) return ''
  if (m < 24) return `${m} mois`
  return `${Math.floor(m / 12)} an${m >= 24 ? 's' : ''}`
}

/** Date courte ; l'année n'est précisée que si ce n'est pas l'année en cours. */
const fmtY = (iso_: string) => {
  const d = parse(iso_)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', ...(d.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' as const } : {}) })
}

const lastOf = (recs: TrackerRecord[], kind: string) => recs.filter((r) => r.kind === kind).sort((a, b) => b.date.localeCompare(a.date))[0]

function kindLabel(kind: string, pet: Pet, recs: TrackerRecord[]) {
  const [base, sub] = kind.split(':')
  const sp = pet.species ?? 'autre'
  const note = lastOf(recs, kind)?.note
  if (base === 'vaccin') return `Vaccin ${VACCINES[sp]?.find((v) => v.id === sub)?.label ?? note ?? ''}`.trim()
  if (base === 'soin') return (SOINS[sp] ?? SOINS_DEFAULT).find((i) => i.id === sub)?.label ?? note ?? 'Soin'
  if (kind === 'rdv') return `RDV véto${note ? ` · ${note}` : ''}`
  if (kind === 'assurance') return 'Échéance assurance'
  return kind
}

export default function Animaux({ household }: { household: Household }) {
  const [pets, setPets] = useStored<Pet[]>('pets', [])
  const [records, setRecords] = useStored<TrackerRecord[]>('pets-log', [])
  const { current } = household
  const [selId, setSelId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('chien')

  const sel = pets.find((p) => p.id === selId)
  const patch = (id: string, p: Partial<Pet>) => setPets((ps) => ps.map((x) => (x.id === id ? { ...x, ...p } : x)))
  const addRec = (subject: string, r: Pick<TrackerRecord, 'kind' | 'date'> & Partial<TrackerRecord>) =>
    setRecords((rs) => [...rs, { id: uid(), subject, next: '', note: '', by: current.id, ...r }])
  const clearKind = (subject: string, kind: string) => setRecords((rs) => rs.filter((r) => !(r.subject === subject && r.kind === kind)))

  if (sel) {
    return <Detail pet={sel} recs={records.filter((r) => r.subject === sel.id)} patch={(p) => patch(sel.id, p)} addRec={(r) => addRec(sel.id, r)}
      clearKind={(k) => clearKind(sel.id, k)} setRecords={setRecords} onBack={() => setSelId(null)}
      onDelete={() => { setPets((ps) => ps.filter((p) => p.id !== sel.id)); setRecords((rs) => rs.filter((r) => r.subject !== sel.id)); setSelId(null) }} />
  }

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const id = uid()
    setPets((ps) => [...ps, { id, name: name.trim(), emoji: speciesOf(species)?.icon ?? '🐾', extra: '', species }])
    setName(''); setAdding(false); setSelId(id)
  }

  return (
    <div className="stack">
      {pets.length === 0 && !adding && <p className="empty">Aucun animal. Ajoutez le premier 🐾</p>}
      <ul className="stack">
        {pets.map((p) => {
          const recs = records.filter((r) => r.subject === p.id)
          const dues = dueItems([p], recs, 60).slice(0, 3)
          const sp = speciesOf(p.species)
          const bits = [sp?.label, p.breed, p.sex === 'm' ? '♂' : p.sex === 'f' ? '♀' : '', ageOf(p.birth ?? (p.extra.match(/^\d{4}-/) ? p.extra : undefined))].filter(Boolean)
          return (
            <li key={p.id}>
              <button className="panel trip" onClick={() => setSelId(p.id)}>
                <span className="chore-icon">{p.emoji}</span>
                <div className="grow" style={{ textAlign: 'left' }}>
                  <strong>{p.name}</strong>
                  <div className="sub">{bits.join(' · ') || 'Fiche à compléter'}</div>
                  {dues.map((d) => (
                    <div key={d.kind} className="sub"><span className="pill" data-hot={d.days <= 7}>{when(d.days)}</span> {kindLabel(d.kind, p, recs)}</div>
                  ))}
                </div>
                <span className="sub">›</span>
              </button>
            </li>
          )
        })}
      </ul>
      {adding ? (
        <form className="panel stack" onSubmit={create}>
          <h3 className="panel-title">Nouvel animal</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" autoFocus />
          <div className="chips">
            {SPECIES.map((s) => <button type="button" key={s.id} className={'chip' + (species === s.id ? ' on' : '')} onClick={() => setSpecies(s.id)}>{s.icon} {s.label}</button>)}
          </div>
          <div className="row">
            <button className="btn primary">Créer la fiche</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Ajouter un animal</button>
      )}
    </div>
  )
}

/* ---------------- Détail ---------------- */
type AddRec = (r: Pick<TrackerRecord, 'kind' | 'date'> & Partial<TrackerRecord>) => void

function Detail({ pet, recs, patch, addRec, clearKind, setRecords, onBack, onDelete }: {
  pet: Pet; recs: TrackerRecord[]; patch: (p: Partial<Pet>) => void; addRec: AddRec; clearKind: (k: string) => void
  setRecords: (u: (r: TrackerRecord[]) => TrackerRecord[]) => void; onBack: () => void; onDelete: () => void
}) {
  const [tab, setTab] = useState<'fiche' | 'sante' | 'frais'>('sante')
  const sp = speciesOf(pet.species)
  const neuterWord = pet.sex === 'f' ? 'Stérilisée' : pet.sex === 'm' ? 'Castré' : 'Stérilisé(e)'
  return (
    <div className="stack">
      <button className="link" onClick={onBack}>← Tous mes animaux</button>
      <section className="panel row nowrap" style={{ alignItems: 'center' }}>
        <span className="chore-icon">{pet.emoji}</span>
        <div className="grow">
          <h2 className="sheet-title">{pet.name}</h2>
          <div className="sub">{[sp?.label, pet.breed, pet.sex === 'm' ? '♂ Mâle' : pet.sex === 'f' ? '♀ Femelle' : '', pet.neutered === 'oui' ? neuterWord : '', ageOf(pet.birth)].filter(Boolean).join(' · ')}</div>
        </div>
      </section>
      <div className="chips">
        {([['sante', '💉 Santé'], ['frais', '💶 Frais & assurance'], ['fiche', '📋 Fiche']] as const).map(([k, l]) => (
          <button key={k} className={'chip' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'fiche' && <Fiche pet={pet} patch={patch} neuterWord={neuterWord} onDelete={onDelete} />}
      {tab === 'sante' && <Sante pet={pet} recs={recs} addRec={addRec} clearKind={clearKind} setRecords={setRecords} />}
      {tab === 'frais' && <Frais pet={pet} recs={recs} patch={patch} addRec={addRec} setRecords={setRecords} />}
    </div>
  )
}

/* ---------------- Fiche ---------------- */
function Fiche({ pet, patch, neuterWord, onDelete }: { pet: Pet; patch: (p: Partial<Pet>) => void; neuterWord: string; onDelete: () => void }) {
  const listId = `breeds-${pet.id}`
  return (
    <div className="stack">
      <section className="panel stack">
        <h3 className="panel-title">Identité</h3>
        <input value={pet.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Nom" aria-label="Nom" />
        <div className="chips" role="group" aria-label="Espèce">
          {SPECIES.map((s) => <button key={s.id} className={'chip' + (pet.species === s.id ? ' on' : '')} onClick={() => patch({ species: s.id, emoji: s.icon })}>{s.icon} {s.label}</button>)}
        </div>
        <input value={pet.breed ?? ''} onChange={(e) => patch({ breed: e.target.value })} placeholder="Race (ou « croisé »)" list={listId} aria-label="Race" />
        <datalist id={listId}>{(BREEDS[pet.species ?? ''] ?? []).map((b) => <option key={b} value={b} />)}</datalist>
        <div className="chips" role="group" aria-label="Sexe">
          <button className={'chip' + (pet.sex === 'm' ? ' on' : '')} onClick={() => patch({ sex: pet.sex === 'm' ? '' : 'm' })}>♂ Mâle</button>
          <button className={'chip' + (pet.sex === 'f' ? ' on' : '')} onClick={() => patch({ sex: pet.sex === 'f' ? '' : 'f' })}>♀ Femelle</button>
        </div>
        <div className="chips" role="group" aria-label="Stérilisation">
          <button className={'chip' + (pet.neutered === 'oui' ? ' on' : '')} onClick={() => patch({ neutered: pet.neutered === 'oui' ? '' : 'oui' })}>✂️ {neuterWord}</button>
          <button className={'chip' + (pet.neutered === 'non' ? ' on' : '')} onClick={() => patch({ neutered: pet.neutered === 'non' ? '' : 'non' })}>Non</button>
        </div>
        <div className="row">
          <label className="field">Date de naissance<input type="date" value={pet.birth ?? ''} onChange={(e) => patch({ birth: e.target.value })} /></label>
          <label className="field grow">Robe / couleur<input value={pet.color ?? ''} onChange={(e) => patch({ color: e.target.value })} /></label>
        </div>
        <label className="field">N° de puce / tatouage<input value={pet.chip ?? ''} onChange={(e) => patch({ chip: e.target.value })} inputMode="numeric" /></label>
        <label className="field">Alimentation<input value={pet.food ?? ''} onChange={(e) => patch({ food: e.target.value })} placeholder="Croquettes, pâtée, marque…" /></label>
      </section>
      <section className="panel stack">
        <h3 className="panel-title">Vétérinaire</h3>
        <input value={pet.vetName ?? ''} onChange={(e) => patch({ vetName: e.target.value })} placeholder="Nom / clinique" aria-label="Vétérinaire" />
        <input value={pet.vetPhone ?? ''} onChange={(e) => patch({ vetPhone: e.target.value })} placeholder="Téléphone" inputMode="tel" aria-label="Téléphone du vétérinaire" />
        {pet.vetPhone && /^[+\d][\d\s.+-]{5,}$/.test(pet.vetPhone) && <a className="btn small" href={`tel:${pet.vetPhone.replace(/[^\d+]/g, '')}`}>📞 Appeler</a>}
      </section>
      <section className="panel stack">
        <h3 className="panel-title">Notes (allergies, caractère, traitements…)</h3>
        <textarea value={pet.notes ?? ''} onChange={(e) => patch({ notes: e.target.value })} rows={4} />
      </section>
      <button className="btn ghost" onClick={() => confirm(`Supprimer la fiche de ${pet.name} et tout son historique ?`) && onDelete()}>🗑️ Supprimer cet animal</button>
    </div>
  )
}

/* ---------------- Ligne à cocher ---------------- */
function CheckRow({ label, hint, icon, every, last, quick, onSave, onClear }: {
  label: string; hint?: string; icon?: string; every: number; last?: TrackerRecord; quick?: boolean
  onSave: (d: { date: string; next: string; cost?: number }) => void; onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(iso(new Date()))
  const [next, setNext] = useState('')
  const [cost, setCost] = useState('')
  const days = last?.next ? daysBetween(new Date(), parse(last.next)) : null
  const edit = () => { const d = iso(new Date()); setDate(d); setNext(iso(addDays(new Date(), every))); setCost(''); setOpen(!open) }

  return (
    <li className="vrow">
      <div className="row nowrap" style={{ alignItems: 'center' }}>
        <button className={'tick' + (last ? ' on' : '')} onClick={edit} aria-label={`${label} : noter une date`} aria-pressed={!!last}>{last ? '✓' : ''}</button>
        <div className="grow">
          <strong>{icon && `${icon} `}{label}</strong>
          {hint && <div className="sub">{hint}</div>}
          <div className="sub">{last ? `Fait le ${fmtY(last.date)}${last.next ? ` · rappel le ${fmtY(last.next)}` : ''}` : 'Pas encore noté'}</div>
        </div>
        {days !== null && <span className="pill" data-hot={days <= 14}>{when(days)}</span>}
        {quick && <button className="btn small" onClick={() => onSave({ date: iso(new Date()), next: iso(addDays(new Date(), every)) })}>Fait ✓</button>}
        {last && <button className="icon-btn" onClick={() => confirm(`Retirer « ${label} » ?`) && onClear()} aria-label={`Retirer ${label}`}>×</button>}
      </div>
      {open && (
        <form className="stack vform" onSubmit={(e) => { e.preventDefault(); onSave({ date, next, cost: cost ? Number(cost) : undefined }); setOpen(false) }}>
          <div className="row">
            <label className="field">Date<input type="date" value={date} onChange={(e) => { setDate(e.target.value); setNext(iso(addDays(parse(e.target.value), every))) }} /></label>
            <label className="field">Prochain rappel<input type="date" value={next} min={date} onChange={(e) => setNext(e.target.value)} /></label>
            <label className="field">Coût (€)<input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 90 }} /></label>
          </div>
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
function FreeForm({ placeholder, every, onAdd }: { placeholder: string; every: number; onAdd: (name: string, d: { date: string; next: string; cost?: number }) => void }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(iso(new Date()))
  const [next, setNext] = useState(iso(addDays(new Date(), every)))
  const [cost, setCost] = useState('')
  return (
    <form className="stack vform" onSubmit={(e) => {
      e.preventDefault()
      if (!name.trim()) return
      onAdd(name.trim(), { date, next, cost: cost ? Number(cost) : undefined }); setName(''); setCost('')
    }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder} />
      <div className="row">
        <label className="field">Date<input type="date" value={date} onChange={(e) => { setDate(e.target.value); setNext(iso(addDays(parse(e.target.value), every))) }} /></label>
        <label className="field">Rappel<input type="date" value={next} min={date} onChange={(e) => setNext(e.target.value)} /></label>
        <label className="field">Coût (€)<input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 90 }} /></label>
      </div>
      <button className="btn small">+ Ajouter</button>
    </form>
  )
}

/* ---------------- Santé ---------------- */
function Sante({ pet, recs, addRec, clearKind, setRecords }: {
  pet: Pet; recs: TrackerRecord[]; addRec: AddRec; clearKind: (k: string) => void; setRecords: (u: (r: TrackerRecord[]) => TrackerRecord[]) => void
}) {
  const sp = pet.species ?? 'autre'
  const vaccines: Item[] = VACCINES[sp] ?? []
  const soins: Item[] = SOINS[sp] ?? SOINS_DEFAULT
  const today = iso(new Date())
  const customKinds = (prefix: string) => [...new Set(recs.filter((r) => r.kind.startsWith(prefix)).map((r) => r.kind))]
  const customLabel = (kind: string) => lastOf(recs, kind)?.note ?? kind

  const [rdvDate, setRdvDate] = useState('')
  const [rdvNote, setRdvNote] = useState('')
  const rdv = recs.filter((r) => r.kind === 'rdv' && r.next >= today).sort((a, b) => a.next.localeCompare(b.next))[0]
  const [weight, setWeight] = useState('')
  const weights = recs.filter((r) => r.kind === 'poids').sort((a, b) => b.date.localeCompare(a.date))

  const save = (kind: string, note = '') => (d: { date: string; next: string; cost?: number }) => addRec({ kind, date: d.date, next: d.next, cost: d.cost, note: note || undefined })

  return (
    <div className="stack">
      <section className="panel stack">
        <h3 className="panel-title">🩺 Prochaine visite chez le vétérinaire</h3>
        {rdv ? (
          <div className="row nowrap" style={{ alignItems: 'center' }}>
            <div className="grow"><strong>{parse(rdv.next).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>{rdv.note && <div className="sub">{rdv.note}</div>}</div>
            <span className="pill" data-hot={daysBetween(new Date(), parse(rdv.next)) <= 3}>{when(daysBetween(new Date(), parse(rdv.next)))}</span>
            <button className="icon-btn" onClick={() => setRecords((rs) => rs.filter((r) => r.id !== rdv.id))} aria-label="Retirer le rendez-vous">×</button>
          </div>
        ) : <p className="sub">Aucun rendez-vous prévu.</p>}
        <form className="row" onSubmit={(e) => {
          e.preventDefault()
          if (!rdvDate) return
          setRecords((rs) => rs.filter((r) => !(r.kind === 'rdv' && r.next >= today)))
          addRec({ kind: 'rdv', date: today, next: rdvDate, note: rdvNote.trim() })
          setRdvDate(''); setRdvNote('')
        }}>
          <input type="date" value={rdvDate} min={today} onChange={(e) => setRdvDate(e.target.value)} aria-label="Date du rendez-vous" />
          <input value={rdvNote} onChange={(e) => setRdvNote(e.target.value)} placeholder="Motif (facultatif)" className="grow" />
          <button className="btn small">{rdv ? 'Remplacer' : 'Noter'}</button>
        </form>
      </section>

      <section className="panel stack">
        <h3 className="panel-title">💉 Vaccins</h3>
        {vaccines.length === 0 && <p className="sub">Pas de liste type pour cette espèce : utilisez « Autre vaccin » ci-dessous.</p>}
        <ul className="list">
          {vaccines.map((v) => {
            const kind = `vaccin:${v.id}`
            return <CheckRow key={kind} label={v.label} hint={v.hint} every={v.every} last={lastOf(recs, kind)} onSave={save(kind)} onClear={() => clearKind(kind)} />
          })}
          {customKinds('vaccin:c-').map((kind) => (
            <CheckRow key={kind} label={customLabel(kind)} every={365} last={lastOf(recs, kind)} onSave={save(kind, customLabel(kind))} onClear={() => clearKind(kind)} />
          ))}
        </ul>
        <strong className="sub">Autre vaccin</strong>
        <FreeForm placeholder="Nom du vaccin" every={365} onAdd={(name, d) => addRec({ kind: `vaccin:c-${slug(name)}`, date: d.date, next: d.next, cost: d.cost, note: name })} />
        <p className="sub">Liste indicative : votre vétérinaire décide du protocole de votre animal.</p>
      </section>

      <section className="panel stack">
        <h3 className="panel-title">🧴 Soins et traitements</h3>
        <ul className="list">
          {soins.map((s) => {
            const kind = `soin:${s.id}`
            return <CheckRow key={kind} label={s.label} icon={s.icon} every={s.every} quick last={lastOf(recs, kind)} onSave={save(kind)} onClear={() => clearKind(kind)} />
          })}
          {customKinds('soin:c-').map((kind) => (
            <CheckRow key={kind} label={customLabel(kind)} every={30} quick last={lastOf(recs, kind)} onSave={save(kind, customLabel(kind))} onClear={() => clearKind(kind)} />
          ))}
        </ul>
        <strong className="sub">Autre soin ou traitement</strong>
        <FreeForm placeholder="Ex. Collier anti-puces, gouttes, pansement…" every={30} onAdd={(name, d) => addRec({ kind: `soin:c-${slug(name)}`, date: d.date, next: d.next, cost: d.cost, note: name })} />
      </section>

      <section className="panel stack">
        <h3 className="panel-title">⚖️ Poids</h3>
        <form className="row" onSubmit={(e) => { e.preventDefault(); const w = Number(weight.replace(',', '.')); if (w > 0) { addRec({ kind: 'poids', date: today, metric: w }); setWeight('') } }}>
          <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" placeholder="Poids (kg)" style={{ width: 130 }} />
          <button className="btn small">Peser aujourd’hui</button>
        </form>
        {weights.length > 0 && (
          <ul className="list">
            {weights.slice(0, 5).map((w, i) => {
              const prev = weights[i + 1]
              const delta = prev?.metric !== undefined && w.metric !== undefined ? w.metric - prev.metric : null
              return (
                <li key={w.id} className="item">
                  <div className="grow"><strong>{w.metric} kg</strong><div className="sub">{fmtShort(parse(w.date))}{delta !== null && ` · ${delta >= 0 ? '+' : '−'}${Math.abs(Math.round(delta * 100) / 100)} kg`}</div></div>
                  <button className="icon-btn" onClick={() => setRecords((rs) => rs.filter((r) => r.id !== w.id))} aria-label="Supprimer">×</button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

/* ---------------- Frais & assurance ---------------- */
function Frais({ pet, recs, patch, addRec, setRecords }: {
  pet: Pet; recs: TrackerRecord[]; patch: (p: Partial<Pet>) => void; addRec: AddRec; setRecords: (u: (r: TrackerRecord[]) => TrackerRecord[]) => void
}) {
  const year = String(new Date().getFullYear())
  const today = iso(new Date())
  const [cat, setCat] = useState('vet')
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const renewal = lastOf(recs, 'assurance')

  const costs = recs.filter((r) => r.cost !== undefined && r.date.startsWith(year))
  const catOf = (r: TrackerRecord) => (r.kind.startsWith('frais:') ? EXPENSES.find((e) => e.id === r.kind.slice(6)) ?? EXPENSES[EXPENSES.length - 1] : { id: 'care-vet', label: 'Soins & vaccins', icon: '💉' })
  const byCat = new Map<string, { label: string; icon: string; total: number }>()
  for (const r of costs) { const c = catOf(r); byCat.set(c.id, { label: c.label, icon: c.icon, total: (byCat.get(c.id)?.total ?? 0) + (r.cost ?? 0) }) }
  const total = costs.reduce((t, r) => t + (r.cost ?? 0), 0)
  const insuranceYear = (pet.insurancePrice ?? 0) * 12
  const top = Math.max(1, ...[...byCat.values()].map((c) => c.total))
  const expenses = recs.filter((r) => r.kind.startsWith('frais:')).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="stack">
      <section className="panel stack">
        <h3 className="panel-title">🛡️ Assurance animale</h3>
        <input value={pet.insurer ?? ''} onChange={(e) => patch({ insurer: e.target.value })} placeholder="Assureur (ex. Santévet, Agria…)" aria-label="Assureur" />
        <div className="row">
          <label className="field grow">N° de contrat<input value={pet.insuranceNo ?? ''} onChange={(e) => patch({ insuranceNo: e.target.value })} /></label>
          <label className="field">Prix (€/mois)<input type="number" min={0} step="0.01" value={pet.insurancePrice ?? ''} onChange={(e) => patch({ insurancePrice: e.target.value ? Number(e.target.value) : undefined })} style={{ width: 110 }} /></label>
        </div>
        <label className="field">Prochaine échéance du contrat
          <input type="date" value={renewal?.next ?? ''} onChange={(e) => {
            setRecords((rs) => rs.filter((r) => r.kind !== 'assurance'))
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
        <p className="sub">Les coûts saisis sur les vaccins et soins sont comptés dans « Soins & vaccins ».</p>
      </section>

      <form className="panel stack" onSubmit={(e) => {
        e.preventDefault()
        const n = Number(amount.replace(',', '.'))
        if (!(n > 0)) return
        addRec({ kind: `frais:${cat}`, date, cost: n, note: note.trim() })
        setAmount(''); setNote('')
      }}>
        <h3 className="panel-title">Ajouter une dépense</h3>
        <div className="chips">
          {EXPENSES.map((e) => <button type="button" key={e.id} className={'chip' + (cat === e.id ? ' on' : '')} onClick={() => setCat(e.id)}>{e.icon} {e.label}</button>)}
        </div>
        <div className="row">
          <label className="field">Montant (€)<input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" style={{ width: 110 }} /></label>
          <label className="field">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (ex. consultation, croquettes 12 kg…) — facultatif" />
        <button className="btn primary">Ajouter</button>
      </form>

      {expenses.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">Dernières dépenses</h3>
          <ul className="list">
            {expenses.slice(0, 8).map((r) => {
              const c = EXPENSES.find((e) => e.id === r.kind.slice(6)) ?? EXPENSES[EXPENSES.length - 1]
              return (
                <li key={r.id} className="item">
                  <span>{c.icon}</span>
                  <div className="grow"><strong>{c.label}</strong><div className="sub">{fmtShort(parse(r.date))}{r.note && ` · ${r.note}`}</div></div>
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
