# Bookmarks v0.3

Gestionnaire personnel de favoris et pages de démarrage de SnakeBonD.

Production : https://bookmarks.snakebond.net

## Fonctions principales
- Plusieurs pages de démarrage
- Hiérarchie Page → Catégorie → Sous-catégorie → Groupe → Favori
- Gestion complète des pages et favoris
- Modèles de pages
- Recherche locale ou globale
- Favoris épinglés
- Grille / liste
- Drag & drop simple
- Catégories repliables
- Détection des doublons
- Favicon automatique
- Widgets locaux
- Raccourcis clavier
- Thème clair / sombre
- Import / export JSON
- Responsive desktop / smartphone
- Synchronisation cloud facultative avec Supabase
- Connexion par lien e-mail
- Sauvegarde cloud manuelle ou automatique
- Mode local conservé si Supabase n’est pas configuré

## Synchronisation Supabase
La v0.3 fonctionne sans Supabase. Pour activer le cloud :

1. Créer un projet Supabase dédié à Bookmarks.
2. Appliquer `supabase/migrations/001_bookmark_states.sql`.
3. Configurer dans Vercel :
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
4. Ajouter `https://bookmarks.snakebond.net` aux URLs autorisées dans Supabase Auth.

La clé utilisée côté navigateur doit être une clé **publishable**. Aucune clé service role ne doit être exposée.

La table `bookmark_states` utilise RLS et limite chaque utilisateur à sa propre ligne.

## Développement
```bash
npm run check
npm test
```

## Raccourcis
- Ctrl/⌘ + K : recherche
- N : nouveau favori
- P : menu des pages
- T : changer de thème

## Roadmap
### v0.4
- maintenance intelligente du catalogue
- vérification avancée des liens
- historique d’utilisation
- suggestions de classement
