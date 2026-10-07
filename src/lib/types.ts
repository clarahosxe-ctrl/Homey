export interface Member {
  id: string
  name: string
  color: string
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
