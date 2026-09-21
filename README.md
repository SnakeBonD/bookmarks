# Bookmarks v0.7

Gestionnaire personnel de favoris et pages de démarrage de SnakeBonD.

Production : https://bookmarks.snakebond.net

## Fonctions principales
- Plusieurs pages de démarrage
- Hiérarchie Page → Catégorie → Sous-catégorie → Groupe → Favori
- Gestion complète des pages et favoris
- Réorganisation des pages par glisser-déposer
- Recherche locale ou globale
- Import / export JSON
- Import / export des favoris navigateur HTML
- Détection des doublons
- Vérification sécurisée des liens
- Historique d’utilisation
- Suggestions locales de classement
- Synchronisation cloud Supabase facultative
- PWA installable et interface disponible hors ligne
- Widgets configurables par page

## Bibliothèque de widgets
Chaque page peut afficher indépendamment :
- horloge
- statistiques de la page
- favori le plus utilisé
- dernier favori utilisé
- note rapide propre à la page
- recherche web
- calendrier mensuel

Le moteur de recherche du widget peut être Google, DuckDuckGo ou Bing.

Configuration : **Outils → Widgets → Configurer**.

## Correctif v0.7
La v0.7 corrige aussi une régression de sélecteurs DOM introduite précédemment dans la gestion du menu des pages et le suivi des clics. Un test statique de non-régression a été ajouté.

## Synchronisation Supabase
Le cloud reste facultatif. Sans projet Supabase dédié, Bookmarks fonctionne intégralement en localStorage.

## Développement
```bash
npm run check
npm test
```

## Sécurité
- RLS stricte pour le cloud
- aucune clé service role dans le navigateur
- vérificateur de liens protégé contre SSRF
- aucune route API mise en cache par le service worker

## Prochaines pistes
- widgets RSS
- sauvegardes versionnées
- personnalisation des colonnes et tableaux
- activation Supabase en production
