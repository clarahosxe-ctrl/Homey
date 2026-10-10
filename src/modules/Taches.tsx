import { useState } from 'react'
import Avatar from '../components/Avatar'
import type { Household } from '../lib/household'
import { addDays, daysBetween, fmtShort, iso, parse, startOfDay } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Chore, ChoreProfile, Member } from '../lib/types'
import { DEFAULT_PROFILE, suggest } from './tachesCatalog'

export const useChores = () => useStored<Chore[]>('chores', [])
const useProfile = () => useStored<ChoreProfile>('chores-profile', { ...DEFAULT_PROFILE })

/** À qui le tour ? (attribution manuelle, ou à tour de rôle si activé) */
export function turnOf(c: Chore, members: Member[]) {
  if (!c.rotate) return members.find((m) => m.id === c.assignee)
  const i = members.findIndex((m) => m.id === c.lastBy)
  return members[(i + 1) % members.length]
}

export const dueDate = (c: Chore) => (c.lastDone ? addDays(parse(c.lastDone), c.everyDays) : c.firstDue ? parse(c.firstDue) : startOfDay())
/** Jours avant l'échéance (négatif = en retard). */
export const daysLeft = (c: Chore) => daysBetween(new Date(), dueDate(c))

const PRESETS: [string, string, number][] = [
  ['🧹', 'Passer l’aspirateur', 7], ['🚿', 'Salle de bain', 7], ['🍳', 'Nettoyer la cuisine', 7], ['🛏️', 'Changer les draps', 14],
  ['🪟', 'Vitres', 30], ['🧊', 'Nettoyer le frigo', 30], ['🧺', 'Lessive', 3], ['🚽', 'Toilettes', 7],
]

export default function Taches({ household }: { household: Household }) {
  const [chores, setChores] = useChores()
  const [profile, setProfile] = useProfile()
  const [view, setView] = useState<'list' | 'quiz' | 'suggest'>(profile.done ? 'list' : 'quiz')
  const { members, current } = household

  if (view === 'quiz') {
    return <Quiz profile={profile} hasChores={chores.length > 0}
      onSubmit={(p) => { setProfile({ ...p, done: true }); setView('suggest') }}
      onSkip={() => { setProfile({ ...profile, done: true }); setView('list') }} />
  }
  if (view === 'suggest') {
    return <Suggestions profile={profile} chores={chores} members={members}
      onAdd={(list) => { setChores((cs) => [...cs, ...list]); setView('list') }}
      onBack={() => setView('list')} onQuiz={() => setView('quiz')} />
  }
  return <List chores={chores} setChores={setChores} household={household} current={current}
    onSuggest={() => setView('suggest')} onQuiz={() => setView('quiz')} />
}

/* ---------- Questionnaire ---------- */
function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="row between" style={{ alignItems: 'center' }}>
      <span>{label}</span>
      <div className="row nowrap" style={{ alignItems: 'center' }}>
        <button type="button" className="round" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Moins de ${label}`}>−</button>
        <strong style={{ minWidth: 22, textAlign: 'center' }}>{value}</strong>
        <button type="button" className="round" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Plus de ${label}`}>+</button>
      </div>
    </div>
  )
}
function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" className={'chip' + (on ? ' on' : '')} aria-pressed={on} onClick={() => onChange(!on)}>{label}</button>
}

function Quiz({ profile, hasChores, onSubmit, onSkip }: { profile: ChoreProfile; hasChores: boolean; onSubmit: (p: ChoreProfile) => void; onSkip: () => void }) {
  const [p, setP] = useState<ChoreProfile>(profile)
  const set = (patch: Partial<ChoreProfile>) => setP((x) => ({ ...x, ...patch }))
  const togglePet = (k: string) => set({ pets: p.pets.includes(k) ? p.pets.filter((x) => x !== k) : [...p.pets, k] })

  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); onSubmit(p) }}>
      <section className="panel stack">
        <h3 className="panel-title">🏠 Parlez-nous de votre maison</h3>
        <p className="sub">Quelques questions pour vous proposer des tâches et des fréquences adaptées. Vous pourrez tout modifier ensuite.</p>
      </section>

      <section className="panel stack">
        <strong>Votre logement</strong>
        <div className="chips">
          <Toggle label="🏢 Appartement" on={p.housing === 'appartement'} onChange={() => set({ housing: 'appartement', floors: 1 })} />
          <Toggle label="🏡 Maison" on={p.housing === 'maison'} onChange={() => set({ housing: 'maison' })} />
        </div>
        <Stepper label="Chambres" value={p.bedrooms} min={0} max={8} onChange={(n) => set({ bedrooms: n })} />
        <Stepper label="Salles de bain" value={p.bathrooms} min={1} max={4} onChange={(n) => set({ bathrooms: n })} />
        {p.housing === 'maison' && <Stepper label="Étages" value={p.floors} min={1} max={4} onChange={(n) => set({ floors: n })} />}
        <div className="chips">
          <Toggle label="🍽️ Lave-vaisselle" on={p.dishwasher} onChange={(v) => set({ dishwasher: v })} />
        </div>
      </section>

      <section className="panel stack">
        <strong>Qui vit ici ?</strong>
        <Stepper label="Enfants" value={p.kids} min={0} max={8} onChange={(n) => set({ kids: n })} />
        <div className="chips"><Toggle label="👶 Un bébé" on={p.baby} onChange={(v) => set({ baby: v })} /></div>
        <strong>Animaux</strong>
        <div className="chips">
          <Toggle label="🐶 Chien" on={p.pets.includes('chien')} onChange={() => togglePet('chien')} />
          <Toggle label="🐱 Chat" on={p.pets.includes('chat')} onChange={() => togglePet('chat')} />
          <Toggle label="🐰 Autre" on={p.pets.includes('autre')} onChange={() => togglePet('autre')} />
        </div>
      </section>

      <section className="panel stack">
        <strong>Extérieur et plantes</strong>
        <div className="chips">
          <Toggle label="🌳 Jardin" on={p.garden} onChange={(v) => set({ garden: v })} />
          <Toggle label="🪑 Balcon / terrasse" on={p.balcony} onChange={(v) => set({ balcony: v })} />
          <Toggle label="🪴 Plantes d’intérieur" on={p.plants} onChange={(v) => set({ plants: v })} />
        </div>
      </section>

      <section className="panel stack">
        <strong>Votre niveau d’exigence</strong>
        {([['leger', '🌿 Léger', 'Le strict nécessaire, tâches espacées'], ['standard', '🏠 Standard', 'Un entretien régulier'], ['meticuleux', '✨ Impeccable', 'Tout est fait souvent']] as const).map(([k, l, d]) => (
          <button type="button" key={k} className={'choice' + (p.level === k ? ' on' : '')} onClick={() => set({ level: k })} aria-pressed={p.level === k}>
            <strong>{l}</strong><span className="sub">{d}</span>
          </button>
        ))}
      </section>

      <button className="btn primary">Voir mes suggestions →</button>
      {hasChores && <button type="button" className="btn ghost" onClick={onSkip}>Retour à mes tâches</button>}
      {!hasChores && <button type="button" className="btn ghost" onClick={onSkip}>Passer, je ferai ma liste moi-même</button>}
    </form>
  )
}

/* ---------- Suggestions ---------- */
function Suggestions({ profile, chores, members, onAdd, onBack, onQuiz }: {
  profile: ChoreProfile; chores: Chore[]; members: Member[]
  onAdd: (c: Chore[]) => void; onBack: () => void; onQuiz: () => void
}) {
  const have = new Set(chores.map((c) => c.name.toLowerCase()))
  const list = suggest(profile).filter((s) => !have.has(s.name.toLowerCase()))
  const [picked, setPicked] = useState<Record<string, boolean>>(() => Object.fromEntries(list.map((s) => [s.id, true])))
  const [every, setEvery] = useState<Record<string, number>>({})
  const [assign, setAssign] = useState<string>('') // '' = personne, id membre, '__rot' = tour de rôle
  const [spread, setSpread] = useState(true)

  const zones = [...new Set(list.map((s) => s.zone))]
  const chosen = list.filter((s) => picked[s.id])

  const add = () => {
    const today = startOfDay()
    onAdd(chosen.map((s, i) => {
      const e = every[s.id] ?? s.every
      // première échéance étalée sur la semaine pour ne pas tout avoir "aujourd'hui"
      const offset = spread ? 1 + (i % Math.min(e, 7)) : 0
      return {
        id: uid(), name: s.name, icon: s.icon, zone: s.zone, everyDays: e,
        rotate: assign === '__rot', assignee: assign === '__rot' ? '' : assign,
        lastDone: '', firstDue: spread ? iso(addDays(today, offset)) : undefined, lastBy: assign && assign !== '__rot' ? assign : members[0]?.id ?? '', history: [],
      }
    }))
  }

  return (
    <div className="stack">
      <section className="panel stack">
        <h3 className="panel-title">💡 Suggestions pour votre maison</h3>
        <p className="sub">{list.length === 0 ? 'Vous avez déjà toutes les tâches suggérées. Bravo !' : 'Décochez ce qui ne vous concerne pas, ajustez la fréquence si besoin.'}</p>
        <button className="link" onClick={onQuiz}>✎ Modifier mes réponses</button>
      </section>

      {zones.map((z) => (
        <section key={z} className="panel">
          <h3 className="panel-title">{z}</h3>
          <ul className="list">
            {list.filter((s) => s.zone === z).map((s) => (
              <li key={s.id} className={'item' + (picked[s.id] ? '' : ' done')}>
                <label className="check">
                  <input type="checkbox" checked={!!picked[s.id]} onChange={() => setPicked((x) => ({ ...x, [s.id]: !x[s.id] }))} />
                  <span className="box" /><span className="label">{s.icon} {s.name}</span>
                </label>
                <span className="sub nowrap-text">tous les</span>
                <input className="mini-input" type="number" min={1} max={365} value={every[s.id] ?? s.every} onChange={(e) => setEvery((x) => ({ ...x, [s.id]: Math.max(1, Number(e.target.value)) }))} aria-label={`Fréquence : ${s.name}`} />
                <span className="sub">j</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {list.length > 0 && (
        <section className="panel stack">
          <strong>Attribuer les {chosen.length} tâches à…</strong>
          <div className="chips">
            <button type="button" className={'chip' + (assign === '' ? ' on' : '')} onClick={() => setAssign('')}>Personne (je le ferai moi-même)</button>
            {members.map((m) => <button type="button" key={m.id} className={'chip' + (assign === m.id ? ' on' : '')} onClick={() => setAssign(m.id)}>{m.name}</button>)}
          </div>
          <label className="check inline">
            <input type="checkbox" checked={spread} onChange={(e) => setSpread(e.target.checked)} />
            <span className="box" /> <span>Étaler les premières échéances sur la semaine</span>
          </label>
          <button className="btn primary" onClick={add} disabled={chosen.length === 0}>Ajouter {chosen.length} tâche{chosen.length > 1 ? 's' : ''}</button>
        </section>
      )}
      <button className="btn ghost" onClick={onBack}>← Retour à mes tâches</button>
    </div>
  )
}

/* ---------- Liste ---------- */
function List({ chores, setChores, household, current, onSuggest, onQuiz }: {
  chores: Chore[]; setChores: (u: (c: Chore[]) => Chore[]) => void; household: Household; current: Member; onSuggest: () => void; onQuiz: () => void
}) {
  const { members } = household
  const [filter, setFilter] = useState<string>('all')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [preset, setPreset] = useState(0)
  const [name, setName] = useState('')
  const [every, setEvery] = useState(7)

  const patch = (id: string, p: Partial<Chore>) => setChores((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)))
  const assign = (c: Chore, id: string) => patch(c.id, !c.rotate && c.assignee === id ? { assignee: '' } : { assignee: id, rotate: false })
  const done = (id: string) => setChores((cs) => cs.map((c) => c.id === id
    ? { ...c, lastDone: iso(new Date()), lastBy: current.id, history: [...c.history, { by: current.id, date: iso(new Date()) }].slice(-60) } : c))

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const p = PRESETS[preset]
    setChores((cs) => [...cs, { id: uid(), name: name.trim() || p[1], icon: name.trim() ? '✨' : p[0], everyDays: every, rotate: false, assignee: '', lastDone: '', lastBy: current.id, history: [] }])
    setName(''); setAdding(false)
  }

  const mine = (c: Chore, id: string) => { const t = turnOf(c, members); return !t || t.id === id }
  const shown = chores.filter((c) => filter === 'all' || mine(c, filter)).sort((a, b) => daysLeft(a) - daysLeft(b))
  const month = iso(new Date()).slice(0, 7)
  const score = (id: string) => chores.flatMap((c) => c.history).filter((h) => h.by === id && h.date.startsWith(month)).length
  const late = chores.filter((c) => daysLeft(c) < 0).length

  return (
    <div className="stack">
      {chores.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">Ce mois-ci{late > 0 && <span className="pill" data-hot="true" style={{ marginLeft: 8 }}>{late} en retard</span>}</h3>
          <div className="stats">
            {members.map((m) => (
              <div key={m.id} className="stat" style={{ borderTopColor: m.color }}>
                <strong>{m.name}</strong>
                <span>✅ {score(m.id)} tâche{score(m.id) > 1 ? 's' : ''} faite{score(m.id) > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {chores.length > 0 && members.length > 1 && (
        <div className="chips" role="group" aria-label="Filtre">
          <button className={'chip' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>Toutes</button>
          {members.map((m) => <button key={m.id} className={'chip' + (filter === m.id ? ' on' : '')} onClick={() => setFilter(m.id)}>{m.name}</button>)}
        </div>
      )}

      {chores.length === 0 && !adding && (
        <section className="panel stack" style={{ textAlign: 'center' }}>
          <p className="empty" style={{ padding: '12px 0' }}>Aucune tâche pour l’instant 🧼</p>
          <button className="btn primary" onClick={onSuggest}>💡 Voir les suggestions pour ma maison</button>
        </section>
      )}

      <ul className="stack">
        {shown.map((c) => {
          const left = daysLeft(c)
          const who = turnOf(c, members)
          return (
            <li key={c.id} className="panel chore stack-tight">
              <div className="row nowrap" style={{ alignItems: 'center' }}>
                <span className="chore-icon">{c.icon}</span>
                <div className="grow">
                  <strong>{c.name}</strong>
                  <div className="sub">
                    {c.zone && `${c.zone} · `}{c.lastDone ? `Fait le ${fmtShort(parse(c.lastDone))}` : 'Jamais fait'} ·{' '}
                    {editing === c.id
                      ? <>tous les <input className="mini-input" type="number" min={1} max={365} value={c.everyDays} onChange={(e) => patch(c.id, { everyDays: Math.max(1, Number(e.target.value)) })} onBlur={() => setEditing(null)} autoFocus /> j</>
                      : <button className="link" onClick={() => setEditing(c.id)} title="Modifier la fréquence">tous les {c.everyDays} j ✎</button>}
                  </div>
                  <span className="pill" data-hot={left <= 0}>{left < 0 ? `en retard de ${-left} j` : left === 0 ? "aujourd'hui" : `dans ${left} j`}</span>
                </div>
                <button className="btn primary small" onClick={() => done(c.id)}>Fait ✓</button>
                <button className="icon-btn" onClick={() => setChores((cs) => cs.filter((x) => x.id !== c.id))} aria-label={`Supprimer ${c.name}`}>×</button>
              </div>
              <div className="assign" role="group" aria-label={`Attribuer ${c.name}`}>
                <span className="sub">{who ? `À ${who.name}` : 'Pour tous'}</span>
                {members.map((m) => (
                  <button key={m.id} type="button" className={'assign-btn' + (!c.rotate && c.assignee === m.id ? ' on' : '')} onClick={() => assign(c, m.id)} title={`Attribuer à ${m.name}`} aria-pressed={!c.rotate && c.assignee === m.id}>
                    <Avatar m={m} size={28} />
                  </button>
                ))}
                {members.length > 1 && (
                  <button type="button" className={'assign-btn rot' + (c.rotate ? ' on' : '')} onClick={() => patch(c.id, { rotate: !c.rotate })} title="À tour de rôle" aria-pressed={c.rotate}>↻</button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <form className="panel stack" onSubmit={add}>
          <h3 className="panel-title">Nouvelle tâche</h3>
          <select value={preset} onChange={(e) => { const i = Number(e.target.value); setPreset(i); setEvery(PRESETS[i][2]) }}>
            {PRESETS.map((p, i) => <option key={p[1]} value={i}>{p[0]} {p[1]}</option>)}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="…ou nom personnalisé" />
          <label className="field">Tous les (jours)
            <input type="number" min={1} max={365} value={every} onChange={(e) => setEvery(Math.max(1, Number(e.target.value)))} style={{ width: 100 }} />
          </label>
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <div className="row">
          <button className="btn primary grow" onClick={() => setAdding(true)}>+ Nouvelle tâche</button>
          <button className="btn grow" onClick={onSuggest}>💡 Suggestions</button>
        </div>
      )}
      <button className="link center" onClick={onQuiz}>✎ Modifier le questionnaire sur ma maison</button>
    </div>
  )
}
