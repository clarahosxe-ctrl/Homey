import { useSyncExternalStore } from 'react'

export interface ThemeDef {
  id: string
  label: string
  hint: string
  /** aperçu : fond, carte, accent, texte */
  preview: [string, string, string, string]
}

export const THEMES: ThemeDef[] = [
  { id: 'auto', label: 'Automatique', hint: 'Suit le mode clair / sombre du téléphone', preview: ['#f1efe9', '#1d1a16', '#2f7d68', '#1f2a27'] },
  { id: 'clair', label: 'Clair', hint: 'Crème et vert, le thème d’origine', preview: ['#f1efe9', '#ffffff', '#2f7d68', '#1f2a27'] },
  { id: 'sombre', label: 'Sombre', hint: 'Brun chaud, doux pour les yeux', preview: ['#1d1a16', '#27231e', '#2f7d68', '#f2eadf'] },
  { id: 'nuit', label: 'Nuit', hint: 'Bleu nuit', preview: ['#0f1420', '#171e2e', '#6aa6ff', '#e8edf7'] },
  { id: 'amoled', label: 'Noir pur', hint: 'Fond noir, économe sur écran OLED', preview: ['#000000', '#0c0c0c', '#3ddc97', '#f4f4f4'] },
  { id: 'ocean', label: 'Océan', hint: 'Bleus frais', preview: ['#e9f2f7', '#ffffff', '#1f78a8', '#0f2a3a'] },
  { id: 'foret', label: 'Forêt', hint: 'Verts naturels', preview: ['#edf1e8', '#fbfdf8', '#3c7a3c', '#1c2a1c'] },
  { id: 'rose', label: 'Rose poudré', hint: 'Doux et lumineux', preview: ['#fbf0f2', '#ffffff', '#c4486e', '#3a1f28'] },
  { id: 'sepia', label: 'Sépia', hint: 'Papier ancien', preview: ['#f3e9d7', '#fbf5e8', '#9a6b2f', '#3b2f20'] },
  { id: 'nb', label: 'Noir & blanc', hint: 'Contraste maximal, sans aucune couleur', preview: ['#ffffff', '#efefef', '#000000', '#000000'] },
]

const KEY = 'homey:theme'
const EVT = 'homey-theme'

export function getTheme(): string {
  try {
    const t = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    return THEMES.some((x) => x.id === t) ? t : 'auto'
  } catch {
    return 'auto'
  }
}

export function applyTheme(id: string) {
  const root = document.documentElement
  if (id === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', id)
  // barre du navigateur : couleur du fond (après application du thème)
  requestAnimationFrame(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', getComputedStyle(document.body).backgroundColor)
  })
}

export function setTheme(id: string) {
  try { localStorage.setItem(KEY, JSON.stringify(id)) } catch { /* mode privé */ }
  applyTheme(id)
  window.dispatchEvent(new Event(EVT))
}

const subscribe = (fn: () => void) => {
  window.addEventListener(EVT, fn)
  return () => window.removeEventListener(EVT, fn)
}
export const useTheme = () => useSyncExternalStore(subscribe, getTheme)
