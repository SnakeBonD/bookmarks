# Bookmarks v0.1

Prototype fonctionnel du gestionnaire personnel de favoris de SnakeBonD.

## Fonctions incluses
- Plusieurs pages de démarrage
- Structure Page → Catégorie → Sous-catégorie → Groupe → Favori
- Ajout / modification des favoris
- Recherche page courante ou globale
- Favoris épinglés
- Grille / liste
- Drag & drop simple entre favoris
- Thème clair / sombre
- Sauvegarde locale via localStorage
- Import / export JSON
- Responsive desktop / smartphone
- Pages exemples inspirées de l'organisation Notion de SnakeBonD

## Lancer
Ouvrir `index.html` dans un navigateur moderne ou servir le dossier avec un serveur HTTP statique.

Exemple :

```bash
python -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Limites v0.1
- Création/édition/suppression avancée de catégories et groupes encore indirecte via les favoris
- Pas encore de Supabase / synchronisation cloud
- Pas encore de widgets
- Pas encore de vérificateur automatique des liens cassés
- Pas encore de suppression de pages dans l'interface
