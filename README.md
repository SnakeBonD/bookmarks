# Bookmarks v1.0

Gestionnaire personnel de favoris et pages de démarrage de SnakeBonD.

Production : https://bookmarks.snakebond.net

## Fonctionnalités
- pages de démarrage multiples
- hiérarchie Page → Catégorie → Sous-catégorie → Groupe → Favori
- gestion complète des pages et favoris
- recherche globale ou par page
- drag & drop, favoris épinglés et sections repliables
- import/export JSON
- import/export des favoris Chrome / Edge / Firefox
- détection des doublons
- vérification sécurisée des liens
- historique d’utilisation
- suggestions locales de classement
- widgets configurables : horloge, statistiques, note, recherche web, calendrier, RSS
- PWA installable et interface disponible hors ligne
- sauvegardes locales versionnées
- synchronisation Supabase facultative

## Production v1.0
La v1.0 ajoute la couche de stabilisation production :

- domaine canonique `bookmarks.snakebond.net`
- métadonnées et Open Graph
- politique d’indexation privée : `noindex` + `robots.txt`
- `sitemap.xml`
- page 404 personnalisée
- Content Security Policy
- protections anti-framing et MIME sniffing
- Referrer Policy
- Permissions Policy
- cache explicite pour l’application et les API
- contrôles d’accessibilité de base
- tests de certification production dans la CI

Le site est volontairement personnel : les moteurs de recherche sont donc bloqués.

## Sécurité
- aucune clé service role dans le navigateur
- RLS obligatoire pour la synchronisation Supabase
- API de vérification de liens et RSS protégées contre SSRF
- blocage localhost et réseaux privés
- revalidation DNS et des redirections
- CSP stricte
- HTTPS via Vercel
- API exclues du cache PWA

## Synchronisation cloud
La synchronisation Supabase est déjà prévue mais reste facultative. Sans configuration cloud, Bookmarks fonctionne intégralement avec le stockage local du navigateur.

Pour l’activer :
1. créer un projet Supabase dédié à Bookmarks ;
2. appliquer `supabase/migrations/001_bookmark_states.sql` ;
3. ajouter dans Vercel :
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
4. autoriser `https://bookmarks.snakebond.net` dans Supabase Auth.

## Validation
```bash
npm run check
npm test
```

La CI vérifie la syntaxe JavaScript, les smoke tests, la cohérence de version, les fichiers de production et les principaux en-têtes de sécurité.
