import { useEffect, useState, useSyncExternalStore } from 'react'
import Dashboard from './components/Dashboard'
import Welcome from './components/Welcome'
import HouseholdSheet from './components/HouseholdSheet'
import Avatar from './components/Avatar'
import ProfileSheet from './components/ProfileSheet'
import { useMembers } from './lib/household'
import Tutorial from './components/Tutorial'
import { useStored } from './lib/storage'
import { APP_TOUR, MODULE_TOURS } from './lib/tutorials'
import { householdSnapshot, leaveAndRemoveMember, onHouseholdChange, syncAvailable } from './lib/sync'
import { VIEWS } from './modules/views'
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
  const [profileOpen, setProfileOpen] = useState(false)
  const [, bump] = useState(0)
  const mod = getModule(route)
  const active = mod?.ready ? mod : null
  // couleur de la rubrique active (utilisée par les thèmes colorés)
  useEffect(() => {
    const root = document.documentElement
    if (active) root.style.setProperty('--module-hue', active.hue)
    else root.style.removeProperty('--module-hue')
  }, [active])
  // Tutoriels : visite guidée au premier lancement, puis un guide par application à sa première ouverture.
  const [seen, setSeen] = useStored<string[]>('tour-seen', [])
  const [guidesOff, setGuidesOff] = useStored<boolean>('tour-off', false)
  const [help, setHelp] = useState<string | null>(null)
  const hhRaw = useSyncExternalStore(onHouseholdChange, householdSnapshot)
  const hhName = (hhRaw ? (JSON.parse(hhRaw) as { name: string }).name : '') || 'Mon foyer'
  // Un compte est toujours rattaché à un foyer : sans foyer, on ne voit que l'écran d'accueil.
  const ready = !(syncAvailable && !hhRaw) && !household.needsProfile && !profileOpen && !sheet
  const auto = !guidesOff && ready ? (!seen.includes('app') ? 'app' : active && MODULE_TOURS[active.id] && !seen.includes(active.id) ? active.id : null) : null
  const shown = help ?? auto
  const closeHelp = () => { if (shown) setSeen((s) => (s.includes(shown) ? s : [...s, shown])); setHelp(null) }
  if (syncAvailable && !hhRaw) return <Welcome />

  const quit = async () => { await leaveAndRemoveMember(household.current.id); window.location.assign(window.location.pathname) }

  return (
    <div className="app">
      <header className="topbar">
        {active ? (
          <a href="#/" className="round big" aria-label="Retour à l’accueil">←</a>
        ) : (
          <a href="#/" className="logo-btn" aria-label="Accueil"><img src="/icon-192.png" alt="" width="46" height="46" /></a>
        )}
        <button className="hh-chip" onClick={() => setSheet(true)}>
          <span className="hh-name">{active ? active.title : hhName}</span>
        </button>
        {active && MODULE_TOURS[active.id] && <button className="round" onClick={() => setHelp(active.id)} aria-label="Aide sur cette application" title="Aide">?</button>}
        <button className="me" onClick={() => setProfileOpen(true)} aria-label="Mon profil">
          <Avatar m={household.current} size={40} />
        </button>
      </header>
      <main>
        {!household.needsProfile && (active ? (() => { const View = VIEWS[active.id]; return View ? <View household={household} /> : null })() : <Dashboard household={household} hhName={hhName} />)}
      </main>
      {(household.needsProfile || profileOpen) && (
        <ProfileSheet household={household} welcome={household.needsProfile} onClose={() => setProfileOpen(false)} onTour={() => { setProfileOpen(false); setHelp('app') }} />
      )}
      {shown === 'app' && <Tutorial title="Visite guidée" slides={APP_TOUR} last="C’est parti !" onClose={closeHelp} onDisable={() => { setGuidesOff(true); closeHelp() }} />}
      {shown && shown !== 'app' && MODULE_TOURS[shown] && <Tutorial title={`Guide · ${getModule(shown)?.title ?? ''}`} intro={MODULE_TOURS[shown].intro} slides={MODULE_TOURS[shown].slides} onClose={closeHelp} onDisable={() => { setGuidesOff(true); closeHelp() }} />}
      {sheet && <HouseholdSheet onClose={() => setSheet(false)} onChange={() => bump((n) => n + 1)} onLeave={quit} />}
    </div>
  )
}
