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
  { id: 'voyages', title: 'Voyages', icon: '✈️', hue: '#3f8fa0', blurb: 'Planifier, budgéter, checklist valises', ready: false },
  { id: 'animaux', title: 'Animaux', icon: '🐾', hue: '#c9922e', blurb: 'Vaccins, vétérinaire, poids, traitements', ready: false },
  { id: 'budget', title: 'Budget', icon: '💶', hue: '#6b8f3a', blurb: 'Dépenses, abonnements, objectifs', ready: false },
  { id: 'cadeaux', title: 'Cadeaux', icon: '🎁', hue: '#c4607e', blurb: 'Idées par personne, déjà offert', ready: false },
  { id: 'vehicules', title: 'Véhicules', icon: '🚗', hue: '#6a7480', blurb: 'Entretien, CT, assurance, carburant', ready: false },
  // idées proposées
  { id: 'repas', title: 'Repas', icon: '🍽️', hue: '#d98a3a', blurb: 'Menu de la semaine, recettes → courses', ready: false },
  { id: 'maison', title: 'Maison', icon: '🔧', hue: '#8a6d4f', blurb: 'Entretien, travaux, garanties, artisans', ready: false },
  { id: 'documents', title: 'Documents', icon: '📁', hue: '#5a6fa8', blurb: 'Papiers, contrats, dates d’échéance', ready: false },
  { id: 'abonnements', title: 'Abonnements', icon: '🔁', hue: '#a85a7a', blurb: 'Renouvellements et résiliations', ready: false },
  { id: 'sante', title: 'Santé', icon: '🩺', hue: '#c25a5a', blurb: 'RDV médicaux, ordonnances, vaccins', ready: false },
  { id: 'enfants', title: 'Enfants', icon: '🎒', hue: '#e0a030', blurb: 'École, activités, vacances scolaires', ready: false },
  { id: 'jardin', title: 'Jardin & plantes', icon: '🪴', hue: '#4f8f4f', blurb: 'Arrosage, semis, tailles', ready: false },
  { id: 'energie', title: 'Énergie', icon: '⚡', hue: '#d4b020', blurb: 'Relevés compteurs, factures', ready: false },
  { id: 'souvenirs', title: 'Souvenirs', icon: '📸', hue: '#7a6fb0', blurb: 'Journal du foyer, photos du mois', ready: false },
  { id: 'wishlist', title: 'Envies', icon: '✨', hue: '#d06a9a', blurb: 'Sorties, restos, films à voir', ready: false },
]

export const getModule = (id: string) => MODULES.find((m) => m.id === id)
