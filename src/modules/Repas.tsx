import { useState } from 'react'
import { PhotoMini, PhotoThumb } from '../components/Photo'
import type { Household } from '../lib/household'
import { addDays, iso, startOfDay, weekDays } from '../lib/dates'
import { uid, useStored } from '../lib/storage'
import type { Meal, Recipe, ShoppingItem } from '../lib/types'
import { useShopping } from './Courses'

export const useMeals = () => useStored<Meal[]>('meals', [])
const useRecipes = () => useStored<Recipe[]>('recipes', [])

const parseList = (t: string) => t.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean)

/** Rayon de courses deviné à partir du nom de l'ingrédient. */
function categoryOf(label: string) {
  const l = label.toLowerCase()
  if (/surgel|glace/.test(l)) return '🧊 Surgelés'
  if (/lait|œuf|oeuf|beurre|crème|creme|fromage|yaourt|poulet|viande|boeuf|bœuf|porc|poisson|saumon|jambon|salade|tomate|carotte|courgette|pomme|poire|banane|citron|oignon|ail|légume|legume|fruit|champignon|avocat|poivron/.test(l)) return '🥬 Frais'
  if (/lessive|savon|éponge|eponge|papier|liquide/.test(l)) return '🧴 Maison'
  return '🥫 Épicerie'
}

type Slot = 'midi' | 'soir'
const SLOTS: { id: Slot; label: string; icon: string }[] = [
  { id: 'midi', label: 'Midi', icon: '☀️' },
  { id: 'soir', label: 'Soir', icon: '🌙' },
]

export default function Repas({ household }: { household: Household }) {
  const [meals, setMeals] = useMeals()
  const [recipes, setRecipes] = useRecipes()
  const [shopping, setShopping] = useShopping()
  const { current } = household
  const [tab, setTab] = useState<'menu' | 'recettes'>('menu')
  const [offset, setOffset] = useState(0)
  const [editing, setEditing] = useState<{ date: string; slot: Slot } | null>(null)
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [saveRecipe, setSaveRecipe] = useState(false)
  const [toast, setToast] = useState('')

  const days = weekDays(addDays(new Date(), offset * 7))
  const today = startOfDay()

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2500) }

  const pickRecipe = (id: string) => {
    const r = recipes.find((x) => x.id === id)
    if (r) { setTitle(r.title); setIngredients(r.ingredients.join('\n')) }
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing || !title.trim()) return
    const ing = parseList(ingredients)
    setMeals((ms) => [...ms.filter((m) => !(m.date === editing.date && m.slot === editing.slot)), { id: uid(), date: editing.date, slot: editing.slot, title: title.trim(), ingredients: ing, inCourses: false }])
    if (saveRecipe && !recipes.some((r) => r.title.toLowerCase() === title.trim().toLowerCase())) {
      setRecipes((rs) => [...rs, { id: uid(), title: title.trim(), ingredients: ing }])
    }
    setEditing(null); setTitle(''); setIngredients(''); setSaveRecipe(false)
  }

  /** Ajoute aux courses les ingrédients de ces repas (sans doublon avec ce qui reste à acheter). */
  const sendToShopping = (list: Meal[]) => {
    const labels = list.filter((m) => !m.inCourses).flatMap((m) => m.ingredients)
    if (!labels.length) return flash('Rien à ajouter')
    const have = new Set(shopping.filter((i) => !i.done).map((i) => i.label.toLowerCase()))
    const fresh: ShoppingItem[] = []
    for (const label of labels) {
      if (have.has(label.toLowerCase())) continue
      have.add(label.toLowerCase())
      fresh.push({ id: uid(), label, done: false, by: current.id, category: categoryOf(label) })
    }
    if (fresh.length) setShopping((items) => [...items, ...fresh])
    const ids = new Set(list.map((m) => m.id))
    setMeals((ms) => ms.map((m) => (ids.has(m.id) ? { ...m, inCourses: true } : m)))
    flash(fresh.length ? `🛒 ${fresh.length} ingrédient${fresh.length > 1 ? 's' : ''} ajouté${fresh.length > 1 ? 's' : ''} aux courses` : 'Déjà dans les courses ✓')
  }

  const weekKeys = new Set(days.map(iso))
  const weekMeals = meals.filter((m) => weekKeys.has(m.date))
  const pending = weekMeals.filter((m) => !m.inCourses && m.ingredients.length && new Date(m.date + 'T00:00') >= today)

  return (
    <div className="stack">
      <div className="chips">
        <button className={'chip' + (tab === 'menu' ? ' on' : '')} onClick={() => setTab('menu')}>Menu</button>
        <button className={'chip' + (tab === 'recettes' ? ' on' : '')} onClick={() => setTab('recettes')}>Mes recettes ({recipes.length})</button>
      </div>

      {tab === 'menu' && (
        <>
          <div className="row between">
            <strong>{days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – {days[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</strong>
            <div className="row">
              {offset !== 0 && <button className="link" onClick={() => setOffset(0)}>Cette semaine</button>}
              <button className="round" onClick={() => setOffset(offset - 1)} aria-label="Semaine précédente">‹</button>
              <button className="round" onClick={() => setOffset(offset + 1)} aria-label="Semaine suivante">›</button>
            </div>
          </div>

          {days.map((d) => {
            const key = iso(d)
            const past = d < today
            return (
              <section key={key} className={'panel meal-day' + (past ? ' muted' : '') + (d.getTime() === today.getTime() ? ' today-panel' : '')}>
                <h3 className="panel-title" style={{ textTransform: 'capitalize' }}>{d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}</h3>
                {SLOTS.map((s) => {
                  const meal = meals.find((m) => m.date === key && m.slot === s.id)
                  const isEditing = editing?.date === key && editing.slot === s.id
                  return (
                    <div key={s.id} className="meal-slot">
                      <span className="slot-label">{s.icon} {s.label}</span>
                      {isEditing ? (
                        <form className="stack grow" onSubmit={save}>
                          {recipes.length > 0 && (
                            <select defaultValue="" onChange={(e) => pickRecipe(e.target.value)} aria-label="Choisir une recette">
                              <option value="" disabled>📖 Choisir une recette…</option>
                              {recipes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                            </select>
                          )}
                          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Plat (ex. Gratin de courgettes)" autoFocus />
                          <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Ingrédients, un par ligne (facultatif)" rows={3} />
                          <label className="check inline">
                            <input type="checkbox" checked={saveRecipe} onChange={(e) => setSaveRecipe(e.target.checked)} />
                            <span className="box" /> <span className="sub">Garder dans mes recettes</span>
                          </label>
                          <div className="row">
                            <button className="btn primary small">Enregistrer</button>
                            <button type="button" className="btn ghost small" onClick={() => setEditing(null)}>Annuler</button>
                          </div>
                        </form>
                      ) : meal ? (
                        <div className="meal grow">
                          <div className="grow">
                            <strong>{meal.title}</strong>
                            {meal.ingredients.length > 0 && <div className="sub">{meal.ingredients.length} ingrédient{meal.ingredients.length > 1 ? 's' : ''}{meal.inCourses && ' · ✓ dans les courses'}</div>}
                          </div>
                          {meal.ingredients.length > 0 && !meal.inCourses && (
                            <button className="btn small" onClick={() => sendToShopping([meal])} title="Ajouter aux courses">🛒</button>
                          )}
                          <button className="icon-btn" onClick={() => { setEditing({ date: key, slot: s.id }); setTitle(meal.title); setIngredients(meal.ingredients.join('\n')) }} aria-label="Modifier">✎</button>
                          <button className="icon-btn" onClick={() => setMeals((ms) => ms.filter((m) => m.id !== meal.id))} aria-label="Supprimer">×</button>
                        </div>
                      ) : (
                        <button className="add-slot grow" onClick={() => { setEditing({ date: key, slot: s.id }); setTitle(''); setIngredients('') }}>+ Ajouter</button>
                      )}
                    </div>
                  )
                })}
              </section>
            )
          })}

          {pending.length > 0 && (
            <button className="btn primary" onClick={() => sendToShopping(pending)}>🛒 Tout ajouter aux courses ({pending.length} repas)</button>
          )}
        </>
      )}

      {tab === 'recettes' && <Recipes recipes={recipes} setRecipes={setRecipes} />}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

function Recipes({ recipes, setRecipes }: { recipes: Recipe[]; setRecipes: (u: (r: Recipe[]) => Recipe[]) => void }) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [photo, setPhoto] = useState<string | undefined>()

  return (
    <div className="stack">
      {recipes.length === 0 && !adding && <p className="empty">Aucune recette. Ajoutez vos plats habituels 📖</p>}
      <ul className="stack">
        {[...recipes].sort((a, b) => a.title.localeCompare(b.title, 'fr')).map((r) => (
          <li key={r.id} className="panel">
            <div className="row between nowrap" style={{ alignItems: 'center' }}>
              {r.photo && <PhotoMini id={r.photo} fallback="🍽️" size={48} />}
              <strong className="grow">{r.title}</strong>
              <button className="icon-btn" onClick={() => confirm(`Supprimer « ${r.title} » ?`) && setRecipes((rs) => rs.filter((x) => x.id !== r.id))} aria-label={`Supprimer ${r.title}`}>×</button>
            </div>
            {r.ingredients.length > 0 && <div className="sub">{r.ingredients.join(' · ')}</div>}
          </li>
        ))}
      </ul>
      {adding ? (
        <form className="panel stack" onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          setRecipes((rs) => [...rs, { id: uid(), title: title.trim(), ingredients: parseList(ingredients), photo }])
          setTitle(''); setIngredients(''); setPhoto(undefined); setAdding(false)
        }}>
          <h3 className="panel-title">Nouvelle recette</h3>
          <div className="row nowrap" style={{ alignItems: 'center' }}><PhotoThumb id={photo} fallback="🍽️" size={56} onChange={setPhoto} label="Photo du plat" /><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom du plat" autoFocus className="grow" /></div>
          <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Ingrédients, un par ligne" rows={5} />
          <div className="row">
            <button className="btn primary">Ajouter</button>
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn primary" onClick={() => setAdding(true)}>+ Nouvelle recette</button>
      )}
    </div>
  )
}
