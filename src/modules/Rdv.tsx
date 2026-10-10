import { useState } from 'react'
import Avatar from '../components/Avatar'
import type { Household } from '../lib/household'
import { addDays, daysBetween, fmtShort, iso, parse, startOfDay } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Appt } from '../lib/types'

export const useAppts = () => useStored<Appt[]>('appts', [])

interface Preset { name: string; icon: string; every: number }
const GROUPS: { id: string; icon: string; label: string; items: Preset[] }[] = [
  { id: 'cheveux', icon: '💇‍♀️', label: 'Cheveux', items: [
    { name: 'Coupe', icon: '✂️', every: 56 },
    { name: 'Couleur', icon: '🎨', every: 42 },
    { name: 'Racines', icon: '🌱', every: 35 },
    { name: 'Pointes', icon: '✂️', every: 70 },
    { name: 'Mèches / balayage', icon: '✨', every: 105 },
    { name: 'Brushing / mise en plis', icon: '💨', every: 14 },
    { name: 'Soin / masque', icon: '💆‍♀️', every: 28 },
    { name: 'Lissage / permanente', icon: '🌀', every: 120 },
  ] },
  { id: 'barbier', icon: '💈', label: 'Barbier / coupe', items: [
    { name: 'Coupe homme', icon: '✂️', every: 35 },
    { name: 'Barbe / taille', icon: '🧔', every: 21 },
    { name: 'Coupe enfant', icon: '🧒', every: 56 },
  ] },
  { id: 'beaute', icon: '💅', label: 'Beauté', items: [
    { name: 'Manucure / vernis semi-permanent', icon: '💅', every: 21 },
    { name: 'Pose gel / capsules', icon: '💎', every: 21 },
    { name: 'Pédicure', icon: '🦶', every: 35 },
    { name: 'Épilation', icon: '🪒', every: 28 },
    { name: 'Sourcils', icon: '✨', every: 28 },
    { name: 'Cils (rehaussement / extensions)', icon: '👁️', every: 28 },
    { name: 'Soin du visage', icon: '🧖‍♀️', every: 42 },
  ] },
  { id: 'bienetre', icon: '🧖', label: 'Bien-être', items: [
    { name: 'Massage', icon: '💆', every: 60 },
    { name: 'Spa / hammam', icon: '🛁', every: 90 },
  ] },
  { id: 'autre', icon: '📌', label: 'Autre', items: [
    { name: 'Rendez-vous annuel', icon: '🗓️', every: 365 },
  ] },
]
const groupOf = (id: string) => GROUPS.find((g) => g.id === id) ?? GROUPS[GROUPS.length - 1]

const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const lastDate = (a: Appt) => a.history.map((h) => h.date).sort().pop()

/** "6 semaines", "3 mois", "10 jours" */
export function fmtEvery(days: number) {
  if (days >= 84 && days % 30 < 8) { const m = Math.round(days / 30); return `${m} mois` }
  if (days % 7 === 0 && days >= 14) return `${days / 7} semaines`
  return `${days} jour${days > 1 ? 's' : ''}`
}
const fmtAgo = (d: number) => (d <= 0 ? "aujourd'hui" : d === 1 ? 'hier' : d < 14 ? `il y a ${d} j` : d < 70 ? `il y a ${Math.round(d / 7)} sem.` : `il y a ${Math.round(d / 30)} mois`)
const fmtIn = (d: number) => (d < 0 ? `en retard de ${fmtEvery(-d)}` : d === 0 ? "aujourd'hui" : d === 1 ? 'demain' : d < 14 ? `dans ${d} j` : d < 70 ? `dans ${Math.round(d / 7)} sem.` : `dans ${Math.round(d / 30)} mois`)

/** Date conseillée du prochain rendez-vous = dernier + intervalle (ou aujourd'hui si jamais fait). */
export const dueOf = (a: Appt) => { const l = lastDate(a); return l ? addDays(parse(l), a.everyDays) : startOfDay() }
export const daysToDue = (a: Appt) => daysBetween(new Date(), dueOf(a))
export const daysToBooked = (a: Appt) => (a.booked ? daysBetween(new Date(), parse(a.booked)) : null)
/** À reprendre dans moins de 7 jours (ou en retard) et sans rendez-vous pris. */
export const needsBooking = (a: Appt) => (a.booked && daysToBooked(a)! >= 0 ? false : daysToDue(a) <= 7)

export default function Rdv({ household }: { household: Household }) {
  const [appts, setAppts] = useAppts()
  const { members, current } = household
  const [who, setWho] = useState<string>(current.id) // 'all' ou id
  const [adding, setAdding] = useState(false)
  const [group, setGroup] = useState('cheveux')
  const [owner, setOwner] = useState(current.id)
  const [name, setName] = useState('')
  const [weeks, setWeeks] = useState('')
  const [open, setOpen] = useState<{ id: string; mode: 'done' | 'book' | 'edit' } | null>(null)
  const [date, setDate] = useState(iso(new Date()))
  const [time, setTime] = useState('')
  const [cost, setCost] = useState('')

  const patch = (id: string, p: Partial<Appt>) => setAppts((as) => as.map((a) => (a.id === id ? { ...a, ...p } : a)))
  const g = groupOf(group)

  const create = (p: Preset | null) => {
    const n = (p?.name ?? name).trim()
    if (!n) return
    const every = p?.every ?? (weeks ? Math.max(1, Math.round(Number(weeks) * 7)) : 42)
    setAppts((as) => [...as, { id: uid(), owner, group, name: n, icon: p?.icon ?? g.icon, everyDays: every, provider: '', phone: '', note: '', history: [] }])
    setName(''); setWeeks(''); setAdding(false)
  }

  const shown = appts.filter((a) => who === 'all' || a.owner === who)
    .sort((a, b) => (a.booked && daysToBooked(a)! >= 0 ? 1000 : 0) + daysToDue(a) - ((b.booked && daysToBooked(b)! >= 0 ? 1000 : 0) + daysToDue(b)))
  const year = String(new Date().getFullYear())
  const spent = shown.flatMap((a) => a.history).filter((h) => h.date.startsWith(year)).reduce((t, h) => t + (h.cost ?? 0), 0)
  const todo = shown.filter(needsBooking).length

  const openForm = (a: Appt, mode: 'done' | 'book' | 'edit') => {
    if (open?.id === a.id && open.mode === mode) return setOpen(null)
    setOpen({ id: a.id, mode }); setDate(mode === 'book' ? iso(addDays(new Date(), Math.max(1, daysToDue(a)))) : iso(new Date())); setTime(a.bookedTime ?? ''); setCost(a.price !== undefined ? String(a.price) : '')
  }
  const markDone = (a: Appt) => {
    patch(a.id, { history: [...a.history, { date, cost: cost ? Number(cost) : undefined }], booked: a.booked && a.booked <= date ? undefined : a.booked, bookedTime: a.booked && a.booked <= date ? undefined : a.bookedTime, price: cost ? Number(cost) : a.price })
    setOpen(null)
  }

  return (
    <div className="stack">
      <div className="chips" role="group" aria-label="Personne">
        {members.map((m) => <button key={m.id} className={'chip' + (who === m.id ? ' on' : '')} onClick={() => setWho(m.id)}>{m.id === current.id ? 'Moi' : m.name}</button>)}
        {members.length > 1 && <button className={'chip' + (who === 'all' ? ' on' : '')} onClick={() => setWho('all')}>Tous</button>}
      </div>

      {shown.length > 0 && (
        <section className="panel row between" style={{ alignItems: 'center' }}>
          <div><div className="sub">À reprendre bientôt</div><div className="big-num">{todo}</div></div>
          <div style={{ textAlign: 'right' }}><div className="sub">Dépensé en {year}</div><div className="big-num">{euro(spent)}</div></div>
        </section>
      )}
      {shown.length === 0 && !adding && <p className="empty">Aucun rendez-vous suivi. Ajoutez coiffeur, manucure, massage… 💇</p>}

      <ul className="stack">
        {shown.map((a) => {
          const due = daysToDue(a), booked = daysToBooked(a)
          const hasBooking = a.booked && booked! >= 0
          const o = members.find((m) => m.id === a.owner)
          const last = lastDate(a)
          const hist = [...a.history].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 3)
          return (
            <li key={a.id} className="panel stack" style={{ gap: 10 }}>
              <div className="row nowrap" style={{ alignItems: 'center' }}>
                <span className="chore-icon">{a.icon}</span>
                <div className="grow">
                  <strong>{a.name}</strong>
                  <div className="sub">{o && who === 'all' && `${o.name} · `}Toutes les {fmtEvery(a.everyDays)}{a.provider && ` · ${a.provider}`}</div>
                </div>
                {o && who === 'all' && <Avatar m={o} />}
                <button className="icon-btn" onClick={() => confirm(`Supprimer « ${a.name} » ?`) && setAppts((as) => as.filter((x) => x.id !== a.id))} aria-label={`Supprimer ${a.name}`}>×</button>
              </div>

              <div className="stack" style={{ gap: 6 }}>
                {hasBooking ? (
                  <div className="row nowrap" style={{ alignItems: 'center' }}>
                    <span className="pill" data-hot={booked! <= 2}>📅 RDV pris</span>
                    <span><strong>{parse(a.booked!).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>{a.bookedTime && ` à ${a.bookedTime}`} <span className="sub">({fmtIn(booked!)})</span></span>
                    <button className="icon-btn" onClick={() => patch(a.id, { booked: undefined, bookedTime: undefined })} aria-label="Annuler le rendez-vous">×</button>
                  </div>
                ) : (
                  <div className="row" style={{ alignItems: 'center' }}>
                    <span className="pill" data-hot={due <= 7}>{due <= 0 ? '⏰ À reprendre' : '⏳ Prochain RDV'}</span>
                    <span>{last ? <><strong>{fmtIn(due)}</strong> <span className="sub">({fmtShort(dueOf(a))})</span></> : <span className="sub">Jamais noté — à planifier</span>}</span>
                  </div>
                )}
                {last && <div className="sub">Dernière fois : {parse(last).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} ({fmtAgo(daysBetween(parse(last), new Date()))})</div>}
              </div>

              <div className="row">
                <button className="btn primary small" onClick={() => openForm(a, 'done')}>✓ Fait</button>
                <button className="btn small" onClick={() => openForm(a, 'book')}>📅 RDV pris</button>
                <button className="btn ghost small" onClick={() => openForm(a, 'edit')}>⚙️ Réglages</button>
                {a.phone && <a className="btn ghost small" href={`tel:${a.phone.replace(/[^\d+]/g, '')}`}>📞</a>}
              </div>

              {open?.id === a.id && open.mode === 'done' && (
                <form className="stack vform" style={{ marginLeft: 0 }} onSubmit={(e) => { e.preventDefault(); markDone(a) }}>
                  <div className="row">
                    <label className="field">Date<input type="date" value={date} max={iso(new Date())} onChange={(e) => setDate(e.target.value)} /></label>
                    <label className="field">Prix (€)<input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 100 }} /></label>
                  </div>
                  <div className="row"><button className="btn primary small">Enregistrer</button><button type="button" className="btn ghost small" onClick={() => setOpen(null)}>Annuler</button></div>
                </form>
              )}
              {open?.id === a.id && open.mode === 'book' && (
                <form className="stack vform" style={{ marginLeft: 0 }} onSubmit={(e) => { e.preventDefault(); patch(a.id, { booked: date, bookedTime: time || undefined }); setOpen(null) }}>
                  <div className="row">
                    <label className="field">Date du rendez-vous<input type="date" value={date} min={iso(new Date())} onChange={(e) => setDate(e.target.value)} /></label>
                    <label className="field">Heure<input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
                  </div>
                  <div className="row"><button className="btn primary small">Enregistrer</button><button type="button" className="btn ghost small" onClick={() => setOpen(null)}>Annuler</button></div>
                </form>
              )}
              {open?.id === a.id && open.mode === 'edit' && <Settings a={a} patch={(p) => patch(a.id, p)} />}

              {hist.length > 0 && (
                <div className="sub">Historique : {hist.map((h) => `${fmtShort(parse(h.date))}${h.cost !== undefined ? ` (${euro(h.cost)})` : ''}`).join(' · ')}</div>
              )}
            </li>
          )
        })}
      </ul>

      {adding ? (
        <section className="panel stack">
          <h3 className="panel-title">Nouveau suivi</h3>
          {members.length > 1 && (
            <div className="chips" role="group" aria-label="Pour qui">
              {members.map((m) => <button key={m.id} className={'chip' + (owner === m.id ? ' on' : '')} onClick={() => setOwner(m.id)}>{m.id === current.id ? 'Moi' : m.name}</button>)}
            </div>
          )}
          <div className="chips" role="group" aria-label="Catégorie">
            {GROUPS.map((x) => <button key={x.id} className={'chip' + (group === x.id ? ' on' : '')} onClick={() => setGroup(x.id)}>{x.icon} {x.label}</button>)}
          </div>
          <div className="chips" role="group" aria-label="Services">
            {g.items.map((p) => <button key={p.name} className="chip" onClick={() => create(p)}>{p.icon} {p.name} <span className="sub">· {fmtEvery(p.every)}</span></button>)}
          </div>
          <strong className="sub">Autre / personnalisé</strong>
          <form className="row" onSubmit={(e) => { e.preventDefault(); create(null) }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom (ex. Ongles, Tatouage…)" className="grow" />
            <label className="field">Toutes les (semaines)<input type="number" min={1} value={weeks} onChange={(e) => setWeeks(e.target.value)} placeholder="6" style={{ width: 110 }} /></label>
            <button className="btn primary small">Ajouter</button>
          </form>
          <button className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          <p className="sub">Les intervalles proposés sont des moyennes : vous pouvez les modifier ensuite dans « Réglages ».</p>
        </section>
      ) : (
        <button className="btn primary" onClick={() => { setAdding(true); setOwner(who === 'all' ? current.id : who) }}>+ Ajouter un suivi</button>
      )}
      <p className="sub center">Visible par tout le foyer. « Mes RDV » ne garde que des dates et des tarifs.</p>
    </div>
  )
}

function Settings({ a, patch }: { a: Appt; patch: (p: Partial<Appt>) => void }) {
  const [unit, setUnit] = useState<'j' | 's' | 'm'>(a.everyDays % 30 === 0 && a.everyDays >= 90 ? 'm' : a.everyDays % 7 === 0 ? 's' : 'j')
  const mult = unit === 'm' ? 30 : unit === 's' ? 7 : 1
  return (
    <div className="stack vform" style={{ marginLeft: 0 }}>
      <label className="field">Reprendre rendez-vous toutes les…
        <div className="row nowrap">
          <input type="number" min={1} value={Math.max(1, Math.round(a.everyDays / mult))} onChange={(e) => patch({ everyDays: Math.max(1, Number(e.target.value)) * mult })} style={{ width: 90 }} />
          <select value={unit} onChange={(e) => setUnit(e.target.value as 'j' | 's' | 'm')}><option value="j">jours</option><option value="s">semaines</option><option value="m">mois</option></select>
        </div>
      </label>
      <input value={a.provider} onChange={(e) => patch({ provider: e.target.value })} placeholder="Salon / praticien(ne)" aria-label="Salon ou praticien" />
      <input value={a.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="Téléphone" inputMode="tel" aria-label="Téléphone" />
      <label className="field">Tarif habituel (€)<input type="number" min={0} step="0.01" value={a.price ?? ''} onChange={(e) => patch({ price: e.target.value ? Number(e.target.value) : undefined })} style={{ width: 110 }} /></label>
      <input value={a.note} onChange={(e) => patch({ note: e.target.value })} placeholder="Note (teinte, longueur, produits…)" aria-label="Note" />
    </div>
  )
}
