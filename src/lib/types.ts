export interface Member {
  id: string
  name: string
  color: string
  emoji?: string // avatar ; sinon l'initiale du prénom
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
}

export interface Recipe {
  id: string
  title: string
  ingredients: string[]
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
}

export interface TrackerRecord {
  id: string
  subject: string
  kind: string
  date: string
  next: string // prochaine échéance (YYYY-MM-DD) ou ''
  metric?: number // poids, kilométrage…
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
}

export interface Trip {
  id: string
  name: string
  destination: string
  from: string
  to: string
  budget?: number
  plan: TripItem[]
  packing: { id: string; label: string; done: boolean }[]
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
