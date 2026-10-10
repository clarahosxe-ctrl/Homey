import { useState } from 'react'
import { EMOJIS, PALETTE, type Household } from '../lib/household'
import Avatar from './Avatar'
import { PhotoThumb } from './Photo'

export default function ProfileSheet({ household, welcome, onClose, onJoin }: { household: Household; welcome: boolean; onClose: () => void; onJoin?: () => void }) {
  const { current, legacy, members, saveProfile, claim, removeMember } = household
  const start = welcome ? legacy : current
  const [name, setName] = useState(start?.name ?? '')
  const [color, setColor] = useState(start?.color ?? PALETTE[Math.floor(Math.random() * PALETTE.length)])
  const [emoji, setEmoji] = useState(start?.emoji ?? '')
  const [photo, setPhoto] = useState<string | undefined>(start?.photo)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    saveProfile({ name: name.trim(), color, emoji: emoji || undefined, photo })
    onClose()
  }

  return (
    <div className="overlay" onClick={welcome ? undefined : onClose} role="dialog" aria-label="Mon profil">
      <form className="sheet stack" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="row between">
          <h2 className="sheet-title">{welcome ? 'Bienvenue 👋' : 'Mon profil'}</h2>
          {!welcome && <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">×</button>}
        </div>
        {welcome && <p className="sub">Comment doit-on vous appeler ? Votre profil reste personnel : chacun a le sien sur son appareil.</p>}
        {welcome && members.length > 0 && (
          <div className="stack">
            <p className="sub"><strong>Déjà dans le foyer ?</strong> Choisissez-vous pour reprendre votre profil :</p>
            <div className="chips">
              {members.map((m) => (
                <button type="button" key={m.id} className="chip" onClick={() => { claim(m); onClose() }}>{m.emoji || '👤'} {m.name}</button>
              ))}
            </div>
          </div>
        )}
        {welcome && members.length === 0 && onJoin && (
          <button type="button" className="btn small" onClick={onJoin}>🔑 J’ai un code de foyer</button>
        )}

        <div className="profile-preview"><PhotoThumb id={photo} round size={84} onChange={setPhoto} label="Choisir ma photo" fallback={<Avatar m={{ id: 'x', name: name || '?', color, emoji }} size={84} />} /></div>

        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom" maxLength={24} autoFocus />

        <div className="chips" role="group" aria-label="Avatar">
          <button type="button" className={'chip' + (!emoji ? ' on' : '')} onClick={() => setEmoji('')}>Initiale</button>
          {EMOJIS.map((e) => (
            <button type="button" key={e} className={'chip emoji' + (emoji === e ? ' on' : '')} onClick={() => setEmoji(e)}>{e}</button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Couleur">
          {PALETTE.map((c) => (
            <button type="button" key={c} className={'swatch' + (color === c ? ' on' : '')} style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />
          ))}
        </div>

        <button className="btn primary" disabled={!name.trim()}>{welcome ? 'C’est parti' : 'Enregistrer'}</button>

        {!welcome && members.length > 1 && (
          <div className="stack">
            <h3 className="panel-title">Membres du foyer</h3>
            <ul className="list">
              {members.map((m) => (
                <li key={m.id} className="item">
                  <Avatar m={m} size={30} />
                  <span className="grow">{m.name}{m.id === current.id && ' (moi)'}</span>
                  {m.id !== current.id && (
                    <button type="button" className="btn small" onClick={() => confirm(`Vous êtes ${m.name} ? Cet appareil reprendra ce profil et le vôtre actuel sera retiré.`) && (claim(m), onClose())}>C’est moi</button>
                  )}
                  {m.id !== current.id && (
                    <button type="button" className="icon-btn" onClick={() => confirm(`Retirer ${m.name} du foyer ?`) && removeMember(m.id)} aria-label={`Retirer ${m.name}`}>×</button>
                  )}
                </li>
              ))}
            </ul>
            <p className="sub">Les membres s’ajoutent seuls en rejoignant le foyer avec le code. Si vous apparaissez en double, touchez « C’est moi » sur votre autre entrée. « × » retire un membre qui n’utilise plus l’app.</p>
          </div>
        )}
      </form>
    </div>
  )
}
