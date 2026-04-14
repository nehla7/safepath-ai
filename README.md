
# SafePath AI Dashboard

Site statique en arabe (RTL) pour une démonstration de compétition.

## Structure du projet

```txt
safepath-ai-dashboard/
  index.html
  dashboard.html
  analysis.html
  safe-path.html
  alerts.html
  assets/
    css/
      style.css
    js/
      app.js
    images/
      logo-univ.png
      campus-map.png
```

## Comment remplacer le logo et la carte

Le code utilise **exactement** ces deux chemins :

- `assets/images/logo-univ.png`
- `assets/images/campus-map.png`

### Pour remplacer le logo
1. Prends le logo de l'université.
2. Renomme-le en **`logo-univ.png`**.
3. Mets ce fichier dans : `assets/images/`
4. Si on te demande de remplacer le fichier existant, accepte.

### Pour remplacer la carte
1. Prends l'image de la carte du campus.
2. Renomme-la en **`campus-map.png`**.
3. Mets ce fichier dans : `assets/images/`
4. Remplace le fichier existant si nécessaire.

## Très important
Ne change pas les noms de fichiers si tu ne veux pas modifier le code.
Le plus simple est juste de **remplacer les deux images existantes avec le même nom**.

## Comment ouvrir le site

### Méthode 1 - La plus simple
- Ouvre le dossier `safepath-ai-dashboard`
- Double-clique sur `index.html`

### Méthode 2 - Recommandée avec VS Code
1. Installe **Visual Studio Code**.
2. Installe l'extension **Live Server**.
3. Ouvre le dossier du projet dans VS Code.
4. Clique droit sur `index.html`.
5. Choisis **Open with Live Server**.

## Aucune installation compliquée
- Pas besoin de XAMPP
- Pas besoin de Node.js
- Pas besoin de base de données
- Pas besoin de backend

## Astuce pour le jury
Pendant la démo :
1. Ouvre `dashboard.html`
2. Clique sur **محاكاة خطر**
3. Puis va vers `safe-path.html`
4. Explique que la plateforme détecte le danger et propose un chemin plus sûr.
