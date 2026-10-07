import { useEffect, useState } from 'react'
import { DAY_SHORT } from '../lib/dates'
import { useStored } from '../lib/storage'

interface City { name: string; lat: number; lon: number }
interface Day { date: string; code: number; min: number; max: number; rain: number }

const icon = (c: number) =>
  c === 0 ? '☀️' : c <= 2 ? '🌤️' : c === 3 ? '☁️' : c <= 48 ? '🌫️' : c <= 57 ? '🌦️' : c <= 67 ? '🌧️' : c <= 77 ? '🌨️' : c <= 82 ? '🌦️' : '⛈️'

export default function Weather() {
  const [city, setCity] = useStored<City>('city', { name: 'Paris', lat: 48.8566, lon: 2.3522 })
  const [days, setDays] = useState<Day[] | null>(null)
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    setError(false)
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        setDays(d.daily.time.map((t: string, i: number) => ({
          date: t,
          code: d.daily.weather_code[i],
          min: Math.round(d.daily.temperature_2m_min[i]),
          max: Math.round(d.daily.temperature_2m_max[i]),
          rain: d.daily.precipitation_probability_max[i] ?? 0,
        })))
      })
      .catch(() => !cancelled && setError(true))
    return () => { cancelled = true }
  }, [city.lat, city.lon])

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=fr`)
      const hit = (await r.json()).results?.[0]
      if (hit) { setCity({ name: hit.name, lat: hit.latitude, lon: hit.longitude }); setEditing(false); setQuery('') }
    } catch { setError(true) }
  }

  return (
    <section className="card-flat">
      <div className="row between">
        {editing ? (
          <form className="row" onSubmit={search}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ville…" autoFocus />
            <button className="btn small primary">OK</button>
          </form>
        ) : (
          <button className="link" onClick={() => setEditing(true)}>📍 {city.name}</button>
        )}
      </div>
      {error && <p className="sub">Météo indisponible pour le moment.</p>}
      {!error && (
        <div className="wk">
          {(days ?? Array.from({ length: 7 }, () => null)).map((d, i) => (
            <div key={i} className="wk-day">
              <span className="sub">{d ? `${DAY_SHORT[new Date(d.date + 'T00:00').getDay()]} ${d.date.slice(8)}` : '…'}</span>
              <span className="wk-icon">{d ? icon(d.code) : '·'}</span>
              <strong>{d ? `${d.max}°` : '–'}</strong>
              <span className="sub">{d ? `${d.min}°` : ''}</span>
              {d && d.rain >= 40 && <span className="rain">💧{d.rain}%</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
