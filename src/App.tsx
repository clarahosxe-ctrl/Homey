import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import Members from './components/Members'
import { useMembers } from './lib/household'
import Courses from './modules/Courses'
import Poubelles from './modules/Poubelles'
import Travail from './modules/Travail'
import { getModule } from './modules/registry'

const useRoute = () => {
  const read = () => window.location.hash.replace(/^#\/?/, '')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  const household = useMembers()
  const mod = getModule(route)
  const active = mod?.ready ? mod : null

  return (
    <div className="app">
      <header className="topbar">
        {active ? (
          <a href="#/" className="back" aria-label="Retour à l’accueil">←</a>
        ) : (
          <span className="logo" aria-hidden>🏡</span>
        )}
        <h1>{active ? `${active.icon} ${active.title}` : 'Homey'}</h1>
        <Members household={household} />
      </header>
      <main style={active ? ({ ['--hue' as string]: active.hue } as React.CSSProperties) : undefined}>
        {!active && <Dashboard household={household} />}
        {active?.id === 'courses' && <Courses household={household} />}
        {active?.id === 'poubelles' && <Poubelles />}
        {active?.id === 'travail' && <Travail household={household} />}
      </main>
    </div>
  )
}
