# Cinezone 🎬

Cinezone est une plateforme moderne de films. Elle permet aux utilisateurs de parcourir une vaste bibliothèque de films, de les filtrer via différents critères, et de gérer leurs favoris. Un espace administrateur permet également la gestion complète du catalogue.

## 1 Fonctionnalités
- **Parcours public** : liste et détail des films, filtre multi-critères, recherche, infinite scroll.
- **Comptes et authentification** : inscription, login, persistance JWT, hachage des mots de passe, photo de profil et rafraîchissement, déconnexion.
- **Espace membre** : Favoris, commentaires et notes.
- **Admin** : CRUD films, catégories, dashboard, gestion des utilisateurs.
- **Qualité** : tests unitaires, tests E2E, CI/CD.
- **DevOps** : Dockerisation, CI/CD.
- **Mode Sombre** : Interface élégante et moderne avec des micro-animations.

## 1.1 Feature avancée
- **Intégration TMDB** : Recherche et préremplissage automatique des films depuis The Movie Database lors de la création.
- **Système de commentaire** : Pour les utilisateurs connectes avec un commentaire unique par film permettant de le noter.
- **Système de notes** : Une note initial est mis en place a la création du film qui est ensuite modifier en calculant la moyenne avec les commentaires.

## 2 Technologies Utilisées

### Frontend
- **React (Vite)** : Framework principal pour une interface réactive et rapide.
- **React Router** : Gestion de la navigation.
- **Axios** : Communication avec l'API.
- **React Icons** : Bibliothèque d'iconographie moderne.
- **Context API** : Gestion globale de l'état (Toasts, Authentification).
- **Vanilla CSS** : Design système personnalisé avec variables CSS pour un rendu optimal.

### Backend
- **Node.js & Express** : Serveur d'API robuste.
- **MySQL** : Base de données relationnelle pour la persistance des données.
- **JWT (JSON Web Tokens)** : Sécurisation des routes et sessions utilisateurs.
- **Bcrypt** : Hachage sécurisé des mots de passe.
- **Multer** : Gestion de l'upload des fichiers (avatars et affiches de films).
- **TMDB API** : Intégration avec The Movie Database pour la recherche et le préremplissage des films.

### DevOps & Outils
- **Docker & Docker Compose** : Conteneurisation complète pour un environnement de développement et de production identique.
- **Nginx** : Serveur web pour distribuer les fichiers statiques du frontend.
- **GitHub Actions** : Pipelines CI/CD automatisés (Lint, Test, Build).
- **phpMyAdmin** : Interface visuelle pour la gestion de la base de données.

## 3 Installation et Lancement

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé.
- [TMDB](https://www.themoviedb.org/signup) compte créer pour obtenir une clé API.

### Clonage du projet
```bash
git clone https://github.com/LukwoRider/Cinezone.git
cd Cinezone
```

### Configuration de la clé TMDB
Avant de lancer le projet, vous devez obtenir une clé API TMDB :
1. Créez un compte sur [themoviedb.org](https://www.themoviedb.org/signup)
2. Allez dans **Paramètres > API** pour obtenir votre clé API (v3 auth)
3. Ajoutez votre clé dans le fichier `backend/.env` (variable `TMDB_API_KEY`)

> voir configuration 4 pour la création du .env.

## 4 Configuration (.env)

Le projet utilise des variables d'environnement pour configurer la base de données et la sécurité. Bien que Docker soit préconfiguré, il est essentiel de créer votre propre fichier `.env` pour un environnement hors Docker ou pour personnaliser vos secrets.

1. Rendez-vous dans le dossier backend :
   ```bash
   cd backend
   ```
2. Créer un fichier .env :
   ```bash
   touch .env
   ```
3. Ajouter les variables d'environnement suivantes dans le fichier `.env` :

```bash
PORT=3000

DB_HOST=db
DB_PORT=3306
DB_USER=cinezone_user
DB_PASSWORD=cinezone_password
DB_NAME=cinezone

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=24h

TMDB_API_KEY=your_tmdb_api_key_here
```

---

## 5 Lancement avec Docker
Une seule commande est nécessaire pour lancer tout l'écosystème (BDD, Backend, Frontend, phpMyAdmin) :
```bash
docker-compose up -d --build
```

Une fois lancé :
- **Frontend** : [http://localhost:8080](http://localhost:8080)
- **Backend (API)** : [http://localhost:3300](http://localhost:3300)
- **Backend (API Test)** : [http://localhost:3300/test](http://localhost:3300/test)
- **phpMyAdmin** : [http://localhost:8081](http://localhost:8081)

Vous pouvez vous créer un compte utilisateur en vous inscrivant sur le site ou utiliser le compte administrateur pré-configuré :

- **Email** : `admin@cinezone.com`
- **Mot de passe** : `admin123`

## 6 Lancer les Tests

### Tests Backend (Unitaires)
Les tests du backend utilisent Jest. Pour les lancer :

```bash
cd backend
npm install
npm test
```

### Tests Frontend (E2E avec Cypress)
Cypress est utilisé pour les tests de bout en bout.
```bash
cd frontend
npm install
# Pour ouvrir l'interface de test :
npm run cypress:open
# Pour lancer les tests en mode headless :
npm run cypress:run
```

---

## 7 Remarques et Suggestions

### Remarques :
1. **Gestion des images des films** : Les affiches de films sont uploadées localement dans `backend/uploads/films/`. Lors de l'utilisation de TMDB, l'affiche de film' est automatiquement téléchargé et stocké sur le serveur.
2. **Intégration TMDB** : La recherche TMDB est disponible uniquement lors de la création d'un film. Elle prérempli le titre, le réalisateur, l'année, le synopsis, la note et l'affiche.

### Ce qui serait prévu pour la V2 :
1. **Récupération de mot de passe** : Une fonctionnalité de réinitialisation en cas d'oubli.
2. **Observabilité** : toasts, logs.
3. **Supression categorie**: Empêcher la suppression d'une catégorie si elle est associée à un film ou demander supprimer tout les films de la catégorie.
