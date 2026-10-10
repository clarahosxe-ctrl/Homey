export interface Member {
  id: string
  name: string
  color: string
  emoji?: string // avatar ; sinon l'initiale du prénom
  photo?: string // id de photo (voir lib/photos.ts)
}

export interface ShoppingItem {
  id: string
  label: string
  done: boolean
  by: string // member id
  category: string
}

export interface Bin {
  id: string
  name: string
  color: string
  days: number[] // Date.getDay() : 0 = dimanche
  everyWeeks: number // 1 = chaque semaine, 2 = une semaine sur deux…
  anchor: string // une date de la 1ère semaine de la série
}

export type WorkKind = 'teletravail' | 'deplacement' | 'cp' | 'rtt' | 'maladie' | 'autre'

export interface WorkEntry {
  id: string
  member: string
  kind: WorkKind
  from: string
  to: string
  note: string
  half?: boolean // demi-journée (une seule journée)
}

export interface Holiday {
  date: string
  name: string
}

export interface Chore {
  id: string
  name: string
  icon: string
  everyDays: number
  rotate: boolean // true = à tour de rôle entre les membres
  assignee: string // member id, si rotate = false ('' = tout le monde)
  lastDone: string // YYYY-MM-DD ou ''
  lastBy: string // member id
  history: { by: string; date: string }[]
  zone?: string // pièce / zone (Cuisine, Salle de bain…)
  firstDue?: string // 1re échéance (YYYY-MM-DD) tant que la tâche n'a jamais été faite
}

export interface ChoreProfile {
  done: boolean // questionnaire passé (ou ignoré)
  housing: 'appartement' | 'maison'
  bedrooms: number
  bathrooms: number
  floors: number
  kids: number
  baby: boolean
  pets: string[] // 'chien' | 'chat' | 'autre'
  garden: boolean
  balcony: boolean
  plants: boolean
  dishwasher: boolean
  level: 'leger' | 'standard' | 'meticuleux'
}

export type CodeFormat = 'CODE128' | 'EAN13' | 'QR'

export interface LoyaltyCard {
  id: string
  name: string
  number: string
  format: CodeFormat
  color: string
  owner: string // member id ('' = foyer)
}

export interface Birthday {
  id: string
  name: string
  day: number
  month: number // 1-12
  year?: number // année de naissance, facultative
  note: string
}

export type GiftStatus = 'idee' | 'achete' | 'offert'

export interface Gift {
  id: string
  title: string
  forId: string // id d'un membre ou d'un anniversaire ('' = personne saisie à la main)
  forName: string
  occasion: string
  status: GiftStatus
  price?: number
  url: string
  note: string
  by: string // member id
  photo?: string
}

export interface Recipe {
  id: string
  title: string
  ingredients: string[]
  photo?: string
}

export interface Meal {
  id: string
  date: string // YYYY-MM-DD
  slot: 'midi' | 'soir'
  title: string
  ingredients: string[]
  inCourses: boolean // ingrédients déjà envoyés aux courses
}

/** Socle générique "suivi" (animaux, véhicules…) : des sujets et un journal d'événements avec rappel. */
export interface TrackerSubject {
  id: string
  name: string
  emoji: string
  extra: string // date de naissance, plaque…
  photo?: string // photo principale
  photos?: string[] // album
}

export interface TrackerRecord {
  id: string
  subject: string
  kind: string
  date: string
  next: string // prochaine échéance (YYYY-MM-DD) ou ''
  metric?: number // poids, kilométrage…
  nextMetric?: number // prochain kilométrage visé (entretien)
  qty?: number // litres ou kWh (plein / recharge)
  detail?: string // lieu de recharge, etc.
  cost?: number
  note: string
  by: string
}

export interface Txn {
  id: string
  date: string
  label: string
  amount: number
  category: string
  by: string // payeur (member id)
  shared: boolean // dépense commune à répartir
  income: boolean
}

export interface TripItem {
  id: string
  date: string
  label: string
  kind: string
  cost?: number
  paid?: boolean
  payer?: string // id d'un voyageur
}

export interface PackItem {
  id: string
  label: string
  done: boolean
  who?: string // id d'un voyageur ; absent = commun
}

export interface Traveler {
  id: string // id du membre du foyer, ou identifiant d'invité
  name: string
  member?: string
  kind: 'adulte' | 'enfant' | 'bebe'
  doc?: 'passeport' | 'cni' | ''
  docExpiry?: string
}

export interface TripStop { id: string; name: string; from: string; to: string }

export interface Booking {
  id: string
  kind: string // vol | train | hebergement | location | activite | autre
  title: string
  ref: string // n° de réservation
  date: string
  time?: string
  endDate?: string
  link: string
  cost?: number
  paid: boolean
  payer?: string
  note: string
}

export interface TripExpense { id: string; date: string; label: string; category: string; amount: number; payer?: string }
export interface TripTodo { id: string; label: string; done: boolean; due?: string }
export interface TripIdea { id: string; title: string; category: string; note: string; link: string; done: boolean; planned?: boolean }

export interface Trip {
  id: string
  name: string
  destination: string
  from: string
  to: string
  budget?: number
  plan: TripItem[]
  packing: PackItem[]
  stops?: TripStop[]
  bookings?: Booking[]
  travelers?: Traveler[]
  expenses?: TripExpense[]
  todos?: TripTodo[]
  ideas?: TripIdea[]
  geo?: { lat: number; lon: number; label: string }
  photo?: string // couverture
  photos?: string[] // album
}

export interface Subscription {
  id: string
  name: string
  emoji: string
  amount: number
  months: number // 1 = mensuel, 3 = trimestriel, 12 = annuel
  date: string // une date de prélèvement (la 1ère ou la dernière)
  notice?: number // préavis de résiliation (jours)
  by: string
}

export interface Baby {
  id: string
  name: string
  birth: string // YYYY-MM-DD
  photo?: string
}

export type BabyKind = 'biberon' | 'tetee' | 'couche' | 'sommeil' | 'mesure' | 'jalon'

export interface BabyLog {
  id: string
  baby: string
  kind: BabyKind
  at: string // YYYY-MM-DDTHH:mm (heure locale)
  end?: string // sommeil : heure de réveil (absent = il dort encore)
  value?: number // ml (biberon) ou minutes (tétée)
  detail?: string // couche : pipi | selle | mixte
  weight?: number // kg (mesure)
  height?: number // cm (mesure)
  photo?: string // photo d'une première fois
  note: string
  by: string
}

export interface Meter {
  id: string
  name: string
  emoji: string
  unit: string
}

export interface Reading {
  id: string
  meter: string
  date: string
  index: number
  cost?: number
}

export interface Wish {
  id: string
  title: string
  category: string
  done: boolean
  likes: string[] // member ids
  note: string
  by: string
}

/** Fiche détaillée d'un animal (étend le socle "suivi" : mêmes id/name/emoji/extra). */
export interface Pet extends TrackerSubject {
  species?: string // chien | chat | lapin | rongeur | oiseau | poisson | reptile | cheval | autre
  breed?: string
  sex?: 'm' | 'f' | ''
  neutered?: 'oui' | 'non' | ''
  birth?: string
  color?: string
  chip?: string
  food?: string
  vetName?: string
  vetPhone?: string
  insurer?: string
  insuranceNo?: string
  insurancePrice?: number // €/mois
  notes?: string
}

export interface Vehicle extends TrackerSubject {
  kind?: string // voiture | utilitaire | moto | scooter | velo | camping-car | autre
  brand?: string
  model?: string
  color?: string
  year?: number
  vin?: string
  energy?: string // essence | diesel | hybride | phev | electrique | gpl | autre
  km?: number
  kmDate?: string
  insurer?: string
  insuranceNo?: string
  insuranceFormula?: string
  insurancePrice?: number // €/mois
  battery?: number // kWh (électrique / hybride rechargeable)
  range?: number // autonomie annoncée (km)
  homeRate?: number // tarif de recharge à domicile (€/kWh)
  tires?: { fitted?: string; km?: number; size?: string; brand?: string; depth?: number; lifespan?: number }
  notes?: string
}

/** Un soin / rendez-vous récurrent (coiffeur, beauté…), propre à une personne. */
export interface Appt {
  id: string
  owner: string // member id
  group: string // cheveux | barbier | beaute | bienetre | autre
  name: string
  icon: string
  everyDays: number // intervalle conseillé entre deux rendez-vous
  provider: string // salon / praticien
  phone: string
  price?: number // tarif habituel
  note: string
  history: { date: string; cost?: number }[]
  booked?: string // date du prochain rendez-vous pris
  bookedTime?: string
}
