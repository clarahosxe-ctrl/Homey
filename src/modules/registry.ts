export interface ModuleInfo {
  id: string
  title: string
  icon: string
  hue: string // couleur d'accent de la carte
  tint?: [string, string] // dégradé pastel de la tuile (modules prêts)
  blurb: string
  ready: boolean
}

/** Toutes les mini-applis du hub. `ready: false` = carte "bientôt". */
export const MODULES: ModuleInfo[] = [
  { id: 'courses', title: 'Courses', icon: '🛒', hue: '#2f7d68', tint: ['#c3e6d6', '#a6cdbe'], blurb: 'Liste partagée à cocher', ready: true },
  { id: 'poubelles', title: 'Poubelles', icon: '🗑️', hue: '#a8873a', tint: ['#ebdfc0', '#d8c6a0'], blurb: 'Ramassages récurrents', ready: true },
  { id: 'travail', title: 'Travail', icon: '💼', hue: '#4f7cac', tint: ['#cde2ea', '#b0cbd8'], blurb: 'Télétravail, CP, RTT, déplacements', ready: true },
  { id: 'taches', title: 'Tâches ménagères', icon: '🧹', hue: '#3f8f86', tint: ['#bfe0da', '#a2cbc5'], blurb: 'Corvées récurrentes, à tour de rôle', ready: true },
  { id: 'fidelite', title: 'Cartes de fidélité', icon: '💳', hue: '#8a6fb0', tint: ['#ddd3ea', '#c8bbdc'], blurb: 'Codes-barres de toutes vos cartes', ready: true },
  { id: 'anniversaires', title: 'Anniversaires', icon: '🎂', hue: '#c4607e', tint: ['#f2d3dc', '#e6b9c6'], blurb: 'Dates, âges, rappels', ready: true },
  { id: 'cadeaux', title: 'Cadeaux', icon: '🎁', hue: '#c9722e', tint: ['#f5dcc4', '#ebc2a0'], blurb: 'Idées par personne, déjà offert', ready: true },
  { id: 'voyages', title: 'Voyages', icon: '✈️', hue: '#2f8fb0', tint: ['#c8e6f0', '#a3d0e0'], blurb: 'Programme, valise, budget', ready: true },
  { id: 'animaux', title: 'Animaux', icon: '🐾', hue: '#5f9a58', tint: ['#d9e8cf', '#bcd6b0'], blurb: 'Vaccins, véto, poids', ready: true },
  { id: 'vehicules', title: 'Véhicules', icon: '🚗', hue: '#6a7480', tint: ['#dadde2', '#bcc2cb'], blurb: 'Entretien, CT, assurance', ready: true },
  { id: 'budget', title: 'Budget', icon: '💶', hue: '#8f9a32', tint: ['#e4e8c4', '#d0d89f'], blurb: 'Dépenses et équilibre du foyer', ready: true },
  { id: 'sante', title: 'Santé', icon: '🩺', hue: '#c25a5a', tint: ['#f3d0cc', '#e7b3ad'], blurb: 'RDV, ordonnances, rappels', ready: true },
  { id: 'maison', title: 'Maison', icon: '🔧', hue: '#8a6d4f', tint: ['#ead7bf', '#d9bd9a'], blurb: 'Entretien, garanties, travaux', ready: true },
  { id: 'jardin', title: 'Jardin & plantes', icon: '🪴', hue: '#4f8f4f', tint: ['#cfe6c4', '#b2d6a2'], blurb: 'Arrosage, engrais, tailles', ready: true },
  { id: 'abonnements', title: 'Abonnements', icon: '🔁', hue: '#6f68b8', tint: ['#d9d6ef', '#bfbae2'], blurb: 'Renouvellements et coût total', ready: true },
  { id: 'repas', title: 'Repas', icon: '🍽️', hue: '#b8861f', tint: ['#f3e6bd', '#e6d296'], blurb: 'Menu de la semaine, recettes → courses', ready: true },
  // idées proposées
  { id: 'documents', title: 'Documents', icon: '📁', hue: '#5a6fa8', blurb: 'Papiers, contrats, dates d’échéance', ready: false },
  { id: 'enfants', title: 'Enfants', icon: '🎒', hue: '#e0a030', blurb: 'École, activités, vacances scolaires', ready: false },
  { id: 'energie', title: 'Énergie', icon: '⚡', hue: '#d4b020', blurb: 'Relevés compteurs, factures', ready: false },
  { id: 'souvenirs', title: 'Souvenirs', icon: '📸', hue: '#7a6fb0', blurb: 'Journal du foyer, photos du mois', ready: false },
  { id: 'wishlist', title: 'Envies', icon: '✨', hue: '#d06a9a', blurb: 'Sorties, restos, films à voir', ready: false },
]

export const getModule = (id: string) => MODULES.find((m) => m.id === id)
