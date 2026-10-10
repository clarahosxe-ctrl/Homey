import { useEffect, useState } from 'react'
import { weatherIcon } from '../../components/Weather'
import { addDays, daysBetween, DAY_SHORT, fmtShort, iso, parse } from '../../lib/dates'
import { uid } from '../../lib/storage'
import type { Trip, Traveler } from '../../lib/types'
import { costLines, type SectionProps } from './shared'

interface Day { date: string; code: number; min: number; max: number; rain: number }

function TripWeather({ trip, patch }: Pick<SectionProps, 'trip' | 'patch'>) {
  const [days, setDays] = useState<Day[] | null>(null)
  const [state, setState] = useState<'load' | 'far' | 'past' | 'error'>('load')
  const left = daysBetween(new Date(), parse(trip.from))
  const past = daysBetween(new Date(), parse(trip.to)) < 0
  const q = trip.destination.trim()

  useEffect(() => {
    if (past) return void setState('past')
    if (left > 15) return void setState('far')
    if (!q) return void setState('error')
    let cancelled = false
    ;(async () => {
      try {
        let geo = trip.geo
        if (!geo) {
          const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=fr`)
          const hit = (await r.json()).results?.[0]
          if (!hit) return void (!cancelled && setState('error'))
          geo = { lat: hit.latitude, lon: hit.longitude, label: hit.name }
          patch((t) => ({ ...t, geo }))
        }
        const f = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`)
        const d = (await f.json()).daily
        if (cancelled) return
        const all: Day[] = d.time.map((t: string, i: number) => ({ date: t, code: d.weather_code[i], max: Math.round(d.temperature_2m_max[i]), min: Math.round(d.temperature_2m_min[i]), rain: d.precipitation_probability_max[i] ?? 0 }))
        setDays(all.filter((x) => x.date >= trip.from && x.date <= trip.to))
        setState('load')
      } catch { if (!cancelled) setState('error') }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, trip.from, trip.to, trip.geo?.lat])

  if (past) return null
  return (
    <section className="panel stack">
      <h3 className="panel-title">🌤️ Météo à destination{trip.geo ? ` · ${trip.geo.label}` : ''}</h3>
      {state === 'far' && <p className="sub">Les prévisions sont disponibles à partir de 15 jours avant le départ (dans {left - 15} jours).</p>}
      {state === 'error' && <p className="sub">Météo indisponible. Renseignez une destination (ville) pour l’afficher.</p>}
      {state === 'load' && !days && <p className="sub">Chargement…</p>}
      {days && days.length === 0 && <p className="sub">Pas de prévision pour ces dates.</p>}
      {days && days.length > 0 && (
        <div className="trip-wx">
          {days.map((d) => (
            <div key={d.date} className="wk-day">
              <span className="sub">{DAY_SHORT[parse(d.date).getDay()]} {d.date.slice(8)}</span>
              <span className="wk-icon">{weatherIcon(d.code)}</span>
              <strong>{d.max}°</strong><span className="sub">{d.min}°</span>
              {d.rain >= 40 && <span className="rain">💧{d.rain}%</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function docAlert(t: Traveler, trip: Trip) {
  if (!t.doc) return null
  const label = t.doc === 'cni' ? 'Carte d’identité' : 'Passeport'
  if (!t.docExpiry) return { hot: false, text: `${label} : date d’expiration à renseigner` }
  if (t.docExpiry < trip.from) return { hot: true, text: `${label} de ${t.name} déjà expiré` }
  if (t.docExpiry < trip.to) return { hot: true, text: `${label} de ${t.name} expire avant le retour (${fmtShort(parse(t.docExpiry))})` }
  if (t.docExpiry < iso(addDays(parse(trip.to), 183))) return { hot: false, text: `${label} de ${t.name} : moins de 6 mois de validité au retour (certains pays l’exigent)` }
  return null
}

export default function Overview({ trip, patch, household, travelers }: SectionProps) {
  const { members } = household
  const [guest, setGuest] = useState('')
  const setTravelers = (fn: (ts: Traveler[]) => Traveler[]) => patch((t) => ({ ...t, travelers: fn(t.travelers ?? travelers) }))
  const upd = (id: string, p: Partial<Traveler>) => setTravelers((ts) => ts.map((x) => (x.id === id ? { ...x, ...p } : x)))

  const today = iso(new Date())
  const lines = costLines(trip)
  const planned = lines.reduce((s, l) => s + l.amount, 0)
  const alerts = [
    ...travelers.map((t) => docAlert(t, trip)).filter((a): a is { hot: boolean; text: string } => !!a),
    ...(trip.todos ?? []).filter((x) => !x.done && x.due && x.due < today).map((x) => ({ hot: true, text: `À faire : ${x.label} (échéance ${fmtShort(parse(x.due!))})` })),
    ...((trip.bookings ?? []).some((b) => b.kind === 'hebergement') || daysBetween(parse(trip.from), parse(trip.to)) < 1 ? [] : [{ hot: false, text: 'Aucun hébergement réservé pour l’instant' }]),
  ]
  const nights = Math.max(0, daysBetween(parse(trip.from), parse(trip.to)))
  const packed = trip.packing.filter((p) => p.done).length

  return (
    <div className="stack">
      <section className="panel stats" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
        <div className="stat" style={{ borderTopColor: 'var(--accent)' }}><strong>{nights} nuit{nights > 1 ? 's' : ''}</strong><span>{travelers.length} voyageur{travelers.length > 1 ? 's' : ''}</span></div>
        <div className="stat" style={{ borderTopColor: 'var(--accent)' }}><strong>{planned.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong><span>{trip.budget ? `sur ${trip.budget} €` : 'prévus'}</span></div>
        <div className="stat" style={{ borderTopColor: 'var(--accent)' }}><strong>{trip.packing.length ? `${packed}/${trip.packing.length}` : '—'}</strong><span>valise</span></div>
      </section>

      {alerts.length > 0 && (
        <section className="panel stack">
          <h3 className="panel-title">⚠️ À surveiller</h3>
          {alerts.map((a, i) => <div key={i} className="alert" data-hot={a.hot}>{a.text}</div>)}
        </section>
      )}

      <TripWeather trip={trip} patch={patch} />

      <section className="panel stack">
        <h3 className="panel-title">👥 Voyageurs</h3>
        <ul className="list">
          {travelers.map((t) => (
            <li key={t.id} className="vrow">
              <div className="row nowrap" style={{ alignItems: 'center' }}>
                <strong className="grow">{t.name}</strong>
                {travelers.length > 1 && <button className="icon-btn" onClick={() => setTravelers((ts) => ts.filter((x) => x.id !== t.id))} aria-label={`Retirer ${t.name}`}>×</button>}
              </div>
              <div className="chips" role="group" aria-label={`Profil de ${t.name}`}>
                {(['adulte', 'enfant', 'bebe'] as const).map((k) => (
                  <button key={k} className={'chip small-chip' + (t.kind === k ? ' on' : '')} style={t.kind === k ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : undefined} onClick={() => upd(t.id, { kind: k })}>{k === 'bebe' ? 'Bébé' : k === 'enfant' ? 'Enfant' : 'Adulte'}</button>
                ))}
                <select value={t.doc ?? ''} onChange={(e) => upd(t.id, { doc: e.target.value as Traveler['doc'] })} aria-label={`Pièce d’identité de ${t.name}`}>
                  <option value="">Pièce d’identité…</option><option value="passeport">Passeport</option><option value="cni">Carte d’identité</option>
                </select>
                {t.doc && <input type="date" value={t.docExpiry ?? ''} onChange={(e) => upd(t.id, { docExpiry: e.target.value })} aria-label={`Expiration de la pièce de ${t.name}`} />}
              </div>
            </li>
          ))}
        </ul>
        <div className="chips">
          {members.filter((m) => !travelers.some((t) => t.id === m.id)).map((m) => (
            <button key={m.id} className="chip" onClick={() => setTravelers((ts) => [...ts, { id: m.id, name: m.name, member: m.id, kind: 'adulte' }])}>+ {m.name}</button>
          ))}
        </div>
        <form className="row" onSubmit={(e) => { e.preventDefault(); if (guest.trim()) { setTravelers((ts) => [...ts, { id: 'g' + uid(), name: guest.trim(), kind: 'adulte' }]); setGuest('') } }}>
          <input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="Ajouter un invité (prénom)" className="grow" />
          <button className="btn small">+ Invité</button>
        </form>
      </section>
    </div>
  )
}
