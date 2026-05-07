const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/connectdb");
const projectRoutes = require("./routes/projectRoutes");

// ── Charger les variables d'environnement ──
dotenv.config();

// ── Connexion à MongoDB ──
connectDB();

// ── Initialiser Express ──
const app = express();

// ── Middlewares ──
app.use(cors()); // Activer CORS pour toutes les requêtes
app.use(express.json({ limit: '50mb' }));         // Parser les requêtes JSON (limite augmentée pour les images)
app.use(express.urlencoded({ extended: false, limit: '50mb' })); // Parser les données URL encodées

// ── Routes ──
app.use("/api/projects", projectRoutes);

// ── Route racine de bienvenue ──
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Bienvenue sur l'API Portfolio",
    version: "1.0.0",
    endpoints: {
      getAllProjects:    "GET    /api/projects",
      createProject:    "POST   /api/projects",
      getProjectById:   "GET    /api/projects/:id",
      updateProject:    "PUT    /api/projects/:id",
      deleteProject:    "DELETE /api/projects/:id",
    },
  });
});

// ── Middleware 404 — Route non trouvée ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// ── Middleware global de gestion des erreurs ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Erreur interne du serveur" });
});

// ── Démarrer le serveur ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT} [mode: ${process.env.NODE_ENV}]`);
});
