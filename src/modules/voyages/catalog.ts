import { daysBetween, parse } from '../../lib/dates'
import { uid } from '../../lib/storage'
import type { PackItem, Trip, Traveler } from '../../lib/types'

export type Climate = 'chaud' | 'doux' | 'froid'
export type Dest = 'france' | 'europe' | 'monde'

export const ACTIVITIES = [
  { id: 'plage', label: '🏖️ Plage' },
  { id: 'rando', label: '🥾 Randonnée' },
  { id: 'ville', label: '🏙️ Visites en ville' },
  { id: 'ski', label: '⛷️ Ski' },
  { id: 'soiree', label: '🍷 Soirées' },
  { id: 'business', label: '💼 Travail' },
]

export const TODO_PRESETS: { label: string; before: number }[] = [
  { label: 'Vérifier passeports / cartes d’identité', before: 60 },
  { label: 'Souscrire une assurance voyage', before: 30 },
  { label: 'Demander la CEAM / un visa / une autorisation', before: 45 },
  { label: 'Prévenir la banque', before: 14 },
  { label: 'Changer des devises', before: 14 },
  { label: 'Réserver parking ou navette', before: 14 },
  { label: 'Faire suivre le courrier / prévenir un voisin', before: 7 },
  { label: 'Confier les plantes et les animaux', before: 3 },
  { label: 'Check-in en ligne', before: 2 },
  { label: 'Télécharger billets et cartes hors ligne', before: 2 },
  { label: 'Sortir les poubelles, vider le frigo', before: 1 },
  { label: 'Charger tous les appareils', before: 1 },
]

/**
 * Valise sur mesure : une liste par voyageur (adulte, enfant, bébé) selon la durée, le climat,
 * les activités et la destination, plus les affaires communes. Les quantités suivent la durée.
 */
export function generatePacking(trip: Trip, travelers: Traveler[], o: { climate: Climate; activities: string[]; dest: Dest }): PackItem[] {
  const nights = Math.max(1, daysBetween(parse(trip.from), parse(trip.to)))
  const n = Math.min(nights + 1, 8) // on lave au-delà d'une semaine
  const out: PackItem[] = []
  const add = (label: string, who?: string) => out.push({ id: uid(), label, done: false, who })
  const act = (a: string) => o.activities.includes(a)
  const sunny = o.climate === 'chaud' || act('plage') || act('ski')

  add('Billets et réservations')
  add('Carte bancaire / espèces')
  add('Chargeurs + batterie externe')
  add('Trousse de pharmacie')
  add('Pochette de documents')
  add('Sac pour le linge sale')
  if (sunny) add('Crème solaire')
  if (o.dest !== 'france') add('Contrat d’assurance voyage')
  if (o.dest === 'europe') add('CEAM (carte européenne d’assurance maladie)')
  if (o.dest === 'monde') { add('Adaptateur de prise'); add('Visa / autorisation de voyage'); add('Vaccins et ordonnances à jour') }

  for (const t of travelers) {
    const w = t.id
    add(t.doc === 'cni' ? 'Carte d’identité' : 'Passeport / pièce d’identité', w)
    if (t.kind === 'bebe') {
      add(`Couches ×${Math.min(nights * 6, 60)}`, w); add('Lingettes et crème', w); add('Biberons, lait, stérilisation', w)
      add(`Bodies ×${n + 2}`, w); add(`Pyjamas ×${Math.min(n, 4)}`, w); add('Doudou et tétines', w)
      add('Poussette / porte-bébé', w); add('Lit parapluie / siège auto', w); add('Thermomètre et médicaments bébé', w); add('Carnet de santé', w)
      if (sunny) add('Chapeau et lunettes bébé', w)
      if (o.climate === 'froid') add('Combinaison chaude, bonnet, chaussons', w)
      continue
    }
    const kid = t.kind === 'enfant'
    add(`Sous-vêtements ×${n + (kid ? 2 : 0)}`, w); add(`Chaussettes ×${n + (kid ? 2 : 0)}`, w)
    add(`T-shirts / hauts ×${n + (kid ? 2 : 0)}`, w); add(`Pantalons / shorts ×${Math.ceil(n / 2)}`, w)
    add(kid ? 'Pyjamas ×2' : 'Pyjama', w); add('Chaussures confortables', w); add('Trousse de toilette', w)
    if (kid) { add('Doudou', w); add('Jeux et livres pour le trajet', w) }
    if (o.climate === 'chaud') { add('Maillot de bain', w); add('Lunettes de soleil', w); add('Chapeau / casquette', w); add('Sandales', w) }
    if (o.climate === 'doux') { add('Veste ou pull léger', w); add('Parapluie / k-way', w) }
    if (o.climate === 'froid') { add('Manteau chaud', w); add('Bonnet, gants, écharpe', w); add('Pulls ×2', w); add('Sous-couche thermique', w) }
    if (act('plage')) { add('Serviette de plage', w); if (o.climate !== 'chaud') add('Maillot de bain', w) }
    if (act('rando')) { add('Chaussures de randonnée', w); add('Gourde', w); add('Sac à dos de jour', w) }
    if (act('ville')) add('Chaussures de marche', w)
    if (act('ski')) { add('Tenue de ski', w); add('Gants et masque de ski', w); if (!kid) add('Casque', w) }
    if (!kid && act('soiree')) add('Tenue de soirée', w)
    if (!kid && act('business')) { add('Tenue de travail', w); add('Ordinateur + chargeur', w) }
  }
  return out
}
