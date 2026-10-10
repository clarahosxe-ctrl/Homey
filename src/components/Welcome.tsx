import { useState } from 'react'
import { createHousehold, joinHousehold } from '../lib/sync'

/** Écran bloquant : un compte est toujours rattaché à un foyer (le sien, ou un foyer existant via son code). */
export default function Welcome() {
  const [mode, setMode] = useState<'create' | 'join' | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError('')
    try { await fn() } catch (e) { setError(e instanceof Error && e.message === 'Code inconnu' ? 'Code inconnu : vérifiez-le auprès de la personne qui a créé le foyer.' : 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.') }
    setBusy(false)
  }

  return (
    <div className="welcome">
      <div className="welcome-card stack">
        <div className="welcome-logo" aria-hidden>🏡</div>
        <h1 className="welcome-title">Bienvenue sur Homey</h1>
        <p className="sub center">Tout ce qui se passe dans votre foyer, au même endroit. Pour commencer, créez votre foyer ou rejoignez celui de vos proches.</p>

        {mode === null && (
          <div className="stack">
            <button className="btn primary big" onClick={() => setMode('create')}>🏠 Créer mon foyer</button>
            <button className="btn big" onClick={() => setMode('join')}>🔑 Rejoindre un foyer avec un code</button>
          </div>
        )}

        {mode === 'create' && (
          <form className="stack" onSubmit={(e) => { e.preventDefault(); void run(() => createHousehold(name.trim() || 'Mon foyer')) }}>
            <label className="field">Nom du foyer<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. La maison des Dupont" autoFocus maxLength={60} /></label>
            <button className="btn primary big" disabled={busy}>{busy ? 'Création…' : 'Créer le foyer'}</button>
            <p className="sub center">Vous recevrez un code à partager avec les autres membres du foyer.</p>
            <button type="button" className="btn ghost" onClick={() => { setMode(null); setError('') }}>← Retour</button>
          </form>
        )}

        {mode === 'join' && (
          <form className="stack" onSubmit={(e) => { e.preventDefault(); void run(() => joinHousehold(code)) }}>
            <label className="field">Code du foyer<input className="code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" autoCapitalize="characters" autoFocus /></label>
            <button className="btn primary big" disabled={busy || code.replace(/[^A-Z0-9]/g, '').length < 8}>{busy ? 'Connexion…' : 'Rejoindre'}</button>
            <p className="sub center">Demandez le code à la personne qui a créé le foyer (menu « Mon foyer »).</p>
            <button type="button" className="btn ghost" onClick={() => { setMode(null); setError('') }}>← Retour</button>
          </form>
        )}

        {error && <p className="error center">{error}</p>}
      </div>
    </div>
  )
}
