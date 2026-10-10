import { useState } from 'react'
import { fmtShort, iso, parse } from '../../lib/dates'
import { uid } from '../../lib/storage'
import { CATEGORIES, category, costLines, euro, type SectionProps } from './shared'

export default function TripBudget({ trip, patch, travelers }: SectionProps) {
  const lines = costLines(trip)
  const total = lines.reduce((s, l) => s + l.amount, 0)
  const paid = lines.filter((l) => l.paid).reduce((s, l) => s + l.amount, 0)
  const toPay = total - paid
  const n = Math.max(1, travelers.length)
  const byCat = CATEGORIES.map((c) => ({ c, v: lines.filter((l) => l.cat === c.id).reduce((s, l) => s + l.amount, 0) })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v)

  // Équilibre entre voyageurs : seules les dépenses payées avec un payeur connu comptent, à parts égales.
  const counted = lines.filter((l) => l.paid && l.payer && travelers.some((t) => t.id === l.payer))
  const countedTotal = counted.reduce((s, l) => s + l.amount, 0)
  const nets = travelers.map((t) => ({ t, net: counted.filter((l) => l.payer === t.id).reduce((s, l) => s + l.amount, 0) - countedTotal / n }))
  const hi = [...nets].sort((a, b) => b.net - a.net)[0], lo = [...nets].sort((a, b) => a.net - b.net)[0]

  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState('repas')
  const [date, setDate] = useState(iso(new Date()))
  const [payer, setPayer] = useState(travelers[0]?.id ?? '')

  return (
    <div className="stack">
      <section className="panel stack">
        <div className="row between" style={{ alignItems: 'center' }}>
          <div><div className="sub">Total prévu</div><div className="big-num">{euro(total)}</div></div>
          <label className="field">Budget (€)
            <input type="number" min={0} value={trip.budget ?? ''} onChange={(e) => patch((t) => ({ ...t, budget: e.target.value ? Number(e.target.value) : undefined }))} style={{ width: 110 }} />
          </label>
        </div>
        {trip.budget ? (
          <>
            <div className="bar"><span style={{ width: `${Math.min(100, (total / trip.budget) * 100)}%`, background: total > trip.budget ? '#c0392b' : 'var(--accent)' }} /></div>
            <div className="sub">{total > trip.budget ? `Dépassement de ${euro(total - trip.budget)}` : `Reste ${euro(trip.budget - total)} sur le budget`}</div>
          </>
        ) : null}
        <div className="stats">
          <div className="stat" style={{ borderTopColor: '#2f7d68' }}><strong>{euro(paid)}</strong><span>déjà payé</span></div>
          <div className="stat" style={{ borderTopColor: '#e0a030' }}><strong>{euro(toPay)}</strong><span>reste à payer</span></div>
          {travelers.length > 1 && <div className="stat" style={{ borderTopColor: 'var(--accent)' }}><strong>{euro(total / n)}</strong><span>par personne</span></div>}
        </div>
      </section>

      {byCat.length > 0 && (
        <section className="panel stack">
          <h3 className="panel-title">Par catégorie</h3>
          {byCat.map(({ c, v }) => (
            <div key={c.id} className="stack" style={{ gap: 3 }}>
              <div className="row between"><span>{c.icon} {c.label}</span><strong>{euro(v)}</strong></div>
              <div className="bar thin"><span style={{ width: `${(v / byCat[0].v) * 100}%` }} /></div>
            </div>
          ))}
        </section>
      )}

      {travelers.length > 1 && countedTotal > 0 && (
        <section className="panel stack">
          <h3 className="panel-title">Équilibre entre voyageurs</h3>
          {nets.map(({ t, net }) => (
            <div key={t.id} className="row between"><span>{t.name}</span><strong className={net >= 0 ? 'ok' : 'bad'}>{net >= 0 ? '+' : '−'}{euro(Math.abs(net))}</strong></div>
          ))}
          {hi && lo && hi.net - lo.net > 0.005 && <p className="sub">👉 {lo.t.name} doit {euro(Math.min(-lo.net, hi.net))} à {hi.t.name}.</p>}
          <p className="sub">Calculé sur les dépenses payées dont le payeur est indiqué, partagées à parts égales entre les {n} voyageurs.</p>
        </section>
      )}

      <form className="panel stack" onSubmit={(e) => {
        e.preventDefault()
        const a = Number(amount.replace(',', '.'))
        if (!label.trim() || !(a > 0)) return
        patch((t) => ({ ...t, expenses: [...(t.expenses ?? []), { id: uid(), date, label: label.trim(), category: cat, amount: a, payer: payer || undefined }] }))
        setLabel(''); setAmount('')
      }}>
        <h3 className="panel-title">Dépense sur place</h3>
        <div className="chips">{CATEGORIES.map((c) => <button type="button" key={c.id} className={'chip' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)}>{c.icon} {c.label}</button>)}</div>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. Restaurant, taxi, souvenirs…" />
        <div className="row">
          <label className="field">Montant (€)<input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" style={{ width: 110 }} /></label>
          <label className="field">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          {travelers.length > 1 && <label className="field">Payé par<select value={payer} onChange={(e) => setPayer(e.target.value)}>{travelers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}
        </div>
        <button className="btn primary">Ajouter</button>
      </form>

      {(trip.expenses ?? []).length > 0 && (
        <section className="panel">
          <h3 className="panel-title">Dépenses sur place</h3>
          <ul className="list">
            {[...(trip.expenses ?? [])].sort((a, b) => b.date.localeCompare(a.date)).map((x) => (
              <li key={x.id} className="item">
                <span>{category(x.category).icon}</span>
                <div className="grow"><strong>{x.label}</strong><div className="sub">{fmtShort(parse(x.date))}{x.payer && ` · ${travelers.find((t) => t.id === x.payer)?.name ?? ''}`}</div></div>
                <strong>{euro(x.amount)}</strong>
                <button className="icon-btn" onClick={() => patch((t) => ({ ...t, expenses: (t.expenses ?? []).filter((e) => e.id !== x.id) }))} aria-label={`Supprimer ${x.label}`}>×</button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="sub center">Le budget compte aussi les coûts des réservations et du programme.</p>
    </div>
  )
}
