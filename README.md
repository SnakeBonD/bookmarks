# Bookmarks v0.4

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
- Synchronisation cloud Supabase facultative
- Historique d’utilisation des favoris
- Widgets « Plus utilisé » et « Dernier utilisé »
- Suggestion locale de catégorie / sous-catégorie / tags
- Vérification réelle des liens via une fonction Vercel
- Protection SSRF du vérificateur : blocage localhost, réseaux privés et redirections vers IP privées

## Vérification des liens
La fonction `/api/check-link` :
- accepte uniquement HTTP/HTTPS
- bloque les URLs avec identifiants intégrés
- résout le DNS avant chaque requête
- bloque les plages locales et privées
- revalide chaque redirection
- impose un délai d’expiration
- ne transmet pas d’en-têtes utilisateur arbitraires

Les codes 401, 403, 405 et 429 sont considérés comme « service joignable », pas comme lien cassé.

## Synchronisation Supabase
La v0.4 fonctionne aussi sans Supabase. Pour activer le cloud :

1. Créer un projet Supabase dédié à Bookmarks.
2. Appliquer `supabase/migrations/001_bookmark_states.sql`.
3. Configurer dans Vercel :
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
4. Ajouter `https://bookmarks.snakebond.net` aux URLs autorisées dans Supabase Auth.

La clé navigateur doit être une clé publishable. Aucune clé service role ne doit être exposée.

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

## Prochaines pistes
- import de favoris navigateur
- widgets RSS / calendrier
- tableaux personnalisés
- synchronisation Supabase activée en production
- enrichissement automatique des métadonnées
