import { useState } from 'react'
import { uid } from '../../lib/storage'
import type { PackItem, Traveler } from '../../lib/types'
import { ACTIVITIES, generatePacking, type Climate, type Dest } from './catalog'
import type { SectionProps } from './shared'

export default function Packing({ trip, patch, travelers }: SectionProps) {
  const [open, setOpen] = useState(trip.packing.length === 0)
  const [climate, setClimate] = useState<Climate>('doux')
  const [dest, setDest] = useState<Dest>('europe')
  const [acts, setActs] = useState<string[]>(['ville'])
  const [item, setItem] = useState('')
  const [who, setWho] = useState('')

  const toggle = (id: string) => patch((t) => ({ ...t, packing: t.packing.map((p) => (p.id === id ? { ...p, done: !p.done } : p)) }))
  const remove = (id: string) => patch((t) => ({ ...t, packing: t.packing.filter((p) => p.id !== id) }))

  const generate = () => {
    const have = new Set(trip.packing.map((p) => `${p.who ?? ''}|${p.label.toLowerCase()}`))
    const fresh = generatePacking(trip, travelers, { climate, activities: acts, dest }).filter((p) => !have.has(`${p.who ?? ''}|${p.label.toLowerCase()}`))
    patch((t) => ({ ...t, packing: [...t.packing, ...fresh] })); setOpen(false)
  }

  const groups: { key: string; title: string; items: PackItem[]; t?: Traveler }[] = [
    { key: 'all', title: '🧳 En commun', items: trip.packing.filter((p) => !p.who || !travelers.some((t) => t.id === p.who)) },
    ...travelers.map((t) => ({ key: t.id, title: `${t.kind === 'bebe' ? '👶' : t.kind === 'enfant' ? '🧒' : '🧑'} ${t.name}`, items: trip.packing.filter((p) => p.who === t.id), t })),
  ].filter((g) => g.items.length > 0)

  const done = trip.packing.filter((p) => p.done).length
  return (
    <div className="stack">
      {trip.packing.length > 0 && (
        <section className="panel stack">
          <div className="row between"><strong>{done}/{trip.packing.length} prêt{done > 1 ? 's' : ''}</strong>{done === trip.packing.length && <span className="pill" data-hot="false">Valise bouclée 🎉</span>}</div>
          <div className="bar"><span style={{ width: `${(done / trip.packing.length) * 100}%` }} /></div>
        </section>
      )}

      {groups.map((g) => {
        const gd = g.items.filter((p) => p.done).length
        return (
          <section key={g.key} className="panel">
            <div className="row between"><h3 className="panel-title">{g.title}</h3><span className="sub">{gd}/{g.items.length}</span></div>
            <ul className="list">
              {g.items.map((p) => (
                <li key={p.id} className={'item' + (p.done ? ' done' : '')}>
                  <label className="check">
                    <input type="checkbox" checked={p.done} onChange={() => toggle(p.id)} />
                    <span className="box" /><span className="label">{p.label}</span>
                  </label>
                  <button className="icon-btn" onClick={() => remove(p.id)} aria-label={`Supprimer ${p.label}`}>×</button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <form className="row add-form" onSubmit={(e) => { e.preventDefault(); if (item.trim()) { patch((t) => ({ ...t, packing: [...t.packing, { id: uid(), label: item.trim(), done: false, who: who || undefined }] })); setItem('') } }}>
        <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Ajouter à la valise…" />
        {travelers.length > 1 && <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Pour qui"><option value="">En commun</option>{travelers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>}
        <button className="btn primary">Ajouter</button>
      </form>

      {open ? (
        <section className="panel stack">
          <h3 className="panel-title">🪄 Générer ma valise</h3>
          <p className="sub">Une liste par voyageur, adaptée à la durée du séjour. Vous pouvez ensuite tout modifier.</p>
          <strong className="sub">Climat</strong>
          <div className="chips">{([['chaud', '☀️ Chaud'], ['doux', '🌤️ Doux / variable'], ['froid', '❄️ Froid']] as const).map(([k, l]) => <button key={k} className={'chip' + (climate === k ? ' on' : '')} onClick={() => setClimate(k)}>{l}</button>)}</div>
          <strong className="sub">Destination</strong>
          <div className="chips">{([['france', '🇫🇷 France'], ['europe', '🇪🇺 Europe'], ['monde', '🌍 Hors Europe']] as const).map(([k, l]) => <button key={k} className={'chip' + (dest === k ? ' on' : '')} onClick={() => setDest(k)}>{l}</button>)}</div>
          <strong className="sub">Activités</strong>
          <div className="chips">{ACTIVITIES.map((a) => <button key={a.id} className={'chip' + (acts.includes(a.id) ? ' on' : '')} aria-pressed={acts.includes(a.id)} onClick={() => setActs((x) => (x.includes(a.id) ? x.filter((y) => y !== a.id) : [...x, a.id]))}>{a.label}</button>)}</div>
          <div className="row">
            <button className="btn primary" onClick={generate}>Générer la liste</button>
            {trip.packing.length > 0 && <button className="btn ghost" onClick={() => setOpen(false)}>Annuler</button>}
          </div>
        </section>
      ) : (
        <button className="btn" onClick={() => setOpen(true)}>🪄 Générer / compléter la valise</button>
      )}
    </div>
  )
}
