export const SPECIES = [
  { id: 'chien', icon: '🐶', label: 'Chien' },
  { id: 'chat', icon: '🐱', label: 'Chat' },
  { id: 'lapin', icon: '🐰', label: 'Lapin' },
  { id: 'rongeur', icon: '🐹', label: 'Rongeur' },
  { id: 'oiseau', icon: '🐦', label: 'Oiseau' },
  { id: 'poisson', icon: '🐠', label: 'Poisson' },
  { id: 'reptile', icon: '🦎', label: 'Reptile' },
  { id: 'cheval', icon: '🐴', label: 'Cheval' },
  { id: 'autre', icon: '🐾', label: 'Autre' },
]
export const speciesOf = (id?: string) => SPECIES.find((s) => s.id === id)

export const BREEDS: Record<string, string[]> = {
  chien: ['Labrador', 'Golden retriever', 'Berger allemand', 'Berger australien', 'Border collie', 'Bouledogue français', 'Chihuahua', 'Yorkshire', 'Cavalier King Charles', 'Beagle', 'Cocker', 'Jack Russell', 'Husky', 'Caniche', 'Carlin', 'Boxer', 'Teckel', 'Malinois', 'Staffie', 'Croisé'],
  chat: ['Européen', 'Maine coon', 'Persan', 'Siamois', 'British shorthair', 'Ragdoll', 'Bengal', 'Chartreux', 'Sacré de Birmanie', 'Norvégien', 'Sphynx', 'Abyssin', 'Croisé'],
  lapin: ['Nain', 'Bélier', 'Angora', 'Rex', 'Croisé'],
}

export interface Item { id: string; label: string; every: number; icon?: string; hint?: string }

/** Vaccins courants (à titre indicatif : votre vétérinaire reste la référence). */
export const VACCINES: Record<string, Item[]> = {
  chien: [
    { id: 'rage', label: 'Rage', every: 365 },
    { id: 'chppil', label: 'CHPPiL', every: 365, hint: 'Carré, hépatite, parvovirose, parainfluenza, leptospirose' },
    { id: 'toux', label: 'Toux de chenil (Bordetella)', every: 365 },
    { id: 'piro', label: 'Piroplasmose', every: 365 },
    { id: 'leish', label: 'Leishmaniose', every: 365 },
    { id: 'lyme', label: 'Maladie de Lyme', every: 365 },
  ],
  chat: [
    { id: 'typhus', label: 'Typhus + coryza (TC)', every: 365, hint: 'Panleucopénie, rhinotrachéite, calicivirose' },
    { id: 'leucose', label: 'Leucose (FeLV)', every: 365 },
    { id: 'rage', label: 'Rage', every: 365 },
    { id: 'chlamydiose', label: 'Chlamydiose', every: 365 },
  ],
  lapin: [
    { id: 'myxo', label: 'Myxomatose', every: 180 },
    { id: 'vhd', label: 'VHD (maladie hémorragique)', every: 365 },
  ],
}

export const SOINS: Record<string, Item[]> = {
  chien: [
    { id: 'vermifuge', label: 'Vermifuge', every: 90, icon: '💊' },
    { id: 'antipuces', label: 'Anti-puces / tiques', every: 30, icon: '🪲' },
    { id: 'dents', label: 'Dents / détartrage', every: 365, icon: '🦷' },
    { id: 'toilettage', label: 'Toilettage / bain', every: 60, icon: '🛁' },
    { id: 'griffes', label: 'Coupe des griffes', every: 45, icon: '✂️' },
    { id: 'oreilles', label: 'Nettoyage des oreilles', every: 30, icon: '👂' },
    { id: 'bilan', label: 'Bilan annuel chez le véto', every: 365, icon: '🩺' },
  ],
  chat: [
    { id: 'vermifuge', label: 'Vermifuge', every: 90, icon: '💊' },
    { id: 'antipuces', label: 'Anti-puces / tiques', every: 30, icon: '🪲' },
    { id: 'dents', label: 'Dents / détartrage', every: 365, icon: '🦷' },
    { id: 'griffes', label: 'Coupe des griffes', every: 45, icon: '✂️' },
    { id: 'brossage', label: 'Brossage (poils longs)', every: 14, icon: '🪮' },
    { id: 'bilan', label: 'Bilan annuel chez le véto', every: 365, icon: '🩺' },
  ],
  lapin: [
    { id: 'antiparasitaire', label: 'Antiparasitaire', every: 90, icon: '💊' },
    { id: 'griffes', label: 'Coupe des griffes', every: 45, icon: '✂️' },
    { id: 'bilan', label: 'Bilan annuel chez le véto', every: 365, icon: '🩺' },
  ],
}
export const SOINS_DEFAULT: Item[] = [{ id: 'bilan', label: 'Bilan annuel chez le véto', every: 365, icon: '🩺' }]

export const EXPENSES = [
  { id: 'vet', label: 'Vétérinaire', icon: '🩺' },
  { id: 'food', label: 'Alimentation', icon: '🥣' },
  { id: 'meds', label: 'Médicaments', icon: '💊' },
  { id: 'groom', label: 'Toilettage', icon: '🛁' },
  { id: 'gear', label: 'Accessoires', icon: '🦴' },
  { id: 'care', label: 'Garde / pension', icon: '🏨' },
  { id: 'other', label: 'Autre', icon: '📌' },
]

export const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'x'
