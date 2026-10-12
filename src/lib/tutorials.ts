export interface Slide { icon: string; title: string; text: string }

/** Visite guidée de l'application (première ouverture, puis depuis « Mon profil »). */
export const APP_TOUR: Slide[] = [
  { icon: 'logo', title: 'Bienvenue sur Homey', text: 'Le hub de votre foyer : courses, poubelles, rendez-vous, budget, animaux, voyages… tout au même endroit, partagé avec les personnes de votre foyer.' },
  { icon: '📅', title: 'Votre accueil', text: 'La semaine en un coup d’œil : touchez un jour pour voir son détail. Le ⚙ du calendrier choisit ce qu’il affiche. La météo se règle avec le 📍.' },
  { icon: '🧩', title: 'Vos applications', text: 'Chaque tuile est une mini-appli. La pastille indique ce qui demande votre attention. « Personnaliser » masque celles dont vous n’avez pas besoin et change leur ordre.' },
  { icon: '👥', title: 'Votre foyer', text: 'Tout est synchronisé entre les membres. Le nom en haut ouvre « Mon foyer » : vous y trouvez le code à partager pour inviter quelqu’un.' },
  { icon: '🙂', title: 'Votre profil', text: 'Touchez votre avatar : photo, couleur, thème de l’application (Coloré, sombre, Liquid Glass…) et possibilité de revoir ce tutoriel.' },
  { icon: '✨', title: 'C’est parti !', text: 'Chaque application a un petit guide la première fois que vous l’ouvrez. Le bouton « ? » en haut le rouvre à tout moment.' },
]

export interface ModuleTour { intro: string; slides: Slide[] }

/** Guide individuel de chaque application, affiché à la première ouverture. */
export const MODULE_TOURS: Record<string, ModuleTour> = {
  courses: { intro: 'La liste de courses partagée.', slides: [
    { icon: '🛒', title: 'Une liste pour tout le foyer', text: 'Ajoutez un article et son rayon : tout le monde le voit tout de suite. Votre pastille indique qui l’a ajouté.' },
    { icon: '✅', title: 'Cochez en magasin', text: 'Un article coché passe dans « Dans le panier ». « Vider » retire tout ce qui est déjà pris.' },
    { icon: '🍽️', title: 'Depuis Repas', text: 'Les ingrédients d’un repas planifié peuvent être envoyés ici d’un seul geste.' },
  ] },
  poubelles: { intro: 'Les jours de ramassage, avec leur récurrence.', slides: [
    { icon: '🗑️', title: 'Une poubelle, un rythme', text: 'Créez chaque poubelle (ordures, tri, verre…) avec ses jours et sa fréquence : chaque semaine, une semaine sur deux, etc.' },
    { icon: '📅', title: 'Dans le calendrier', text: 'Le prochain ramassage s’affiche avec « demain » ou « dans 3 j », et apparaît dans la semaine de l’accueil.' },
  ] },
  travail: { intro: 'Congés, RTT, télétravail et déplacements.', slides: [
    { icon: '💼', title: 'Posez vos jours', text: 'Choisissez le type (CP, RTT, télétravail, déplacement…), les dates, et une demi-journée si besoin.' },
    { icon: '🎌', title: 'Fériés et week-ends', text: 'Ajoutez les jours fériés de l’année : ils ne sont jamais décomptés de vos congés, pas plus que les week-ends.' },
    { icon: '🧮', title: 'Vos soldes', text: 'Renseignez vos droits annuels (CP/an, RTT/an) pour voir ce qu’il vous reste.' },
  ] },
  taches: { intro: 'Les tâches ménagères, adaptées à votre maison.', slides: [
    { icon: '🏠', title: 'Un questionnaire pour commencer', text: 'Logement, enfants, animaux, jardin… Vos réponses servent à proposer des tâches et des fréquences adaptées.' },
    { icon: '👆', title: 'Attribuez au clic', text: 'Touchez l’avatar d’un membre sous une tâche pour la lui attribuer (ou ↻ pour un tour de rôle).' },
    { icon: '✓', title: 'Fait !', text: 'Le bouton « Fait ✓ » relance le compte à rebours. Le retard s’affiche en rouge.' },
  ] },
  fidelite: { intro: 'Toutes vos cartes de fidélité.', slides: [
    { icon: '💳', title: 'Numéro ou photo', text: 'Saisissez le numéro (chiffres et lettres) pour générer le code-barres, ou prenez la carte en photo si le code ne peut pas être recréé.' },
    { icon: '📱', title: 'En caisse', text: 'Touchez la carte : le code s’affiche en grand. Montez la luminosité de l’écran pour qu’il soit bien lu.' },
  ] },
  anniversaires: { intro: 'Les anniversaires à ne pas oublier.', slides: [
    { icon: '🎂', title: 'Dates et âges', text: 'Ajoutez le jour, le mois et, si vous voulez, l’année : l’âge à venir et le compte à rebours s’affichent.' },
    { icon: '🎁', title: 'Lien avec Cadeaux', text: 'Une idée cadeau associée à la personne apparaît ici sous la date.' },
  ] },
  cadeaux: { intro: 'Idées de cadeaux par personne.', slides: [
    { icon: '💡', title: 'Idée, acheté, offert', text: 'Touchez la pastille d’un cadeau pour changer son statut. Le total dépensé s’affiche par personne.' },
    { icon: '🤫', title: 'Surprise préservée', text: 'Les cadeaux qui vous sont destinés restent cachés de votre écran.' },
  ] },
  repas: { intro: 'Le menu de la semaine.', slides: [
    { icon: '🍽️', title: 'Midi et soir', text: 'Planifiez chaque repas avec ses ingrédients. Gardez vos plats préférés dans « Mes recettes ».' },
    { icon: '🛒', title: 'Vers les courses', text: 'Le bouton 🛒 envoie les ingrédients dans la liste de courses, sans doublon.' },
  ] },
  voyages: { intro: 'Préparer un voyage de A à Z.', slides: [
    { icon: '🧭', title: 'Une fiche par voyage', text: 'Étapes, programme, réservations (avec n° de dossier), budget partagé, valise sur mesure, tâches avant le départ, idées et photos.' },
    { icon: '👥', title: 'Voyageurs', text: 'Indiquez qui part et leurs pièces d’identité : l’app prévient si un passeport expire avant le retour.' },
    { icon: '🌤️', title: 'Météo', text: 'Les prévisions de la destination apparaissent dans les 15 jours avant le départ.' },
  ] },
  animaux: { intro: 'La fiche santé de vos animaux.', slides: [
    { icon: '🐾', title: 'Fiche détaillée', text: 'Espèce, race, sexe, stérilisation, puce, vétérinaire, photos : tout est dans l’onglet Fiche.' },
    { icon: '💉', title: 'Vaccins et soins à cocher', text: 'Cochez un vaccin ou un soin pour noter sa date et son rappel. « Fait ✓ » programme le prochain tout seul.' },
    { icon: '💶', title: 'Frais et assurance', text: 'Suivez les dépenses, l’assurance et sa date d’échéance.' },
  ] },
  vehicules: { intro: 'Entretien et frais de vos véhicules.', slides: [
    { icon: '🚗', title: 'Fiche et énergie', text: 'Renseignez le véhicule et son énergie (essence, diesel, électrique…) : la liste d’entretien s’adapte.' },
    { icon: '🔧', title: 'Entretien à cocher', text: 'Notez la date et le kilométrage ; le prochain passage se calcule en jours et en kilomètres. Pneus : suivez la date de montage et l’usure.' },
    { icon: '⛽', title: 'Frais et consommation', text: 'Notez vos pleins ou recharges avec le kilométrage : consommation et coût aux 100 km se calculent seuls.' },
  ] },
  budget: { intro: 'Dépenses du mois et équilibre du foyer.', slides: [
    { icon: '💶', title: 'Notez vos dépenses', text: 'Montant, catégorie, qui a payé, dépense commune ou personnelle. Fixez un budget mensuel pour suivre la jauge.' },
    { icon: '⚖️', title: 'Qui doit quoi ?', text: 'Les dépenses communes sont réparties à parts égales : l’écran indique qui doit combien à qui.' },
  ] },
  sante: { intro: 'Suivi de santé de chaque membre.', slides: [
    { icon: '🩺', title: 'Une fiche par personne', text: 'Médecin, dentiste, ophtalmo, vaccins, ordonnances, analyses : notez la date et laissez l’app proposer le rappel.' },
    { icon: '⏰', title: 'Rappels', text: 'Les échéances proches apparaissent sur la tuile et peuvent être affichées dans le calendrier.' },
  ] },
  maison: { intro: 'Entretien, garanties et travaux.', slides: [
    { icon: '🔧', title: 'Vos équipements', text: 'Chaudière, lave-linge, toiture… Notez entretiens, réparations et travaux.' },
    { icon: '🛡️', title: 'Fin de garantie', text: 'Saisissez la date de fin de garantie comme échéance pour ne pas la manquer.' },
  ] },
  jardin: { intro: 'Plantes et jardin.', slides: [
    { icon: '🪴', title: 'Une fiche par plante', text: 'Notez son emplacement, puis ses arrosages, engrais, rempotages et tailles.' },
    { icon: '💧', title: 'Arrosage régulier', text: 'Le bouton « Fait ✓ » enregistre aujourd’hui et programme le prochain arrosage.' },
  ] },
  abonnements: { intro: 'Vos abonnements et leur coût.', slides: [
    { icon: '🔁', title: 'Tout au même endroit', text: 'Montant, fréquence et date de prélèvement : le total par mois et par an se calcule seul.' },
    { icon: '⚠️', title: 'Préavis de résiliation', text: 'Indiquez le préavis : l’app affiche la date limite pour résilier à temps.' },
  ] },
  bebe: { intro: 'Le quotidien de bébé.', slides: [
    { icon: '🍼', title: 'En un geste', text: 'Biberon, tétée, couche, dodo : un appui suffit. Le dernier repas s’affiche sur la tuile.' },
    { icon: '📏', title: 'Croissance et premières fois', text: 'Notez poids et taille, et gardez les premières fois (avec une photo) dans l’onglet dédié.' },
  ] },
  rdv: { intro: 'Coiffeur, beauté, bien-être : quand reprendre rendez-vous.', slides: [
    { icon: '💇', title: 'Un rythme par soin', text: 'Couleur, racines, pointes, coupe, manucure… chaque soin a un intervalle conseillé que vous pouvez modifier.' },
    { icon: '⏳', title: 'Quand reprendre rendez-vous', text: '« Fait » relance le compte à rebours ; « RDV pris » enregistre la date, qui apparaît dans votre calendrier.' },
  ] },
  enfants: { intro: 'École, activités et vacances.', slides: [
    { icon: '🎒', title: 'Une fiche par enfant', text: 'Notez réunions, inscriptions, cantine, rendez-vous, reprises de vacances, avec des rappels.' },
  ] },
  documents: { intro: 'Papiers importants et échéances.', slides: [
    { icon: '📁', title: 'Ne manquez plus une date', text: 'Passeport, carte d’identité, contrats… Saisissez la date d’expiration ou d’échéance pour recevoir un rappel dans l’app.' },
  ] },
  energie: { intro: 'Compteurs et factures.', slides: [
    { icon: '⚡', title: 'Relevés', text: 'Notez l’index de vos compteurs : la consommation depuis le relevé précédent et l’estimation mensuelle se calculent seules.' },
    { icon: '🧾', title: 'Factures', text: 'Ajoutez le montant au relevé pour suivre le coût sur l’année.' },
  ] },
  envies: { intro: 'Sorties, restos et films à voir.', slides: [
    { icon: '✨', title: 'La liste des envies', text: 'Ajoutez une envie avec sa catégorie. Touchez le ❤️ pour dire « moi aussi » : les plus partagées montent en haut.' },
  ] },
}
