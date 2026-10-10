export interface TrackerConfig {
  key: string // clé de stockage ; le journal est dans `${key}-log`
  moduleId: string // id de la mini-appli (registry)
  newLabel: string // titre du formulaire
  addLabel: string // libellé du bouton
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
  moduleId: 'animaux',
  newLabel: 'Nouvel animal',
  addLabel: '+ Ajouter un animal',
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
  moduleId: 'vehicules',
  newLabel: 'Nouveau véhicule',
  addLabel: '+ Ajouter un véhicule',
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

export const HEALTH: TrackerConfig = {
  key: 'health',
  moduleId: 'sante',
  newLabel: 'Nouvelle personne',
  addLabel: '+ Ajouter une personne',
  subjectLabel: 'personne',
  emojis: ['🙂', '👩', '👨', '👧', '👦', '👶', '🧓', '👵'],
  extraLabel: 'Né(e) le',
  extraType: 'date',
  kinds: [
    { id: 'medecin', label: 'Médecin', icon: '🩺' },
    { id: 'dentiste', label: 'Dentiste', icon: '🦷', everyDays: 365 },
    { id: 'ophtalmo', label: 'Ophtalmo', icon: '👓', everyDays: 730 },
    { id: 'vaccin', label: 'Vaccin / rappel', icon: '💉', everyDays: 3650 },
    { id: 'ordonnance', label: 'Ordonnance', icon: '📄', everyDays: 90 },
    { id: 'analyses', label: 'Analyses', icon: '🧪', everyDays: 365 },
    { id: 'autre', label: 'Autre', icon: '📌' },
  ],
  metric: { label: 'Poids', unit: 'kg' },
  empty: 'Ajoutez les membres du foyer pour suivre rendez-vous et rappels 🩺',
}

export const HOME: TrackerConfig = {
  key: 'home',
  moduleId: 'maison',
  newLabel: 'Nouvel équipement',
  addLabel: '+ Ajouter un équipement',
  subjectLabel: 'équipement',
  emojis: ['🔥', '🚿', '🧺', '🍳', '❄️', '🪟', '🏠', '🔌', '🛋️', '💧'],
  extraLabel: 'Marque / modèle',
  extraType: 'text',
  kinds: [
    { id: 'entretien', label: 'Entretien', icon: '🔧', everyDays: 365 },
    { id: 'garantie', label: 'Garantie (fin)', icon: '🛡️' },
    { id: 'reparation', label: 'Réparation', icon: '🛠️' },
    { id: 'travaux', label: 'Travaux', icon: '🧱' },
    { id: 'nettoyage', label: 'Nettoyage', icon: '🧽', everyDays: 90 },
    { id: 'autre', label: 'Autre', icon: '📌' },
  ],
  empty: 'Chaudière, lave-linge, toiture… Ajoutez un premier équipement 🔧',
}

export const PLANTS: TrackerConfig = {
  key: 'plants',
  moduleId: 'jardin',
  newLabel: 'Nouvelle plante',
  addLabel: '+ Ajouter une plante',
  subjectLabel: 'plante',
  emojis: ['🪴', '🌿', '🌻', '🌹', '🍅', '🌳', '🌵', '🍓', '🌷'],
  extraLabel: 'Emplacement',
  extraType: 'text',
  kinds: [
    { id: 'arrosage', label: 'Arrosage', icon: '💧', everyDays: 7 },
    { id: 'engrais', label: 'Engrais', icon: '🧪', everyDays: 30 },
    { id: 'rempotage', label: 'Rempotage', icon: '🪴', everyDays: 365 },
    { id: 'taille', label: 'Taille', icon: '✂️', everyDays: 180 },
    { id: 'traitement', label: 'Traitement', icon: '🧴', everyDays: 30 },
    { id: 'recolte', label: 'Récolte', icon: '🧺' },
    { id: 'autre', label: 'Autre', icon: '📌' },
  ],
  empty: 'Ajoutez votre première plante 🌱',
}

/** Toutes les mini-applis basées sur le socle "suivi". L'ordre doit rester constant (hooks). */
export const DOCUMENTS: TrackerConfig = {
  key: 'documents',
  moduleId: 'documents',
  newLabel: 'Nouveau document',
  addLabel: '+ Ajouter un document',
  subjectLabel: 'document',
  emojis: ['🛂', '🪪', '📄', '📑', '🏦', '🔐', '🏠', '🚗', '🎓'],
  extraLabel: 'Numéro / référence',
  extraType: 'text',
  kinds: [
    { id: 'validite', label: 'Validité / expiration', icon: '⏳' },
    { id: 'renouvele', label: 'Renouvelé', icon: '🔁' },
    { id: 'contrat', label: 'Contrat / échéance', icon: '📑' },
    { id: 'demarche', label: 'Démarche à faire', icon: '📮' },
    { id: 'autre', label: 'Autre', icon: '📌' },
  ],
  empty: 'Passeport, carte d’identité, contrats… Ajoutez un premier document 📁',
}

export const KIDS: TrackerConfig = {
  key: 'kids',
  moduleId: 'enfants',
  newLabel: 'Nouvel enfant',
  addLabel: '+ Ajouter un enfant',
  subjectLabel: 'enfant',
  emojis: ['👧', '👦', '🧒', '👶', '🧑'],
  extraLabel: 'École / classe',
  extraType: 'text',
  kinds: [
    { id: 'ecole', label: 'École (réunion, sortie)', icon: '🏫' },
    { id: 'activite', label: 'Activité (inscription)', icon: '🎨', everyDays: 365 },
    { id: 'vacances', label: 'Vacances (reprise)', icon: '🏖️' },
    { id: 'cantine', label: 'Cantine / garderie', icon: '🍽️', everyDays: 30 },
    { id: 'rdv', label: 'Rendez-vous', icon: '🗓️' },
    { id: 'autre', label: 'Autre', icon: '📌' },
  ],
  empty: 'Ajoutez vos enfants pour suivre école, activités et vacances 🎒',
}

export const TRACKERS: TrackerConfig[] = [PETS, VEHICLES, HEALTH, HOME, PLANTS, DOCUMENTS, KIDS]
