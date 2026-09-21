# Bookmarks v0.6

Gestionnaire personnel de favoris et pages de démarrage de SnakeBonD.

Production : https://bookmarks.snakebond.net

## Fonctions principales
- Plusieurs pages de démarrage
- Hiérarchie Page → Catégorie → Sous-catégorie → Groupe → Favori
- Gestion complète des pages et favoris
- Modèles de pages
- Réorganisation des pages par glisser-déposer
- Recherche locale ou globale
- Favoris épinglés
- Grille / liste
- Catégories repliables
- Détection des doublons
- Favicon automatique
- Widgets locaux
- Raccourcis clavier
- Thème clair / sombre
- Import / export JSON
- Import / export des favoris navigateur au format HTML
- Synchronisation cloud Supabase facultative
- Historique d’utilisation
- Suggestions locales de classement
- Vérification sécurisée des liens
- PWA installable
- Cache hors ligne de l’interface
- Indicateur en ligne / hors ligne

## PWA et mode hors ligne
Le service worker met en cache l’interface de Bookmarks. Les favoris et préférences sont déjà stockés localement dans le navigateur, ce qui permet de continuer à consulter et organiser les données même sans connexion.

Les routes `/api/*` et les ressources externes ne sont jamais mises en cache par le service worker.

Le bouton **Installer** apparaît lorsque le navigateur autorise l’installation de la PWA.

## Import depuis un navigateur
Ouvrir **Outils → Favoris navigateur → Importer** puis sélectionner le fichier HTML exporté depuis Chrome, Edge ou Firefox.

## Synchronisation Supabase
La synchronisation cloud reste facultative. Sans configuration Supabase, Bookmarks fonctionne intégralement en localStorage.

Pour l’activer :
1. créer un projet Supabase dédié ;
2. appliquer `supabase/migrations/001_bookmark_states.sql` ;
3. configurer `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY` dans Vercel ;
4. autoriser `https://bookmarks.snakebond.net` dans Supabase Auth.

## Développement
```bash
npm run check
npm test
```

## Sécurité
- RLS stricte pour la synchronisation cloud
- aucune clé service role dans le navigateur
- vérificateur de liens protégé contre SSRF
- cache PWA limité à l’application statique
- aucune route API sensible mise en cache

## Prochaines pistes
- widgets RSS et calendrier
- personnalisation avancée des tableaux
- sauvegardes versionnées
- activation Supabase en production
