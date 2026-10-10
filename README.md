# Homey 🏡

Le hub de votre foyer : un dashboard (semaine, météo) et des mini-applis (courses, poubelles, travail, tâches ménagères, cartes de fidélité…).

```bash
npm install
npm run dev
```

## Synchronisation du foyer (optionnel)

Sans configuration, les données restent sur l'appareil. Pour partager un foyer via un code :

1. Créer un projet [Supabase](https://supabase.com), puis exécuter `supabase/schema.sql` dans le SQL Editor.
2. Copier `.env.example` en `.env` et renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
3. Dans l'app : pastille du foyer → « Créer un foyer » → partager le code (8 caractères) ; les autres choisissent « Rejoindre un foyer ».

Conflits : le dernier qui écrit gagne, par liste (courses, poubelles…). Synchro toutes les ~6 s et au retour sur l'app.

## Photos

Les photos sont réduites sur l'appareil (aperçu 240 px, version 1280 px), gardées dans IndexedDB et envoyées au foyer
comme documents `photo-<id>` ; elles ne sont téléchargées par les autres membres que lorsqu'elles sont affichées.
Pour qu'elles se partagent, exécuter une fois la fonction `get_doc` à la fin de `supabase/schema.sql` dans le SQL Editor.

## Foyer obligatoire

Un compte est toujours rattaché à un foyer : au premier lancement (si Supabase est configuré), l'app n'affiche que
l'écran d'accueil « Créer mon foyer / Rejoindre avec un code ». Quitter un foyer retire la personne de la liste des membres
et efface de l'appareil les données partagées de ce foyer (le profil et le thème restent).

## Thèmes

Choix dans « Mon profil » (avatar en haut à droite) : Automatique, Clair, Sombre, Nuit, Noir pur, Océan, Forêt, Rose poudré,
Sépia, Monochrome, Noir & blanc. Chaque thème est un jeu de variables CSS (`:root[data-theme='…']` dans `src/styles.css`,
liste dans `src/lib/theme.ts`). Le choix est propre à chaque appareil.
