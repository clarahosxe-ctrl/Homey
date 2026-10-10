export interface TrackerConfig {
  key: string // clé de stockage ; le journal est dans `${key}-log`
  subjectLabel: string
  emojis: string[]
  extraLabel: string
  extraType: 'date' | 'text'
  kinds: { id: string; label: string; icon: string; everyDays?: number }[]
  metric?: { label: string; unit: string }
  empty: string
}

export const PETS: TrackerConfig = {
  key: 'pets',
  subjectLabel: 'animal',
  emojis: ['🐶', '🐱', '🐰', '🐹', '🐦', '🐠', '🐢', '🐴'],
  extraLabel: 'Né(e) le',
  extraType: 'date',
  kinds: [
    { id: 'vaccin', label: 'Vaccin', icon: '💉', everyDays: 365 },
    { id: 'vermifuge', label: 'Vermifuge', icon: '💊', everyDays: 90 },
    { id: 'antipuce', label: 'Anti-puces / tiques', icon: '🪲', everyDays: 30 },
    { id: 'veto', label: 'Visite véto', icon: '🩺', everyDays: 365 },
    { id: 'poids', label: 'Pesée', icon: '⚖️' },
    { id: 'toilettage', label: 'Toilettage', icon: '🛁', everyDays: 60 },
    { id: 'autre', label: 'Autre', icon: '📌' },
  ],
  metric: { label: 'Poids', unit: 'kg' },
  empty: 'Aucun animal. Ajoutez le premier 🐾',
}

export const VEHICLES: TrackerConfig = {
  key: 'vehicles',
  subjectLabel: 'véhicule',
  emojis: ['🚗', '🚙', '🚐', '🏍️', '🛵', '🚲', '🚛'],
  extraLabel: 'Immatriculation',
  extraType: 'text',
  kinds: [
    { id: 'entretien', label: 'Entretien / révision', icon: '🔧', everyDays: 365 },
    { id: 'ct', label: 'Contrôle technique', icon: '✅', everyDays: 730 },
    { id: 'assurance', label: 'Assurance', icon: '🛡️', everyDays: 365 },
    { id: 'carburant', label: 'Plein', icon: '⛽' },
    { id: 'pneus', label: 'Pneus', icon: '🛞', everyDays: 1460 },
    { id: 'reparation', label: 'Réparation', icon: '🛠️' },
    { id: 'autre', label: 'Autre', icon: '📌' },
  ],
  metric: { label: 'Kilométrage', unit: 'km' },
  empty: 'Aucun véhicule. Ajoutez le premier 🚗',
}
