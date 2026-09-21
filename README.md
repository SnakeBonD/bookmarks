# Bookmarks v0.8

Gestionnaire personnel de favoris et pages de démarrage de SnakeBonD.

Production : https://bookmarks.snakebond.net

## Fonctions principales
- Pages de démarrage multiples
- Hiérarchie Page → Catégorie → Sous-catégorie → Groupe → Favori
- Gestion complète des pages et favoris
- Import/export JSON et favoris navigateur HTML
- Détection des doublons et liens cassés
- Historique d’utilisation
- Suggestions locales de classement
- Synchronisation Supabase facultative
- PWA installable et mode hors ligne
- Widgets configurables par page
- Widget RSS sécurisé

## Widgets disponibles
- Horloge
- Statistiques
- Plus utilisé
- Dernier utilisé
- Note rapide
- Recherche web
- Calendrier
- Flux RSS

Le widget RSS utilise `/api/fetch-rss`, une fonction Vercel qui revalide le DNS et les redirections avant chaque accès.

## Sécurité RSS
- HTTP/HTTPS uniquement
- blocage des identifiants dans l’URL
- blocage localhost et réseaux privés
- validation DNS
- validation de chaque redirection
- timeout
- taille maximale du flux : 1 MiB

## Développement
```bash
npm run check
npm test
```

## Cloud
La synchronisation Supabase reste facultative. Bookmarks continue à fonctionner en localStorage si elle n’est pas configurée.

## Prochaines pistes
- sauvegardes versionnées
- restauration de snapshots
- personnalisation avancée de l’apparence des pages
- finalisation v1.0
