# Bookmarks v0.5

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
- Drag & drop simple
- Catégories repliables
- Détection des doublons
- Favicon automatique
- Widgets locaux
- Raccourcis clavier
- Thème clair / sombre
- Import / export JSON
- Import des favoris Chrome / Edge / Firefox depuis le format HTML Netscape
- Export de l’ensemble des pages en HTML de favoris compatible navigateur
- Déduplication automatique pendant l’import navigateur
- Responsive desktop / smartphone
- Synchronisation cloud Supabase facultative
- Historique d’utilisation
- Suggestions locales de classement
- Vérification sécurisée des liens

## Import depuis un navigateur
Exportez d’abord vos favoris depuis Chrome, Edge ou Firefox au format HTML, puis ouvrez :

**Outils → Favoris navigateur → Importer**

Les dossiers du navigateur sont convertis selon la structure :
- premier niveau → catégorie
- deuxième niveau → sous-catégorie
- niveaux suivants → groupe

Les URLs déjà présentes sont ignorées automatiquement.

## Synchronisation Supabase
La synchronisation cloud reste facultative. Sans configuration Supabase, l’application continue à fonctionner intégralement en localStorage.

Pour activer le cloud :
1. créer un projet Supabase dédié à Bookmarks ;
2. appliquer `supabase/migrations/001_bookmark_states.sql` ;
3. configurer `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY` dans Vercel ;
4. autoriser `https://bookmarks.snakebond.net` dans Supabase Auth.

## Développement
```bash
npm run check
npm test
```

## Sécurité
Le vérificateur de liens bloque les protocoles non HTTP(S), localhost, les plages privées, les redirections vers des réseaux privés et les URLs contenant des identifiants.

## Prochaines pistes
- PWA / fonctionnement hors ligne
- widgets RSS et calendrier
- personnalisation avancée des tableaux
- synchronisation cloud activée en production
- enrichissement automatique des métadonnées
