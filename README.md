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
