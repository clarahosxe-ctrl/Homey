import { useState } from 'react'
import Avatar from '../components/Avatar'
import type { Household } from '../lib/household'
import { fmtShort, iso, parse } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Txn } from '../lib/types'

export const useTxns = () => useStored<Txn[]>('txns', [])
const useTarget = () => useStored<number>('budget-target', 0)

const CATEGORIES = ['🛒 Courses', '🏠 Logement', '🚗 Transport', '🍽️ Restaurants', '🎉 Loisirs', '🩺 Santé', '🔁 Abonnements', '🧒 Enfants', '🎁 Cadeaux', '📦 Autre']
export const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

export const monthKey = (offset: number) => {
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + offset)
  return iso(d).slice(0, 7)
}

export default function Budget({ household }: { household: Household }) {
  const [txns, setTxns] = useTxns()
  const [target, setTarget] = useTarget()
  const { members, current } = household
  const [offset, setOffset] = useState(0)
  const [adding, setAdding] = useState(false)
  const [income, setIncome] = useState(false)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [by, setBy] = useState(current.id)
  const [shared, setShared] = useState(true)
  const [date, setDate] = useState(iso(new Date()))

  const month = monthKey(offset)
  const list = txns.filter((t) => t.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date))
  const expenses = list.filter((t) => !t.income)
  const spent = expenses.reduce((s, t) => s + t.amount, 0)
  const earned = list.filter((t) => t.income).reduce((s, t) => s + t.amount, 0)

  const byCat = CATEGORIES.map((c) => ({ c, v: expenses.filter((t) => t.category === c).reduce((s, t) => s + t.amount, 0) }))
    .filter((x) => x.v > 0).sort((a, b) => b.v - a.v)

  // Équilibre : dépenses communes réparties à parts égales entre les membres.
  const sharedList = expenses.filter((t) => t.shared)
  const sharedTotal = sharedList.reduce((s, t) => s + t.amount, 0)
  const fair = members.length ? sharedTotal / members.length : 0
  const nets = members.map((m) => ({ m, net: sharedList.filter((t) => t.by === m.id).reduce((s, t) => s + t.amount, 0) - fair }))
  const creditor = [...nets].sort((a, b) => b.net - a.net)[0]
  const debtor = [...nets].sort((a, b) => a.net - b.net)[0]

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const n = Number(amount.replace(',', '.'))
    if (!label.trim() || !(n > 0)) return
    setTxns((ts) => [...ts, { id: uid(), date, label: label.trim(), amount: n, category: income ? '💰 Revenu' : category, by, shared: income ? false : shared, income }])
    setLabel(''); setAmount(''); setAdding(false)
  }

  const monthLabel = parse(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const pct = target > 0 ? Math.min(100, (spent / target) * 100) : 0

  return (
    <div className="stack">
      <div className="row between">
        <strong style={{ textTransform: 'capitalize' }}>{monthLabel}</strong>
        <div className="row">
          {offset !== 0 && <button className="link" onClick={() => setOffset(0)}>Ce mois-ci</button>}
          <button className="round" onClick={() => setOffset(offset - 1)} aria-label="Mois précédent">‹</button>
          <button className="round" onClick={() => setOffset(offset + 1)} aria-label="Mois suivant">›</button>
        </div>
      </div>

      <section className="panel stack">
        <div className="row between">
          <div><div className="sub">Dépensé</div><div className="big-num">{euro(spent)}</div></div>
          {earned > 0 && <div style={{ textAlign: 'right' }}><div className="sub">Revenus</div><div className="big-num ok">{euro(earned)}</div></div>}
        </div>
        {target > 0 && (
          <>
            <div className="bar"><span style={{ width: `${pct}%`, background: spent > target ? '#c0392b' : 'var(--accent)' }} /></div>
            <div className="sub">{spent > target ? `Dépassé de ${euro(spent - target)}` : `Reste ${euro(target - spent)} sur ${euro(target)}`}</div>
          </>
        )}
        <label className="field">Budget mensuel visé (€)
          <input type="number" min={0} value={target || ''} onChange={(e) => setTarget(Number(e.target.value))} placeholder="Ex. 2000" style={{ width: 150 }} />
        </label>
      </section>

      {byCat.length > 0 && (
        <section className="panel stack">
          <h3 className="panel-title">Par catégorie</h3>
          {byCat.map(({ c, v }) => (
            <div key={c} className="stack" style={{ gap: 3 }}>
              <div className="row between"><span>{c}</span><strong>{euro(v)}</strong></div>
              <div className="bar thin"><span style={{ width: `${(v / byCat[0].v) * 100}%` }} /></div>
            </div>
          ))}
        </section>
      )}

      {members.length > 1 && sharedTotal > 0 && (
        <section className="panel stack">
          <h3 className="panel-title">Équilibre du foyer</h3>
          {nets.map(({ m, net }) => (
            <div key={m.id} className="row" style={{ alignItems: 'center' }}>
              <Avatar m={m} /><span className="grow">{m.name}</span>
              <strong className={net >= 0 ? 'ok' : 'bad'}>{net >= 0 ? '+' : '−'}{euro(Math.abs(net))}</strong>
            </div>
          ))}
          {creditor && debtor && creditor.net - debtor.net > 0.005 && (
            <p className="sub">👉 {debtor.m.name} doit {euro(Math.min(-debtor.net, creditor.net))} à {creditor.m.name} pour être à égalité.</p>
          )}
          <p className="sub">Calculé sur les dépenses « communes » du mois, à parts égales.</p>
        </section>
      )}

      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <div className="chips">
            <button type="button" className={'chip' + (!income ? ' on' : '')} onClick={() => setIncome(false)}>Dépense</button>
            <button type="button" className={'chip' + (income ? ' on' : '')} onClick={() => setIncome(true)}>Revenu</button>
          </div>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={income ? 'Ex. Salaire' : 'Ex. Supermarché'} autoFocus />
          <div className="row">
            <label className="field">Montant (€)
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" style={{ width: 120 }} />
            </label>
            <label className="field">Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          </div>
          {!income && (
            <>
              <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Catégorie">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <div className="row">
                <label className="field">Payé par
                  <select value={by} onChange={(e) => setBy(e.target.value)}>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </label>
                <label className="check inline">
                  <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} />
                  <span className="box" /> <span>Dépense commune</span>
                </label>
              </div>
            </>
          )}
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => { setAdding(true); setBy(current.id); setDate(offset === 0 ? iso(new Date()) : month + '-01') }}>+ Ajouter</button>
      )}

      {list.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">Opérations</h3>
          <ul className="list">
            {list.map((t) => {
              const m = members.find((x) => x.id === t.by)
              return (
                <li key={t.id} className="item">
                  <div className="grow">
                    <strong>{t.label}</strong>
                    <div className="sub">{fmtShort(parse(t.date))} · {t.category}{!t.income && !t.shared && ' · perso'}</div>
                  </div>
                  {m && !t.income && <Avatar m={m} title={`Payé par ${m.name}`} />}
                  <strong className={t.income ? 'ok' : ''}>{t.income ? '+' : '−'}{euro(t.amount)}</strong>
                  <button className="icon-btn" onClick={() => setTxns((ts) => ts.filter((x) => x.id !== t.id))} aria-label={`Supprimer ${t.label}`}>×</button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
      {list.length === 0 && !adding && <p className="empty">Aucune opération ce mois-ci 💶</p>}
    </div>
  )
}

