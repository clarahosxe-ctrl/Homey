import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import HouseholdSheet from './components/HouseholdSheet'
import Members from './components/Members'
import { useMembers } from './lib/household'
import { getHousehold } from './lib/sync'
import Courses from './modules/Courses'
import Fidelite from './modules/Fidelite'
import Poubelles from './modules/Poubelles'
import Taches from './modules/Taches'
import Travail from './modules/Travail'
import { getModule } from './modules/registry'

const useRoute = () => {
  const read = () => window.location.hash.replace(/^#\/?/, '')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  const household = useMembers()
  const [sheet, setSheet] = useState(false)
  const [, bump] = useState(0)
  const mod = getModule(route)
  const active = mod?.ready ? mod : null
  const hhName = getHousehold()?.name ?? 'Mon foyer'

  return (
    <div className="app">
      <header className="topbar">
        {active ? (
          <a href="#/" className="round big" aria-label="Retour à l’accueil">←</a>
        ) : (
          <a href="#/" className="round big" aria-label="Accueil">🏡</a>
        )}
        <button className="hh-chip" onClick={() => setSheet(true)}>
          <span className="hh-dot" />
          <span className="hh-name">{active ? active.title : hhName}</span>
        </button>
        <Members household={household} />
      </header>
      <main>
        {!active && <Dashboard household={household} hhName={hhName} />}
        {active?.id === 'courses' && <Courses household={household} />}
        {active?.id === 'poubelles' && <Poubelles />}
        {active?.id === 'travail' && <Travail household={household} />}
        {active?.id === 'taches' && <Taches household={household} />}
        {active?.id === 'fidelite' && <Fidelite household={household} />}
      </main>
      {sheet && <HouseholdSheet onClose={() => setSheet(false)} onChange={() => bump((n) => n + 1)} />}
    </div>
  )
}
