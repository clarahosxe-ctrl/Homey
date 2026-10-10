export const VTYPES = [
  { id: 'voiture', icon: '🚗', label: 'Voiture' },
  { id: 'utilitaire', icon: '🚐', label: 'Utilitaire' },
  { id: 'moto', icon: '🏍️', label: 'Moto' },
  { id: 'scooter', icon: '🛵', label: 'Scooter' },
  { id: 'velo', icon: '🚲', label: 'Vélo' },
  { id: 'camping-car', icon: '🚌', label: 'Camping-car' },
  { id: 'autre', icon: '🚙', label: 'Autre' },
]
export const vtype = (id?: string) => VTYPES.find((t) => t.id === id)

export const ENERGIES = [
  { id: 'essence', label: '⛽ Essence' },
  { id: 'diesel', label: '🛢️ Diesel' },
  { id: 'hybride', label: '🔋 Hybride' },
  { id: 'phev', label: '🔌 Hybride rechargeable' },
  { id: 'electrique', label: '⚡ Électrique' },
  { id: 'gpl', label: '♻️ GPL / E85' },
  { id: 'autre', label: 'Autre' },
]
export const isElectric = (e?: string) => e === 'electrique'
export const canCharge = (e?: string) => e === 'electrique' || e === 'phev'
export const usesFuel = (e?: string) => e !== 'electrique'

export const BRANDS = ['Renault', 'Peugeot', 'Citroën', 'Dacia', 'Volkswagen', 'Toyota', 'Ford', 'Opel', 'Fiat', 'Skoda', 'Seat', 'Hyundai', 'Kia', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Mini', 'Mazda', 'Suzuki', 'Volvo', 'Honda', 'Yamaha']

export interface MItem { id: string; label: string; every: number; everyKm?: number; hint?: string }

const ICE: MItem[] = [
  { id: 'vidange', label: 'Vidange + filtre à huile', every: 365, everyKm: 15000 },
  { id: 'filtre-air', label: 'Filtre à air', every: 730, everyKm: 30000 },
  { id: 'filtre-habitacle', label: 'Filtre d’habitacle', every: 365, everyKm: 15000 },
  { id: 'plaquettes', label: 'Plaquettes de frein', every: 730, everyKm: 30000 },
  { id: 'disques', label: 'Disques de frein', every: 1460, everyKm: 60000 },
  { id: 'liquide-frein', label: 'Liquide de frein', every: 730 },
  { id: 'refroidissement', label: 'Liquide de refroidissement', every: 1460, everyKm: 60000 },
  { id: 'batterie', label: 'Batterie 12 V', every: 1825 },
  { id: 'clim', label: 'Entretien de la climatisation', every: 730 },
  { id: 'geometrie', label: 'Géométrie / parallélisme', every: 730 },
  { id: 'revision', label: 'Révision constructeur', every: 365, everyKm: 15000 },
]
const BY_ENERGY: Record<string, MItem[]> = {
  essence: [{ id: 'bougies', label: 'Bougies d’allumage', every: 1460, everyKm: 60000 }, { id: 'courroie', label: 'Courroie de distribution', every: 1825, everyKm: 100000, hint: 'Selon constructeur (ou chaîne : à contrôler)' }],
  diesel: [{ id: 'filtre-carburant', label: 'Filtre à carburant', every: 730, everyKm: 30000 }, { id: 'courroie', label: 'Courroie de distribution', every: 1825, everyKm: 100000, hint: 'Selon constructeur (ou chaîne : à contrôler)' }],
  gpl: [{ id: 'bougies', label: 'Bougies d’allumage', every: 1460, everyKm: 60000 }, { id: 'courroie', label: 'Courroie de distribution', every: 1825, everyKm: 100000 }, { id: 'gpl', label: 'Contrôle du circuit GPL / E85', every: 365 }],
  hybride: [{ id: 'courroie', label: 'Courroie de distribution', every: 1825, everyKm: 100000, hint: 'Selon constructeur' }, { id: 'batterie-hybride', label: 'Contrôle de la batterie hybride', every: 730 }],
  phev: [{ id: 'courroie', label: 'Courroie de distribution', every: 1825, everyKm: 100000, hint: 'Selon constructeur' }, { id: 'batterie-traction', label: 'Santé de la batterie de traction', every: 365 }],
}
const ELECTRIC: MItem[] = [
  { id: 'revision', label: 'Révision constructeur', every: 730, everyKm: 30000 },
  { id: 'batterie-traction', label: 'Santé de la batterie de traction', every: 365, hint: 'Indicateur SoH, au garage ou via l’appli' },
  { id: 'filtre-habitacle', label: 'Filtre d’habitacle', every: 365, everyKm: 15000 },
  { id: 'plaquettes', label: 'Plaquettes de frein', every: 1095, hint: 'Usure réduite grâce au freinage régénératif' },
  { id: 'liquide-frein', label: 'Liquide de frein', every: 730 },
  { id: 'refroidissement-batterie', label: 'Liquide de refroidissement (batterie)', every: 1460, hint: 'Selon constructeur' },
  { id: 'batterie', label: 'Batterie 12 V', every: 1825 },
  { id: 'clim', label: 'Entretien de la climatisation', every: 730 },
  { id: 'geometrie', label: 'Géométrie / parallélisme', every: 730 },
]
const VELO: MItem[] = [
  { id: 'revision', label: 'Révision complète', every: 365 },
  { id: 'chaine', label: 'Chaîne (nettoyage, graissage)', every: 60 },
  { id: 'freins', label: 'Freins (plaquettes, câbles)', every: 180 },
  { id: 'gonflage', label: 'Pression des pneus', every: 14 },
]
const MOTO_EXTRA: MItem[] = [{ id: 'chaine', label: 'Chaîne (graissage, tension)', every: 30 }, { id: 'kit-chaine', label: 'Kit chaîne', every: 1460, everyKm: 20000 }]

/** Entretien conseillé selon le type et l'énergie (indicatif : suivez le carnet du constructeur). */
export function maintenanceItems(type?: string, energy?: string): MItem[] {
  if (type === 'velo') return VELO
  if (energy === 'electrique') return ELECTRIC
  const base = ICE
  const extra = BY_ENERGY[energy ?? 'essence'] ?? BY_ENERGY.essence
  const merged = [...base, ...extra.filter((e) => !base.some((b) => b.id === e.id))]
  return type === 'moto' || type === 'scooter' ? [...merged.filter((i) => !['filtre-habitacle', 'clim'].includes(i.id)), ...MOTO_EXTRA] : merged
}

export const hasCT = (type?: string) => ['voiture', 'utilitaire', 'camping-car', undefined, ''].includes(type)

export const VEXPENSES = [
  { id: 'carburant', label: 'Carburant', icon: '⛽' },
  { id: 'recharge', label: 'Recharge', icon: '⚡' },
  { id: 'reparation', label: 'Réparation', icon: '🛠️' },
  { id: 'pneus', label: 'Pneus', icon: '🛞' },
  { id: 'peage', label: 'Péage', icon: '🛣️' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'lavage', label: 'Lavage', icon: '🧽' },
  { id: 'amende', label: 'Amende', icon: '🚫' },
  { id: 'accessoires', label: 'Accessoires', icon: '🧰' },
  { id: 'autre', label: 'Autre', icon: '📌' },
]
