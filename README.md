# Bookmarks v0.2

Gestionnaire personnel de favoris et pages de démarrage de SnakeBonD.

Production : https://bookmarks.snakebond.net

## Fonctions principales
- Plusieurs pages de démarrage
- Hiérarchie Page → Catégorie → Sous-catégorie → Groupe → Favori
- Ajout, modification et suppression des favoris
- Création, modification, duplication et suppression des pages
- Modèles de pages : vide, AI Tools Hub, développement, domotique
- Recherche sur la page courante ou sur toutes les pages
- Favoris épinglés
- Grille / liste
- Drag & drop simple
- Catégories repliables
- Détection des URLs en double
- Favicon automatique
- Widgets locaux : heure, statistiques de page, note rapide
- Raccourcis clavier
- Thème clair / sombre
- Sauvegarde locale
- Import / export JSON
- Responsive desktop / smartphone

## Raccourcis
- Ctrl/⌘ + K : recherche
- N : nouveau favori
- P : menu des pages
- T : changer de thème

## Développement
```bash
npm run check
npm test
```

Le site est statique et peut aussi être servi avec :

```bash
python -m http.server 8080
```

## Roadmap
### v0.3
- Synchronisation multi-appareils
- Authentification
- Supabase PostgreSQL + RLS

### v0.4
- Maintenance intelligente du catalogue
- Vérification avancée des liens
- Suggestions de classement et d’alternatives
