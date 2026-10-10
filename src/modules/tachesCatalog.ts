import type { ChoreProfile } from '../lib/types'

export interface Suggestion {
  id: string
  icon: string
  name: string
  zone: string
  every: number // jours, avant ajustement selon le niveau d'exigence
}

interface Template {
  id: string
  icon: string
  name: string
  zone: string
  every: (p: ChoreProfile) => number
  when?: (p: ChoreProfile) => boolean
  fixed?: boolean // fréquence non modifiée par le niveau d'exigence (tâches quotidiennes)
}

export const DEFAULT_PROFILE: ChoreProfile = {
  done: false, housing: 'appartement', bedrooms: 2, bathrooms: 1, floors: 1, kids: 0, baby: false,
  pets: [], garden: false, balcony: false, plants: false, dishwasher: true, level: 'standard',
}

const hasPet = (p: ChoreProfile) => p.pets.length > 0
const busy = (p: ChoreProfile) => hasPet(p) || p.kids > 0 || p.baby

const T: Template[] = [
  // Cuisine
  { id: 'vaisselle', icon: '🍽️', name: 'Lancer / vider le lave-vaisselle', zone: 'Cuisine', every: () => 1, fixed: true, when: (p) => p.dishwasher },
  { id: 'vaisselle-main', icon: '🍽️', name: 'Faire la vaisselle', zone: 'Cuisine', every: () => 1, fixed: true, when: (p) => !p.dishwasher },
  { id: 'cuisine', icon: '🍳', name: 'Nettoyer la cuisine (plans, plaques, évier)', zone: 'Cuisine', every: () => 3 },
  { id: 'poubelle-cuisine', icon: '🗑️', name: 'Laver la poubelle de cuisine', zone: 'Cuisine', every: () => 14 },
  { id: 'frigo', icon: '🧊', name: 'Nettoyer et trier le frigo', zone: 'Cuisine', every: () => 30 },
  { id: 'four', icon: '🔥', name: 'Nettoyer le four et le micro-ondes', zone: 'Cuisine', every: () => 60 },
  { id: 'hotte', icon: '💨', name: 'Nettoyer la hotte', zone: 'Cuisine', every: () => 90 },
  { id: 'lv-filtre', icon: '🧽', name: 'Nettoyer le filtre du lave-vaisselle', zone: 'Cuisine', every: () => 30, when: (p) => p.dishwasher },
  { id: 'congelo', icon: '❄️', name: 'Dégivrer le congélateur', zone: 'Cuisine', every: () => 180 },
  // Salle de bain & WC
  { id: 'sdb', icon: '🚿', name: 'Nettoyer la salle de bain', zone: 'Salle de bain', every: () => 7 },
  { id: 'sdb2', icon: '🛁', name: 'Nettoyer la 2e salle de bain', zone: 'Salle de bain', every: () => 7, when: (p) => p.bathrooms >= 2 },
  { id: 'wc', icon: '🚽', name: 'Nettoyer les WC', zone: 'Salle de bain', every: () => 7 },
  { id: 'detartrage', icon: '🔧', name: 'Détartrer robinets et pommeau de douche', zone: 'Salle de bain', every: () => 30 },
  // Sols & pièces de vie
  { id: 'aspi', icon: '🧹', name: 'Passer l’aspirateur (pièces de vie)', zone: 'Sols', every: (p) => (busy(p) ? 2 : 4) },
  { id: 'aspi-chambres', icon: '🧹', name: 'Aspirer les chambres', zone: 'Sols', every: () => 7, when: (p) => p.bedrooms > 0 },
  { id: 'aspi-etage', icon: '🪜', name: 'Aspirer l’étage', zone: 'Sols', every: () => 7, when: (p) => p.housing === 'maison' && p.floors > 1 },
  { id: 'serpillere', icon: '🪣', name: 'Passer la serpillière', zone: 'Sols', every: (p) => (busy(p) ? 4 : 7) },
  { id: 'poussiere', icon: '🪶', name: 'Dépoussiérer meubles et étagères', zone: 'Salon', every: () => 7 },
  { id: 'poignees', icon: '🚪', name: 'Désinfecter poignées et interrupteurs', zone: 'Salon', every: () => 14 },
  { id: 'vitres', icon: '🪟', name: 'Nettoyer les vitres', zone: 'Salon', every: (p) => (p.housing === 'maison' ? 45 : 60) },
  { id: 'plinthes', icon: '📏', name: 'Nettoyer les plinthes', zone: 'Salon', every: () => 90 },
  { id: 'rideaux', icon: '🪟', name: 'Laver les rideaux', zone: 'Salon', every: () => 180 },
  { id: 'sac-aspi', icon: '🔋', name: 'Vider / entretenir l’aspirateur', zone: 'Sols', every: () => 30 },
  // Chambres & linge
  { id: 'draps', icon: '🛏️', name: 'Changer les draps', zone: 'Chambres', every: () => 14, when: (p) => p.bedrooms > 0 },
  { id: 'draps-enfants', icon: '🧸', name: 'Changer les draps des enfants', zone: 'Chambres', every: () => 14, when: (p) => p.kids > 0 },
  { id: 'rangement-enfants', icon: '🧺', name: 'Ranger et trier les chambres d’enfants', zone: 'Chambres', every: () => 7, when: (p) => p.kids > 0 },
  { id: 'matelas', icon: '🛌', name: 'Retourner / aérer les matelas', zone: 'Chambres', every: () => 180, when: (p) => p.bedrooms > 0 },
  { id: 'lessive', icon: '🧺', name: 'Faire une lessive', zone: 'Linge', every: (p) => (p.baby ? 1 : p.kids > 0 ? 2 : 3), fixed: true },
  { id: 'repassage', icon: '👔', name: 'Repassage', zone: 'Linge', every: () => 7 },
  { id: 'machine', icon: '🌀', name: 'Nettoyer la machine à laver (cycle à vide)', zone: 'Linge', every: () => 60 },
  // Enfants & bébé
  { id: 'biberons', icon: '🍼', name: 'Stériliser les biberons', zone: 'Bébé', every: () => 1, fixed: true, when: (p) => p.baby },
  { id: 'chaise-haute', icon: '🪑', name: 'Désinfecter la chaise haute', zone: 'Bébé', every: () => 7, when: (p) => p.baby },
  { id: 'jouets', icon: '🧸', name: 'Laver les jouets', zone: 'Enfants', every: () => 30, when: (p) => p.kids > 0 || p.baby },
  { id: 'vetements-trop-petits', icon: '👕', name: 'Trier les vêtements trop petits', zone: 'Enfants', every: () => 90, when: (p) => p.kids > 0 || p.baby },
  // Animaux
  { id: 'litiere', icon: '🐱', name: 'Nettoyer la litière', zone: 'Animaux', every: () => 1, fixed: true, when: (p) => p.pets.includes('chat') },
  { id: 'litiere-complete', icon: '🐱', name: 'Changer la litière complète', zone: 'Animaux', every: () => 14, when: (p) => p.pets.includes('chat') },
  { id: 'brosser-chien', icon: '🐶', name: 'Brosser le chien', zone: 'Animaux', every: () => 7, when: (p) => p.pets.includes('chien') },
  { id: 'gamelles', icon: '🥣', name: 'Laver les gamelles', zone: 'Animaux', every: () => 3, when: hasPet },
  { id: 'panier', icon: '🛏️', name: 'Laver le panier / coussin de l’animal', zone: 'Animaux', every: () => 30, when: hasPet },
  { id: 'poils', icon: '🐾', name: 'Aspirer les poils (canapé, tapis)', zone: 'Animaux', every: () => 7, when: hasPet },
  // Extérieur & plantes
  { id: 'tondre', icon: '🌱', name: 'Tondre la pelouse', zone: 'Extérieur', every: () => 14, when: (p) => p.garden },
  { id: 'desherber', icon: '🌿', name: 'Désherber', zone: 'Extérieur', every: () => 14, when: (p) => p.garden },
  { id: 'haies', icon: '✂️', name: 'Tailler les haies', zone: 'Extérieur', every: () => 90, when: (p) => p.garden },
  { id: 'arroser-jardin', icon: '💦', name: 'Arroser le jardin', zone: 'Extérieur', every: () => 3, when: (p) => p.garden },
  { id: 'terrasse', icon: '🪑', name: 'Nettoyer le balcon / la terrasse', zone: 'Extérieur', every: () => 30, when: (p) => p.balcony || p.garden },
  { id: 'plantes', icon: '🪴', name: 'Arroser les plantes d’intérieur', zone: 'Extérieur', every: () => 7, when: (p) => p.plants },
]

const FACTOR = { leger: 1.5, standard: 1, meticuleux: 0.65 } as const

/** Tâches conseillées pour ce foyer, avec une fréquence ajustée au niveau d'exigence. */
export function suggest(p: ChoreProfile): Suggestion[] {
  return T.filter((t) => !t.when || t.when(p)).map((t) => {
    const base = t.every(p)
    const every = t.fixed ? base : Math.max(1, Math.round(base * FACTOR[p.level]))
    return { id: t.id, icon: t.icon, name: t.name, zone: t.zone, every }
  })
}
