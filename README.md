# Bookmarks v0.9

Gestionnaire personnel de favoris et pages de démarrage de SnakeBonD.

Production : https://bookmarks.snakebond.net

## Points forts
- Pages, catégories, sous-catégories, groupes et favoris
- Recherche, drag & drop et favoris épinglés
- Import/export JSON et favoris navigateur
- Détection des doublons et vérification sécurisée des liens
- Historique d’utilisation et suggestions de classement
- PWA installable et fonctionnement hors ligne
- Widgets configurables, calendrier, recherche web et RSS
- Synchronisation Supabase facultative
- Sauvegardes locales versionnées

## Sauvegardes v0.9
Bookmarks conserve jusqu’à 10 snapshots locaux.

Des snapshots automatiques sont créés avant :
- suppression d’une page ;
- import JSON remplaçant les données ;
- restauration depuis le cloud ;
- restauration d’un ancien snapshot.

Accès : **Outils → Sauvegardes → Gérer**.

Les snapshots restent sur l’appareil tant que la synchronisation cloud n’est pas activée.

## Développement
```bash
npm run check
npm test
```

## Sécurité
- RLS stricte pour la synchronisation facultative
- aucun secret serveur exposé
- vérificateurs d’URL protégés contre SSRF
- cache PWA limité aux ressources de l’application
- snapshots stockés localement

## Prochaine étape
v1.0 : stabilisation, métadonnées de production, sitemap/robots, page 404, en-têtes de sécurité et validation finale.
