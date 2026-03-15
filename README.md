# Cinezone 🎬

Cinezone est une plateforme moderne de films. Elle permet aux utilisateurs de parcourir une vaste bibliothèque de films, de les filtrer via différent criteres, et de gérer leurs favoris. Un espace administrateur permet également la gestion complète du catalogue.

## 1 Fonctionnalités
- **Parcours public** : liste et détail des films, filtre multi-critères, recherche, infinite scroll.
- **Comptes et authentification** : inscription, login, persistance JWT, hashage des mots de passes, photo de profil et raffraichissement, déconnexion.
- **Espace membre** : Favoris, notes.
- **Admin** : CRUD films, Catégories, dashboard, gestion des utilisateurs.
- **Qualité** : tests unitaires, tests E2E, CI/CD.
- **DevOps** : Dockerisation, CI/CD.
- **Mode Sombre** : Interface élégante et moderne avec des micro-animations.

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
- **Multer** : Gestion de l'upload des fichiers (avatars).

### DevOps & Outils
- **Docker & Docker Compose** : Conteneurisation complète pour un environnement de développement et de production identique.
- **Nginx** : Serveur web pour distribuer les fichiers statiques du frontend.
- **GitHub Actions** : Pipelines CI/CD automatisés (Lint, Test, Build).
- **phpMyAdmin** : Interface visuelle pour la gestion de la base de données.

## 3 Installation et Lancement

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé.

### Clonage du projet
```bash
git clone https://github.com/LukwoRider/Cinezone.git
cd Cinezone
```

### Lancement avec Docker
Une seule commande est nécessaire pour lancer tout l'écosystème (BDD, Backend, Frontend, phpMyAdmin) :
```bash
docker-compose up -d --build
```

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
3. Ajouter les variables d'environnement suivantes :
   ```bash
  PORT=3000

  DB_HOST=db
  DB_PORT=3306
  DB_USER=cinezone_user
  DB_PASSWORD=cinezone_password
  DB_NAME=cinezone

  JWT_SECRET=your_super_secret_key_here
  JWT_EXPIRES_IN=24h
   ```

---

Une fois lancé :
- **Frontend** : [http://localhost:8080](http://localhost:8080)
- **Backend (API)** : [http://localhost:3300](http://localhost:3300)
- **Backend (API Test)** : [http://localhost:3300/test](http://localhost:3300/test)
- **phpMyAdmin** : [http://localhost:8081](http://localhost:8081)

Vous pouvez vous créer un compte utilisateur en vous inscrivant sur le site ou utiliser le compte admin.

Admin : 
- Email : admin@cinezone.com
- Mot de passe : admin123

## 5 Lancer les Tests

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

## 6 Remarques et Suggestions

### Remarques : 
1. **Gestion des images des films** : J'ai fais le choix d'utiliser des liens url pour l'upload des images des films dans le but de ne pas alourdir le projet.

### Ce qui serait prévu pour la V2 :
1. **Récupération de mot de passe** : Une fonctionnalité d'oubli de mot de passe en cas d'oublie.
2. **Observabilité** : toasts, logs.
