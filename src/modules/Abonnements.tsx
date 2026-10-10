import { useState } from 'react'
import Avatar from '../components/Avatar'
import type { Household } from '../lib/household'
import { addDays, daysBetween, fmtShort, iso, parse, startOfDay } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Subscription } from '../lib/types'

export const useSubs = () => useStored<Subscription[]>('subs', [])

const EMOJIS = ['📺', '🎵', '🎮', '📱', '🌐', '🏋️', '📰', '☁️', '🛡️', '💡', '🚗', '🛒']
const CYCLES = [{ m: 1, label: 'Mensuel' }, { m: 3, label: 'Trimestriel' }, { m: 12, label: 'Annuel' }]
const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

/** Le prélèvement tombe-t-il ce jour-là ? (le 31 devient le dernier jour des mois courts) */
export function renewsOn(s: Subscription, d: Date) {
  const start = parse(s.date)
  const diff = (d.getFullYear() - start.getFullYear()) * 12 + d.getMonth() - start.getMonth()
  if (diff < 0 || diff % s.months !== 0) return false
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  return d.getDate() === Math.min(start.getDate(), last)
}

export function nextRenewal(s: Subscription, from = new Date()): Date | null {
  const start = startOfDay(from)
  for (let i = 0; i < 400; i++) {
    const d = addDays(start, i)
    if (renewsOn(s, d)) return d
  }
  return null
}

export default function Abonnements({ household }: { household: Household }) {
  const [subs, setSubs] = useSubs()
  const { members, current } = household
  const [adding, setAdding] = useState(false)
  const [d, setD] = useState({ name: '', emoji: EMOJIS[0], amount: '', months: 1, date: iso(new Date()), notice: '' })

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(d.amount.replace(',', '.'))
    if (!d.name.trim() || !(amount > 0)) return
    setSubs((ss) => [...ss, { id: uid(), name: d.name.trim(), emoji: d.emoji, amount, months: d.months, date: d.date, notice: d.notice ? Number(d.notice) : undefined, by: current.id }])
    setD({ ...d, name: '', amount: '', notice: '' }); setAdding(false)
  }

  const monthly = subs.reduce((t, s) => t + s.amount / s.months, 0)
  const rows = subs.map((s) => ({ s, next: nextRenewal(s) })).sort((a, b) => (a.next?.getTime() ?? 9e15) - (b.next?.getTime() ?? 9e15))

  return (
    <div className="stack">
      {subs.length > 0 && (
        <section className="panel row between" style={{ alignItems: 'center' }}>
          <div><div className="sub">Par mois</div><div className="big-num">{euro(monthly)}</div></div>
          <div style={{ textAlign: 'right' }}><div className="sub">Par an</div><div className="big-num">{euro(monthly * 12)}</div></div>
        </section>
      )}
      {subs.length === 0 && !adding && <p className="empty">Aucun abonnement suivi 🔁</p>}

      <ul className="stack">
        {rows.map(({ s, next }) => {
          const left = next ? daysBetween(new Date(), next) : null
          const by = members.find((m) => m.id === s.by)
          const warn = s.notice && next && left !== null && left <= s.notice + 7
          return (
            <li key={s.id} className="panel chore">
              <span className="chore-icon">{s.emoji}</span>
              <div className="grow">
                <strong>{s.name}</strong>
                <div className="sub">{euro(s.amount)} / {s.months === 1 ? 'mois' : s.months === 3 ? 'trimestre' : 'an'}{s.months > 1 && ` (${euro(s.amount / s.months)}/mois)`}</div>
                {next && left !== null && (
                  <>
                    <span className="pill" data-hot={left <= 3}>{left === 0 ? "aujourd'hui" : left === 1 ? 'demain' : `dans ${left} j`}</span>
                    <span className="sub"> · {fmtShort(next)}</span>
                  </>
                )}
                {warn && next && s.notice && <div className="sub" style={{ color: '#b9770e' }}>⚠️ Pour résilier, prévenir avant le {fmtShort(addDays(next, -s.notice))}</div>}
              </div>
              {by && <Avatar m={by} title={`Suivi par ${by.name}`} />}
              <button className="icon-btn" onClick={() => confirm(`Supprimer « ${s.name} » ?`) && setSubs((ss) => ss.filter((x) => x.id !== s.id))} aria-label={`Supprimer ${s.name}`}>×</button>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <h3 className="panel-title">Nouvel abonnement</h3>
          <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Nom (ex. Netflix, salle de sport…)" autoFocus />
          <div className="chips">
            {EMOJIS.map((e) => <button type="button" key={e} className={'chip emoji' + (d.emoji === e ? ' on' : '')} onClick={() => setD({ ...d, emoji: e })}>{e}</button>)}
          </div>
          <div className="row">
            <label className="field">Montant (€)
              <input value={d.amount} onChange={(e) => setD({ ...d, amount: e.target.value })} inputMode="decimal" placeholder="0,00" style={{ width: 110 }} />
            </label>
            <label className="field">Fréquence
              <select value={d.months} onChange={(e) => setD({ ...d, months: Number(e.target.value) })}>
                {CYCLES.map((c) => <option key={c.m} value={c.m}>{c.label}</option>)}
              </select>
            </label>
          </div>
          <div className="row">
            <label className="field">Une date de prélèvement
              <input type="date" value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} />
            </label>
            <label className="field">Préavis (jours)
              <input type="number" min={0} value={d.notice} onChange={(e) => setD({ ...d, notice: e.target.value })} placeholder="facultatif" style={{ width: 110 }} />
            </label>
          </div>
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Nouvel abonnement</button>
      )}
    </div>
  )
}
