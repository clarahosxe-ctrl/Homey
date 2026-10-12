import { useSyncExternalStore } from 'react'

export interface ThemeDef {
  id: string
  label: string
  hint: string
  /** aperçu : fond, carte, accent, texte */
  preview: [string, string, string, string]
  /** pastilles de couleur supplémentaires dans l'aperçu */
  dots?: string[]
  /** fond de l'aperçu (dégradé…) si différent d'une couleur unie */
  bg?: string
}

export const THEMES: ThemeDef[] = [
  { id: 'glass', label: 'Liquid Glass', hint: 'Verre dépoli translucide sur un fond de couleurs fluides', preview: ['#eaf0fb', 'rgba(255,255,255,0.7)', '#4f8cff', '#14213d'], dots: ['#4f8cff', '#ff7ab8', '#34d1a0'], bg: 'radial-gradient(circle at 15% 15%, #ffc4e1, transparent 60%), radial-gradient(circle at 90% 20%, #b3d2ff, transparent 60%), radial-gradient(circle at 20% 95%, #bff3dc, transparent 60%), #eaf0fb' },
  { id: 'glass-dark', label: 'Liquid Glass sombre', hint: 'La version nocturne du verre liquide', preview: ['#0b0d1c', 'rgba(255,255,255,0.14)', '#7aa2ff', '#f1f4ff'], dots: ['#7aa2ff', '#ff6fb0', '#34d1a0'], bg: 'radial-gradient(circle at 15% 15%, rgba(120,70,255,0.6), transparent 60%), radial-gradient(circle at 90% 20%, rgba(0,150,255,0.5), transparent 60%), radial-gradient(circle at 20% 95%, rgba(255,60,150,0.4), transparent 60%), #0b0d1c' },
  { id: 'color', label: 'Coloré', hint: 'Clair et coloré : une couleur par rubrique, boutons bleu nuit', preview: ['#f5f5f9', '#ffffff', '#22b79a', '#1c1c2b'], dots: ['#22b79a', '#e0457b', '#f2a33a'] },
  { id: 'color-dark', label: 'Coloré sombre', hint: 'La version sombre du thème coloré', preview: ['#12121c', '#1d1d2c', '#22b79a', '#f1f1f8'], dots: ['#22b79a', '#e0457b', '#f2a33a'] },
  { id: 'auto', label: 'Automatique', hint: 'Suit le mode clair / sombre du téléphone', preview: ['#f1efe9', '#1d1a16', '#2f7d68', '#1f2a27'] },
  { id: 'clair', label: 'Clair', hint: 'Crème et vert, le thème d’origine', preview: ['#f1efe9', '#ffffff', '#2f7d68', '#1f2a27'] },
  { id: 'sombre', label: 'Sombre', hint: 'Brun chaud, doux pour les yeux', preview: ['#1d1a16', '#27231e', '#2f7d68', '#f2eadf'] },
  { id: 'nuit', label: 'Nuit', hint: 'Bleu nuit', preview: ['#0f1420', '#171e2e', '#6aa6ff', '#e8edf7'] },
  { id: 'amoled', label: 'Noir pur', hint: 'Fond noir, économe sur écran OLED', preview: ['#000000', '#0c0c0c', '#3ddc97', '#f4f4f4'] },
  { id: 'ocean', label: 'Océan', hint: 'Bleus frais', preview: ['#e9f2f7', '#ffffff', '#1f78a8', '#0f2a3a'] },
  { id: 'foret', label: 'Forêt', hint: 'Verts naturels', preview: ['#edf1e8', '#fbfdf8', '#3c7a3c', '#1c2a1c'] },
  { id: 'rose', label: 'Rose poudré', hint: 'Doux et lumineux', preview: ['#fbf0f2', '#ffffff', '#c4486e', '#3a1f28'] },
  { id: 'sepia', label: 'Sépia', hint: 'Papier ancien', preview: ['#f3e9d7', '#fbf5e8', '#9a6b2f', '#3b2f20'] },
]

const KEY = 'homey:theme'
const EVT = 'homey-theme'

export function getTheme(): string {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return 'color' // thème par défaut
    const t = JSON.parse(raw)
    return THEMES.some((x) => x.id === t) ? t : 'color'
  } catch {
    return 'auto'
  }
}

/** Convertit n'importe quelle couleur CSS (color-mix, color(srgb…)) en rgb() simple, comprise partout. */
function cssToRgb(css: string) {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 1
    const x = c.getContext('2d', { willReadFrequently: true })!
    x.fillStyle = '#000'; x.fillStyle = css; x.fillRect(0, 0, 1, 1)
    const [r, g, b] = x.getImageData(0, 0, 1, 1).data
    return `rgb(${r}, ${g}, ${b})`
  } catch { return css }
}

/** Thèmes sombres : la barre d'état de l'iPhone devient transparente (texte blanc) et le fond de l'app passe dessous. */
const DARK_THEMES = ['sombre', 'nuit', 'amoled', 'color-dark', 'glass-dark']
export const isDarkTheme = (id: string) =>
  DARK_THEMES.includes(id) || (id === 'auto' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)

export function applyTheme(id: string) {
  const root = document.documentElement
  if (id === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', id)
  document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', isDarkTheme(id) ? 'black-translucent' : 'default')
  // barre du navigateur : couleur du fond (après application du thème)
  requestAnimationFrame(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', cssToRgb(getComputedStyle(document.documentElement).backgroundColor))
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
