# 📁 Portfolio API — Express.js + MongoDB

API REST complète pour gérer les projets d'un portfolio.

---

## 🗂️ Structure du projet

```
portfolio-api/
├── config/
│   └── connectdb.js          # Connexion à MongoDB
├── controllers/
│   └── projectController.js  # Logique métier (CRUD)
├── models/
│   └── Project.js            # Schéma Mongoose
├── routes/
│   └── projectRoutes.js      # Définition des routes
├── .env                      # Variables d'environnement
├── .env.example              # Modèle .env à copier
├── .gitignore
├── app.js                    # Point d'entrée de l'application
└── package.json
```

---

## ⚙️ Prérequis

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) installé localement **ou** un compte [MongoDB Atlas](https://www.mongodb.com/atlas)
- npm

---

## 🚀 Installation & Démarrage

### 1. Cloner / copier le projet

```bash
cd portfolio-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copier `.env.example` en `.env` et adapter les valeurs :

```bash
cp .env.example .env
```

Contenu du fichier `.env` :

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/portfolio_db
NODE_ENV=development
```

> **MongoDB Atlas** : remplacer `MONGO_URI` par la chaîne de connexion Atlas :
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/portfolio_db`

### 4. Démarrer le serveur

```bash
# Mode production
npm start

# Mode développement (rechargement automatique)
npm run dev
```

Le serveur écoute sur : **http://localhost:5000**

---

## 📡 Endpoints de l'API

| Méthode | URL                     | Description                  |
|---------|-------------------------|------------------------------|
| GET     | `/api/projects`         | Retourner tous les projets   |
| POST    | `/api/projects`         | Ajouter un nouveau projet    |
| GET     | `/api/projects/:id`     | Retourner un projet par ID   |
| PUT     | `/api/projects/:id`     | Modifier un projet           |
| DELETE  | `/api/projects/:id`     | Supprimer un projet          |

---

## 📦 Modèle de données — Project

| Champ         | Type     | Obligatoire | Valeurs possibles               | Défaut      |
|---------------|----------|-------------|----------------------------------|-------------|
| `titre`       | String   | ✅           | max 100 caractères               | —           |
| `description` | String   | ✅           | —                                | —           |
| `technologies`| [String] | ✅           | tableau de chaînes               | —           |
| `lienGithub`  | String   | ❌           | URL                              | `""`        |
| `lienDemo`    | String   | ❌           | URL                              | `""`        |
| `image`       | String   | ❌           | URL ou chemin image              | `""`        |
| `statut`      | String   | ❌           | `en cours`, `terminé`, `en pause`| `en cours`  |
| `dateDebut`   | Date     | ❌           | date ISO                         | maintenant  |
| `dateFin`     | Date     | ❌           | date ISO                         | `null`      |
| `createdAt`   | Date     | auto         | —                                | auto        |
| `updatedAt`   | Date     | auto         | —                                | auto        |

---

## 🧪 Exemples de requêtes

### ➕ POST `/api/projects` — Créer un projet

```json
{
  "titre": "Portfolio Personnel",
  "description": "Site web vitrine pour présenter mes projets et compétences.",
  "technologies": ["React", "Node.js", "MongoDB"],
  "lienGithub": "https://github.com/user/portfolio",
  "lienDemo": "https://monportfolio.com",
  "statut": "terminé"
}
```

**Réponse 201 :**
```json
{
  "success": true,
  "message": "Projet créé avec succès",
  "data": {
    "_id": "663a1f...",
    "titre": "Portfolio Personnel",
    ...
  }
}
```

---

### 📋 GET `/api/projects` — Tous les projets

```
GET http://localhost:5000/api/projects
```

**Filtres disponibles via query params :**

```
GET /api/projects?statut=terminé
GET /api/projects?sort=-createdAt
```

**Réponse 200 :**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

---

### 🔍 GET `/api/projects/:id` — Un projet

```
GET http://localhost:5000/api/projects/663a1f...
```

---

### ✏️ PUT `/api/projects/:id` — Modifier un projet

```json
{
  "statut": "terminé",
  "dateFin": "2024-05-01"
}
```

---

### 🗑️ DELETE `/api/projects/:id` — Supprimer un projet

```
DELETE http://localhost:5000/api/projects/663a1f...
```

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Projet supprimé avec succès",
  "data": {}
}
```

---

## 🛠️ Technologies utilisées

| Package    | Rôle                                      |
|------------|-------------------------------------------|
| `express`  | Framework web Node.js                     |
| `mongoose` | ODM pour interagir avec MongoDB           |
| `dotenv`   | Chargement des variables d'environnement  |
| `nodemon`  | Rechargement auto en développement        |

---

## 📌 Notes

- Toutes les réponses suivent le format `{ success, message?, data }`.
- Les erreurs de validation Mongoose sont capturées et retournées proprement.
- Les IDs invalides retournent un `400 Bad Request`.
- Les ressources non trouvées retournent un `404 Not Found`.
