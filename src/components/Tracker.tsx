import { useState } from 'react'
import Avatar from './Avatar'
import { PhotoThumb } from './Photo'
import type { Household } from '../lib/household'
import { addDays, daysBetween, fmtShort, iso, parse } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { TrackerRecord, TrackerSubject } from '../lib/types'
import { TRACKERS, type TrackerConfig } from '../modules/trackers'

export function useTracker(key: string) {
  const [subjects, setSubjects] = useStored<TrackerSubject[]>(key, [])
  const [records, setRecords] = useStored<TrackerRecord[]>(key + '-log', [])
  return { subjects, setSubjects, records, setRecords }
}

export interface Due { subject: TrackerSubject; kind: string; next: string; days: number }

/**
 * Échéances à venir : pour chaque (sujet, type), seul le DERNIER suivi compte.
 * Enregistrer un nouveau vaccin avec une nouvelle échéance remplace donc l'ancienne.
 */
export function dueItems(subjects: TrackerSubject[], records: TrackerRecord[], horizonDays = 30): Due[] {
  const latest = new Map<string, TrackerRecord>()
  for (const r of records) {
    const k = r.subject + '|' + r.kind
    const cur = latest.get(k)
    if (!cur || r.date >= cur.date) latest.set(k, r)
  }
  const out: Due[] = []
  for (const r of latest.values()) {
    const subject = subjects.find((s) => s.id === r.subject)
    if (!subject || !r.next) continue
    const days = daysBetween(new Date(), parse(r.next))
    if (r.kind === 'rdv' && days < 0) continue // un rendez-vous passé n'est pas en retard
    if (days <= horizonDays) out.push({ subject, kind: r.kind, next: r.next, days })
  }
  return out.sort((a, b) => a.days - b.days)
}

/** Échéances de toutes les mini-applis "suivi", par clé. (TRACKERS est constant : l'ordre des hooks ne change pas.) */
export function useDues(horizonDays = 30) {
  const out: Record<string, (Due & { icon: string })[]> = {}
  for (const c of TRACKERS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { subjects, records } = useTracker(c.key)
    out[c.key] = dueItems(subjects, records, horizonDays).map((d) => ({ ...d, icon: c.kinds.find((k) => k.id === d.kind.split(':')[0])?.icon ?? c.emojis[0] }))
  }
  return out
}

const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const when = (days: number) => (days < 0 ? `en retard de ${-days} j` : days === 0 ? "aujourd'hui" : days === 1 ? 'demain' : `dans ${days} j`)

export default function Tracker({ config, household }: { config: TrackerConfig; household: Household }) {
  const { subjects, setSubjects, records, setRecords } = useTracker(config.key)
  const { members, current } = household
  const kindOf = (id: string) => config.kinds.find((k) => k.id === id) ?? config.kinds[config.kinds.length - 1]

  const [addingSubject, setAddingSubject] = useState(false)
  const [sName, setSName] = useState('')
  const [sEmoji, setSEmoji] = useState(config.emojis[0])
  const [sExtra, setSExtra] = useState('')

  const [logFor, setLogFor] = useState<string | null>(null)
  const [kind, setKind] = useState(config.kinds[0].id)
  const [date, setDate] = useState(iso(new Date()))
  const [next, setNext] = useState('')
  const [metric, setMetric] = useState('')
  const [cost, setCost] = useState('')
  const [note, setNote] = useState('')

  const dues = dueItems(subjects, records)
  const year = String(new Date().getFullYear())

  const pickKind = (id: string, d = date) => {
    setKind(id)
    const every = kindOf(id).everyDays
    setNext(every ? iso(addDays(parse(d), every)) : '')
  }
  const openLog = (id: string) => {
    setLogFor(id); setDate(iso(new Date())); pickKind(config.kinds[0].id, iso(new Date())); setMetric(''); setCost(''); setNote('')
  }
  const saveLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!logFor) return
    setRecords((rs) => [...rs, {
      id: uid(), subject: logFor, kind, date, next,
      metric: metric ? Number(metric) : undefined, cost: cost ? Number(cost) : undefined, note: note.trim(), by: current.id,
    }])
    setLogFor(null)
  }
  const addSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sName.trim()) return
    setSubjects((ss) => [...ss, { id: uid(), name: sName.trim(), emoji: sEmoji, extra: sExtra.trim() }])
    setSName(''); setSExtra(''); setAddingSubject(false)
  }

  return (
    <div className="stack">
      {subjects.length === 0 && !addingSubject && <p className="empty">{config.empty}</p>}

      {subjects.map((s) => {
        const mine = records.filter((r) => r.subject === s.id).sort((a, b) => b.date.localeCompare(a.date))
        const myDues = dues.filter((d) => d.subject.id === s.id)
        const lastMetric = mine.find((r) => r.metric !== undefined)
        const spent = mine.filter((r) => r.date.startsWith(year)).reduce((t, r) => t + (r.cost ?? 0), 0)
        return (
          <section key={s.id} className="panel stack">
            <div className="row between nowrap">
              <div className="row nowrap" style={{ alignItems: 'center', minWidth: 0 }}>
                <PhotoThumb id={s.photo} fallback={s.emoji} size={48} onChange={(photo) => setSubjects((ss) => ss.map((x) => (x.id === s.id ? { ...x, photo } : x)))} />
                <div>
                  <strong>{s.name}</strong>
                  <div className="sub">
                    {s.extra && (config.extraType === 'date' ? `${config.extraLabel} ${fmtShort(parse(s.extra))} · ` : `${s.extra} · `)}
                    {lastMetric && `${config.metric?.label} : ${lastMetric.metric} ${config.metric?.unit} · `}
                    {euro(spent)} en {year}
                  </div>
                </div>
              </div>
              <button className="icon-btn" onClick={() => confirm(`Supprimer ${s.name} et son historique ?`) && (setSubjects((ss) => ss.filter((x) => x.id !== s.id)), setRecords((rs) => rs.filter((r) => r.subject !== s.id)))} aria-label={`Supprimer ${s.name}`}>×</button>
            </div>

            {myDues.length > 0 && (
              <div className="stack" style={{ gap: 6 }}>
                {myDues.map((d) => (
                  <div key={d.kind} className="row" style={{ alignItems: 'center' }}>
                    <span>{kindOf(d.kind).icon} {kindOf(d.kind).label}</span>
                    <span className="pill" data-hot={d.days <= 7}>{when(d.days)}</span>
                    <span className="sub">{fmtShort(parse(d.next))}</span>
                  </div>
                ))}
              </div>
            )}

            {logFor === s.id ? (
              <form className="stack" onSubmit={saveLog}>
                <div className="chips" role="group" aria-label="Type">
                  {config.kinds.map((k) => (
                    <button type="button" key={k.id} className={'chip' + (kind === k.id ? ' on' : '')} onClick={() => pickKind(k.id)}>{k.icon} {k.label}</button>
                  ))}
                </div>
                <div className="row">
                  <label className="field">Date
                    <input type="date" value={date} onChange={(e) => { setDate(e.target.value); const ev = kindOf(kind).everyDays; if (ev) setNext(iso(addDays(parse(e.target.value), ev))) }} />
                  </label>
                  <label className="field">Prochaine échéance
                    <input type="date" value={next} min={date} onChange={(e) => setNext(e.target.value)} />
                  </label>
                </div>
                <div className="row">
                  {config.metric && (
                    <label className="field">{config.metric.label} ({config.metric.unit})
                      <input type="number" min={0} step="any" value={metric} onChange={(e) => setMetric(e.target.value)} style={{ width: 130 }} />
                    </label>
                  )}
                  <label className="field">Coût (€)
                    <input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 110 }} />
                  </label>
                </div>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note — facultatif" />
                <div className="row">
                  <button className="btn primary small">Enregistrer</button>
                  <button type="button" className="btn ghost small" onClick={() => setLogFor(null)}>Annuler</button>
                </div>
              </form>
            ) : (
              <button className="btn small" onClick={() => openLog(s.id)}>+ Ajouter un suivi</button>
            )}

            {mine.length > 0 && (
              <ul className="list">
                {mine.slice(0, 5).map((r) => {
                  const by = members.find((m) => m.id === r.by)
                  return (
                    <li key={r.id} className="item">
                      <span>{kindOf(r.kind).icon}</span>
                      <div className="grow">
                        <strong>{kindOf(r.kind).label}</strong>
                        <div className="sub">
                          {fmtShort(parse(r.date))}
                          {r.metric !== undefined && ` · ${r.metric} ${config.metric?.unit}`}
                          {r.cost !== undefined && ` · ${euro(r.cost)}`}
                          {r.note && ` · ${r.note}`}
                        </div>
                      </div>
                      {by && <Avatar m={by} />}
                      <button className="icon-btn" onClick={() => setRecords((rs) => rs.filter((x) => x.id !== r.id))} aria-label="Supprimer">×</button>
                    </li>
                  )
                })}
                {mine.length > 5 && <li className="sub">+ {mine.length - 5} plus ancien{mine.length - 5 > 1 ? 's' : ''}</li>}
              </ul>
            )}
          </section>
        )
      })}

      {addingSubject ? (
        <form className="panel stack" onSubmit={addSubject}>
          <h3 className="panel-title">{config.newLabel}</h3>
          <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Nom" autoFocus />
          <div className="chips">
            {config.emojis.map((e) => <button type="button" key={e} className={'chip emoji' + (sEmoji === e ? ' on' : '')} onClick={() => setSEmoji(e)}>{e}</button>)}
          </div>
          <label className="field">{config.extraLabel} (facultatif)
            <input type={config.extraType} value={sExtra} onChange={(e) => setSExtra(e.target.value)} />
          </label>
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAddingSubject(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAddingSubject(true)}>{config.addLabel}</button>
      )}
    </div>
  )
}
