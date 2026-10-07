import { useEffect, useState } from 'react'
import { useStored } from '../lib/storage'

interface City { name: string; lat: number; lon: number }
interface Forecast { temp: number; code: number; min: number; max: number; rain: number }

const CODES: Record<number, [string, string]> = {
  0: ['☀️', 'Ensoleillé'], 1: ['🌤️', 'Peu nuageux'], 2: ['⛅', 'Nuageux'], 3: ['☁️', 'Couvert'],
  45: ['🌫️', 'Brouillard'], 48: ['🌫️', 'Brouillard'],
  51: ['🌦️', 'Bruine'], 53: ['🌦️', 'Bruine'], 55: ['🌦️', 'Bruine'],
  61: ['🌧️', 'Pluie'], 63: ['🌧️', 'Pluie'], 65: ['🌧️', 'Forte pluie'],
  71: ['🌨️', 'Neige'], 73: ['🌨️', 'Neige'], 75: ['🌨️', 'Neige'],
  80: ['🌦️', 'Averses'], 81: ['🌧️', 'Averses'], 82: ['⛈️', 'Fortes averses'],
  95: ['⛈️', 'Orage'], 96: ['⛈️', 'Orage'], 99: ['⛈️', 'Orage'],
}
const describe = (c: number) => CODES[c] ?? ['🌡️', '—']

export default function Weather() {
  const [city, setCity] = useStored<City>('city', { name: 'Paris', lat: 48.8566, lon: 2.3522 })
  const [fc, setFc] = useState<Forecast | null>(null)
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    setError(false)
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
      `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=auto&forecast_days=1`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        setFc({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
          min: Math.round(d.daily.temperature_2m_min[0]),
          max: Math.round(d.daily.temperature_2m_max[0]),
          rain: d.daily.precipitation_probability_max[0] ?? 0,
        })
      })
      .catch(() => !cancelled && setError(true))
    return () => { cancelled = true }
  }, [city])

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=fr`)
      const d = await r.json()
      const hit = d.results?.[0]
      if (hit) {
        setCity({ name: hit.name, lat: hit.latitude, lon: hit.longitude })
        setEditing(false)
        setQuery('')
      }
    } catch {
      setError(true)
    }
  }

  const [icon, label] = fc ? describe(fc.code) : ['…', 'Chargement']

  return (
    <div className="weather">
      <div className="weather-main">
        <span className="weather-icon" aria-hidden>{error ? '📡' : icon}</span>
        <div>
          <div className="weather-temp">{fc ? `${fc.temp}°` : '–'}</div>
          <div className="sub">{error ? 'Météo indisponible' : label}</div>
        </div>
      </div>
      {fc && !error && (
        <div className="sub">↓ {fc.min}° · ↑ {fc.max}° · 💧 {fc.rain} %</div>
      )}
      {editing ? (
        <form className="row" onSubmit={search}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ville…" autoFocus />
          <button className="btn small primary">OK</button>
        </form>
      ) : (
        <button className="link" onClick={() => setEditing(true)}>📍 {city.name}</button>
      )}
    </div>
  )
}
