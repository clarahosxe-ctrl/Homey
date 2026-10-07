import { useEffect, useState, useSyncExternalStore } from 'react'
import { createHousehold, formatCode, getHousehold, getSyncStatus, joinHousehold, leaveHousehold, onSyncChange, syncAvailable } from '../lib/sync'

const useHousehold = () => {
  const [hh, setHh] = useState(getHousehold())
  const status = useSyncExternalStore(onSyncChange, getSyncStatus)
  return { hh, setHh, status }
}
export { useHousehold }

export default function HouseholdSheet({ onClose, onChange }: { onClose: () => void; onChange: () => void }) {
  const { hh, setHh, status } = useHousehold()
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('Home sweet home')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError('')
    try { await fn(); setHh(getHousehold()); onChange() } catch (e) { setError(e instanceof Error && e.message === 'Code inconnu' ? 'Code inconnu, vérifiez-le.' : 'Impossible de joindre le serveur.') }
    setBusy(false)
  }

  const copy = async () => {
    if (!hh) return
    try { await navigator.clipboard.writeText(hh.code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ }
  }

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-label="Mon foyer">
      <div className="sheet stack" onClick={(e) => e.stopPropagation()}>
        <div className="row between"><h2 className="sheet-title">Mon foyer</h2><button className="icon-btn" onClick={onClose} aria-label="Fermer">×</button></div>

        {!syncAvailable && (
          <p className="notice">La synchronisation n’est pas encore configurée : vos données restent sur cet appareil. Renseignez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> (voir le README).</p>
        )}

        {hh ? (
          <>
            <p className="sub">Foyer <strong>{hh.name}</strong> · {status === 'ok' ? '🟢 synchronisé' : status === 'error' ? '🟠 hors ligne, nouvel essai…' : '…'}</p>
            <div className="code-box">
              <span className="sub">Code à partager</span>
              <strong className="code">{formatCode(hh.code)}</strong>
              <button className="btn primary small" onClick={copy}>{copied ? 'Copié ✓' : 'Copier le code'}</button>
            </div>
            <p className="sub">Les autres membres l’entrent dans « Rejoindre un foyer » sur leur appareil.</p>
            <button className="btn ghost small" onClick={() => { leaveHousehold(); setHh(null); onChange() }}>Quitter ce foyer sur cet appareil</button>
          </>
        ) : (
          syncAvailable && (
            <>
              <div className="chips">
                <button className={'chip' + (mode === 'create' ? ' on' : '')} onClick={() => setMode('create')}>Créer un foyer</button>
                <button className={'chip' + (mode === 'join' ? ' on' : '')} onClick={() => setMode('join')}>Rejoindre un foyer</button>
              </div>
              {mode === 'create' ? (
                <form className="stack" onSubmit={(e) => { e.preventDefault(); void run(() => createHousehold(name.trim() || 'Mon foyer')) }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du foyer" />
                  <button className="btn primary" disabled={busy}>Créer et obtenir mon code</button>
                  <p className="sub">Vos données actuelles seront publiées dans le foyer.</p>
                </form>
              ) : (
                <form className="stack" onSubmit={(e) => { e.preventDefault(); void run(() => joinHousehold(code)) }}>
                  <input className="code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" autoCapitalize="characters" />
                  <button className="btn primary" disabled={busy || code.replace(/[^A-Z0-9]/g, '').length < 8}>Rejoindre</button>
                  <p className="sub">Les données de ce foyer remplaceront celles de cet appareil.</p>
                </form>
              )}
              {error && <p className="error">{error}</p>}
            </>
          )
        )}
      </div>
    </div>
  )
}
