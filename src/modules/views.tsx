import type { ComponentType } from 'react'
import Tracker from '../components/Tracker'
import type { Household } from '../lib/household'
import Anniversaires from './Anniversaires'
import Budget from './Budget'
import Cadeaux from './Cadeaux'
import Courses from './Courses'
import Fidelite from './Fidelite'
import Poubelles from './Poubelles'
import Repas from './Repas'
import Taches from './Taches'
import Travail from './Travail'
import Abonnements from './Abonnements'
import Animaux from './Animaux'
import Bebe from './Bebe'
import Energie from './Energie'
import Envies from './Envies'
import { DOCUMENTS, HEALTH, HOME, KIDS, PLANTS } from './trackers'
import Vehicules from './Vehicules'
import Voyages from './Voyages'

type View = ComponentType<{ household: Household }>

/** Écran de chaque mini-appli, par id (voir registry.ts). */
export const VIEWS: Record<string, View> = {
  courses: Courses,
  poubelles: () => <Poubelles />,
  travail: Travail,
  taches: Taches,
  fidelite: Fidelite,
  anniversaires: () => <Anniversaires />,
  cadeaux: Cadeaux,
  repas: Repas,
  voyages: Voyages,
  animaux: Animaux,
  vehicules: Vehicules,
  budget: Budget,
  sante: ({ household }) => <Tracker config={HEALTH} household={household} />,
  maison: ({ household }) => <Tracker config={HOME} household={household} />,
  jardin: ({ household }) => <Tracker config={PLANTS} household={household} />,
  abonnements: Abonnements,
  bebe: Bebe,
  energie: Energie,
  envies: Envies,
  documents: ({ household }) => <Tracker config={DOCUMENTS} household={household} />,
  enfants: ({ household }) => <Tracker config={KIDS} household={household} />,
}
