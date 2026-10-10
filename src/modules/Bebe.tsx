import { useState } from 'react'
import Avatar from '../components/Avatar'
import { PhotoMini, PhotoThumb } from '../components/Photo'
import type { Household } from '../lib/household'
import { addDays, daysBetween, fmtShort, iso, parse } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Baby, BabyKind, BabyLog } from '../lib/types'

export const useBabies = () => useStored<Baby[]>('babies', [])
export const useBabyLog = () => useStored<BabyLog[]>('baby-log', [])

const pad = (n: number) => String(n).padStart(2, '0')
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const stamp = (day: string) => `${day}T${hhmm(new Date())}` // jour affiché + heure actuelle
const at = (s: string) => new Date(s)

const ago = (from: Date) => {
  const min = Math.max(0, Math.round((Date.now() - from.getTime()) / 60000))
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${pad(min % 60)}`
}

function age(birth: string) {
  const b = parse(birth), t = new Date()
  const days = daysBetween(b, t)
  if (days < 0) return 'à naître'
  if (days < 31) return `${days} jour${days > 1 ? 's' : ''}`
  let months = (t.getFullYear() - b.getFullYear()) * 12 + t.getMonth() - b.getMonth()
  if (t.getDate() < b.getDate()) months--
  if (months < 24) return `${months} mois`
  return `${Math.floor(months / 12)} ans`
}

/** Pastille du dashboard : temps écoulé depuis le dernier repas du 1er bébé. */
export function lastFeedBadge(babies: Baby[], log: BabyLog[]) {
  const b = babies[0]
  if (!b) return undefined
  const last = log.filter((l) => l.baby === b.id && (l.kind === 'biberon' || l.kind === 'tetee')).sort((x, y) => y.at.localeCompare(x.at))[0]
  if (!last) return undefined
  const min = Math.round((Date.now() - at(last.at).getTime()) / 60000)
  if (min < 0 || min > 24 * 60) return undefined
  return min < 60 ? `${min}min` : `${Math.floor(min / 60)}h`
}

const MILESTONES = ['Premier sourire', 'Premier rire', 'Se retourne', 'Tient assis', 'Premier mot', 'Premiers pas', 'Première dent', 'Premier bain']

export default function Bebe({ household }: { household: Household }) {
  const [babies, setBabies] = useBabies()
  const [log, setLog] = useBabyLog()
  const { members, current } = household
  const [selId, setSelId] = useState<string | null>(null)
  const [tab, setTab] = useState<'jour' | 'croissance' | 'jalons'>('jour')
  const [offset, setOffset] = useState(0)
  const [open, setOpen] = useState<'biberon' | 'tetee' | null>(null)
  const [amount, setAmount] = useState('')
  const [adding, setAdding] = useState(false)
  const [nName, setNName] = useState('')
  const [nBirth, setNBirth] = useState(iso(new Date()))
  const [mDate, setMDate] = useState(iso(new Date()))
  const [mWeight, setMWeight] = useState('')
  const [mHeight, setMHeight] = useState('')
  const [jTitle, setJTitle] = useState('')
  const [jDate, setJDate] = useState(iso(new Date()))
  const [jPhoto, setJPhoto] = useState<string | undefined>()

  const baby = babies.find((b) => b.id === selId) ?? babies[0]
  const day = iso(addDays(new Date(), offset))

  const addBaby = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nName.trim()) return
    const id = uid()
    setBabies((bs) => [...bs, { id, name: nName.trim(), birth: nBirth }])
    setSelId(id); setNName(''); setAdding(false)
  }

  if (!baby || adding) {
    return (
      <form className="panel stack" onSubmit={addBaby}>
        <h3 className="panel-title">{babies.length ? 'Nouveau bébé' : 'Bienvenue petit bout 👶'}</h3>
        <input value={nName} onChange={(e) => setNName(e.target.value)} placeholder="Prénom" autoFocus />
        <label className="field">Date de naissance<input type="date" value={nBirth} onChange={(e) => setNBirth(e.target.value)} /></label>
        <div className="row">
          <button className="btn primary">Ajouter</button>
          {adding && <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>}
        </div>
      </form>
    )
  }

  const mine = log.filter((l) => l.baby === baby.id)
  const push = (l: Omit<BabyLog, 'id' | 'baby' | 'note' | 'by'> & { note?: string }) =>
    setLog((ls) => [...ls, { id: uid(), baby: baby.id, note: '', by: current.id, ...l }])

  const todays = mine.filter((l) => l.at.startsWith(day) && (l.kind !== 'mesure' && l.kind !== 'jalon')).sort((a, b) => b.at.localeCompare(a.at))
  const sum = (k: BabyKind) => todays.filter((l) => l.kind === k)
  const ml = sum('biberon').reduce((t, l) => t + (l.value ?? 0), 0)
  const couches = sum('couche')
  const sleepMin = sum('sommeil').reduce((t, l) => t + Math.max(0, Math.round(((l.end ? at(l.end) : new Date()).getTime() - at(l.at).getTime()) / 60000)), 0)
  const sleeping = mine.find((l) => l.kind === 'sommeil' && !l.end)
  const lastFeed = mine.filter((l) => l.kind === 'biberon' || l.kind === 'tetee').sort((a, b) => b.at.localeCompare(a.at))[0]
  const lastMl = [...mine].reverse().find((l) => l.kind === 'biberon')?.value

  const submitFeed = (e: React.FormEvent) => {
    e.preventDefault()
    const v = Number(amount)
    if (!open || !(v > 0)) return
    push({ kind: open, at: stamp(day), value: v })
    setOpen(null); setAmount('')
  }

  const label = (l: BabyLog) => {
    switch (l.kind) {
      case 'biberon': return `🍼 Biberon · ${l.value} ml`
      case 'tetee': return `🤱 Tétée · ${l.value} min`
      case 'couche': return `🧷 Couche · ${l.detail === 'selle' ? 'selle' : l.detail === 'mixte' ? 'pipi + selle' : 'pipi'}`
      case 'sommeil': return l.end ? `😴 Sommeil · ${hhmm(at(l.at))} → ${hhmm(at(l.end))}` : `😴 Dort depuis ${hhmm(at(l.at))}`
      default: return l.kind
    }
  }

  const measures = mine.filter((l) => l.kind === 'mesure').sort((a, b) => a.at.localeCompare(b.at))
  const jalons = mine.filter((l) => l.kind === 'jalon').sort((a, b) => b.at.localeCompare(a.at))

  return (
    <div className="stack">
      <section className="panel row between" style={{ alignItems: 'center' }}>
        <div className="row nowrap" style={{ alignItems: 'center' }}>
          <PhotoThumb id={baby.photo} fallback="👶" size={60} round onChange={(photo) => setBabies((bs) => bs.map((b) => (b.id === baby.id ? { ...b, photo } : b)))} />
          <div>
            <strong style={{ fontSize: '1.25rem' }}>{baby.name}</strong>
            <div className="sub">{age(baby.birth)} · né(e) le {fmtShort(parse(baby.birth))}</div>
          </div>
        </div>
        <div className="row">
          {babies.length > 1 && babies.map((b) => <button key={b.id} className={'chip' + (b.id === baby.id ? ' on' : '')} onClick={() => setSelId(b.id)}>{b.name}</button>)}
          <button className="round" onClick={() => setAdding(true)} aria-label="Ajouter un bébé">+</button>
        </div>
      </section>

      <div className="chips">
        {(['jour', 'croissance', 'jalons'] as const).map((t) => (
          <button key={t} className={'chip' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t === 'jour' ? 'Journée' : t === 'croissance' ? 'Croissance' : 'Premières fois'}</button>
        ))}
      </div>

      {tab === 'jour' && (
        <>
          <div className="row between">
            <strong>{offset === 0 ? "Aujourd'hui" : parse(day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
            <div className="row">
              {offset !== 0 && <button className="link" onClick={() => setOffset(0)}>Aujourd’hui</button>}
              <button className="round" onClick={() => setOffset(offset - 1)} aria-label="Jour précédent">‹</button>
              <button className="round" onClick={() => setOffset(Math.min(0, offset + 1))} aria-label="Jour suivant" disabled={offset === 0}>›</button>
            </div>
          </div>

          <div className="sum panel">
            <div><strong>{ml}</strong><span>ml biberons</span></div>
            <div><strong>{sum('tetee').length}</strong><span>tétées</span></div>
            <div><strong>{couches.length}</strong><span>couches</span></div>
            <div><strong>{Math.floor(sleepMin / 60)}h{pad(sleepMin % 60)}</strong><span>sommeil</span></div>
          </div>
          {lastFeed && <p className="sub center">Dernier repas il y a <strong>{ago(at(lastFeed.at))}</strong></p>}

          <div className="quick">
            <button className={open === 'biberon' ? 'on' : ''} onClick={() => { setOpen(open === 'biberon' ? null : 'biberon'); setAmount(String(lastMl ?? 120)) }}><span>🍼</span>Biberon</button>
            <button className={open === 'tetee' ? 'on' : ''} onClick={() => { setOpen(open === 'tetee' ? null : 'tetee'); setAmount('10') }}><span>🤱</span>Tétée</button>
            {sleeping ? (
              <button className="on" onClick={() => setLog((ls) => ls.map((l) => (l.id === sleeping.id ? { ...l, end: stamp(iso(new Date())) } : l)))}><span>☀️</span>Réveil ({ago(at(sleeping.at))})</button>
            ) : (
              <button onClick={() => push({ kind: 'sommeil', at: stamp(day) })}><span>😴</span>Dodo</button>
            )}
          </div>
          <div className="chips" role="group" aria-label="Couche">
            <span className="sub" style={{ alignSelf: 'center' }}>🧷 Couche :</span>
            {[['pipi', '💧 Pipi'], ['selle', '💩 Selle'], ['mixte', '💧💩 Les deux']].map(([d, l]) => (
              <button key={d} className="chip" onClick={() => push({ kind: 'couche', at: stamp(day), detail: d })}>{l}</button>
            ))}
          </div>

          {open && (
            <form className="panel stack" onSubmit={submitFeed}>
              <div className="chips">
                {(open === 'biberon' ? [60, 90, 120, 150, 180, 210] : [5, 10, 15, 20, 30]).map((v) => (
                  <button type="button" key={v} className={'chip' + (amount === String(v) ? ' on' : '')} onClick={() => setAmount(String(v))}>{v} {open === 'biberon' ? 'ml' : 'min'}</button>
                ))}
              </div>
              <div className="row">
                <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: 110 }} aria-label="Quantité" />
                <button className="btn primary">Ajouter</button>
              </div>
            </form>
          )}

          {todays.length > 0 && (
            <section className="panel">
              <ul className="list">
                {todays.map((l) => {
                  const by = members.find((m) => m.id === l.by)
                  return (
                    <li key={l.id} className="item">
                      <span className="sub" style={{ width: 44 }}>{hhmm(at(l.at))}</span>
                      <div className="grow">{label(l)}</div>
                      {by && <Avatar m={by} />}
                      <button className="icon-btn" onClick={() => setLog((ls) => ls.filter((x) => x.id !== l.id))} aria-label="Supprimer">×</button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {tab === 'croissance' && (
        <>
          <form className="panel stack" onSubmit={(e) => {
            e.preventDefault()
            if (!mWeight && !mHeight) return
            push({ kind: 'mesure', at: `${mDate}T12:00`, weight: mWeight ? Number(mWeight.replace(',', '.')) : undefined, height: mHeight ? Number(mHeight.replace(',', '.')) : undefined })
            setMWeight(''); setMHeight('')
          }}>
            <h3 className="panel-title">Nouvelle mesure</h3>
            <div className="row">
              <label className="field">Date<input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} /></label>
              <label className="field">Poids (kg)<input value={mWeight} onChange={(e) => setMWeight(e.target.value)} inputMode="decimal" style={{ width: 100 }} /></label>
              <label className="field">Taille (cm)<input value={mHeight} onChange={(e) => setMHeight(e.target.value)} inputMode="decimal" style={{ width: 100 }} /></label>
            </div>
            <button className="btn primary">Ajouter</button>
          </form>
          {measures.length === 0 ? <p className="empty">Pas encore de mesure 📏</p> : (
            <section className="panel">
              <ul className="list">
                {[...measures].reverse().map((m) => {
                  const idx = measures.indexOf(m)
                  const prev = measures.slice(0, idx).reverse().find((x) => x.weight !== undefined)
                  const dg = m.weight !== undefined && prev?.weight !== undefined ? Math.round((m.weight - prev.weight) * 1000) : null
                  return (
                    <li key={m.id} className="item">
                      <div className="grow">
                        <strong>{m.weight !== undefined && `${m.weight} kg`}{m.weight !== undefined && m.height !== undefined && ' · '}{m.height !== undefined && `${m.height} cm`}</strong>
                        <div className="sub">{fmtShort(parse(m.at.slice(0, 10)))}{dg !== null && ` · ${dg >= 0 ? '+' : '−'}${Math.abs(dg)} g depuis la dernière pesée`}</div>
                      </div>
                      <button className="icon-btn" onClick={() => setLog((ls) => ls.filter((x) => x.id !== m.id))} aria-label="Supprimer">×</button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {tab === 'jalons' && (
        <>
          <form className="panel stack" onSubmit={(e) => {
            e.preventDefault()
            if (!jTitle.trim()) return
            push({ kind: 'jalon', at: `${jDate}T12:00`, note: jTitle.trim(), photo: jPhoto })
            setJTitle(''); setJPhoto(undefined)
          }}>
            <h3 className="panel-title">Une première fois ⭐</h3>
            <div className="chips">
              {MILESTONES.map((m) => <button type="button" key={m} className={'chip' + (jTitle === m ? ' on' : '')} onClick={() => setJTitle(m)}>{m}</button>)}
            </div>
            <div className="row">
              <input value={jTitle} onChange={(e) => setJTitle(e.target.value)} placeholder="Ou écrivez la vôtre…" className="grow" />
              <input type="date" value={jDate} onChange={(e) => setJDate(e.target.value)} />
            </div>
            <div className="row" style={{ alignItems: 'center' }}><PhotoThumb id={jPhoto} fallback="📷" size={56} onChange={setJPhoto} label="Ajouter une photo" /><span className="sub">Photo (facultatif)</span></div>
            <button className="btn primary">Ajouter</button>
          </form>
          {jalons.length === 0 ? <p className="empty">Gardez ici les moments à ne pas oublier ⭐</p> : (
            <section className="panel">
              <ul className="list">
                {jalons.map((j) => (
                  <li key={j.id} className="item">
                    <PhotoMini id={j.photo} fallback="⭐" size={52} />
                    <div className="grow"><strong>{j.note}</strong><div className="sub">{parse(j.at.slice(0, 10)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · à {ageAt(baby.birth, j.at.slice(0, 10))}</div></div>
                    <button className="icon-btn" onClick={() => setLog((ls) => ls.filter((x) => x.id !== j.id))} aria-label="Supprimer">×</button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

/** Âge à une date donnée (pour les premières fois). */
function ageAt(birth: string, date: string) {
  const days = daysBetween(parse(birth), parse(date))
  if (days < 0) return '—'
  if (days < 31) return `${days} j`
  const b = parse(birth), d = parse(date)
  let months = (d.getFullYear() - b.getFullYear()) * 12 + d.getMonth() - b.getMonth()
  if (d.getDate() < b.getDate()) months--
  return months < 24 ? `${months} mois` : `${Math.floor(months / 12)} ans`
}
