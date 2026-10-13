import { useEffect } from 'react'
import Portal from './Portal'
import { CALENDAR_SOURCES, HOME_SECTIONS, useCalendarSources, useHomePrefs } from '../lib/prefs'
import { MODULES } from '../modules/registry'

export function Switch({ checked, onChange, children, hint }: { checked: boolean; onChange: () => void; children: React.ReactNode; hint?: string }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="track" aria-hidden />
      <span className="grow"><span className="switch-label">{children}</span>{hint && <span className="sub"> {hint}</span>}</span>
    </label>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <Portal>
      <div className="overlay" onClick={onClose} role="dialog" aria-label={title}>
        <div className="sheet stack" onClick={(e) => e.stopPropagation()}>
          <div className="row between"><h2 className="sheet-title">{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Fermer">×</button></div>
          {children}
        </div>
      </div>
    </Portal>
  )
}

/** Personnaliser l'accueil : sections, applications affichées et leur ordre. */
export function HomeSettings({ onClose }: { onClose: () => void }) {
  const p = useHomePrefs()
  const apps = p.sort(MODULES.filter((m) => m.ready))
  const ids = apps.map((m) => m.id)
  return (
    <Modal title="Personnaliser l’accueil" onClose={onClose}>
      <p className="sub">Choisissez ce qui s’affiche. Ce réglage est propre à cet appareil : chacun garde les applications dont il a vraiment besoin. Rien n’est supprimé, vos données restent en place.</p>
      <div className="stack">
        <strong>Sections</strong>
        {HOME_SECTIONS.map((s) => <Switch key={s.id} checked={p.sectionVisible(s.id)} onChange={() => p.toggleSection(s.id)}>{s.icon} {s.label}</Switch>)}
      </div>
      <div className="stack">
        <div className="row between"><strong>Applications</strong>
          <div className="row"><button className="link" onClick={p.showAll}>Tout afficher</button><button className="link" onClick={() => p.hideAll(ids)}>Tout masquer</button></div>
        </div>
        <ul className="list">
          {apps.map((m, i) => (
            <li key={m.id} className="approw">
              <Switch checked={p.appVisible(m.id)} onChange={() => p.toggleApp(m.id)}>{m.icon} {m.title}</Switch>
              <button className="icon-btn" onClick={() => p.move(ids, m.id, -1)} disabled={i === 0} aria-label={`Monter ${m.title}`}>▲</button>
              <button className="icon-btn" onClick={() => p.move(ids, m.id, 1)} disabled={i === apps.length - 1} aria-label={`Descendre ${m.title}`}>▼</button>
            </li>
          ))}
        </ul>
      </div>
      <button className="btn primary" onClick={onClose}>Terminé</button>
    </Modal>
  )
}

/** Choisir ce que le calendrier de la semaine affiche. */
export function CalendarSettings({ onClose }: { onClose: () => void }) {
  const c = useCalendarSources()
  return (
    <Modal title="Contenu du calendrier" onClose={onClose}>
      <p className="sub">Gardez le calendrier lisible : n’affichez que ce qui vous aide. Propre à cet appareil.</p>
      <div className="stack">
        {CALENDAR_SOURCES.map((s) => <Switch key={s.id} checked={c.on(s.id)} onChange={() => c.toggle(s.id)}>{s.icon} {s.label}</Switch>)}
      </div>
      <div className="row"><button className="btn primary grow" onClick={onClose}>Terminé</button><button className="btn ghost" onClick={c.reset}>Réinitialiser</button></div>
    </Modal>
  )
}
