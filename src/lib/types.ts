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
