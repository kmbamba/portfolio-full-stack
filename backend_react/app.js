const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const promClient = require("prom-client");
const connectDB = require("./config/connectdb");
const projectRoutes = require("./routes/projectRoutes");

// ── Charger les variables d'environnement ──
dotenv.config();

// ── Connexion à MongoDB ──
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ── Initialiser Express ──
const app = express();

// ── Prometheus : Configuration des métriques ──
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register, prefix: 'portfolio_backend_' });

// Compteur de requêtes HTTP par route/méthode/statut
const httpRequestsTotal = new promClient.Counter({
  name: 'portfolio_backend_http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Histogramme du temps de réponse
const httpRequestDuration = new promClient.Histogram({
  name: 'portfolio_backend_http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// Middleware pour mesurer chaque requête
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode });
    end({ method: req.method, route, status: res.statusCode });
  });
  next();
});

// ── Middlewares ──
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// ── Endpoint /metrics pour Prometheus ──
app.get("/metrics", async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

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
      metrics:          "GET    /metrics",
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
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT} [mode: ${process.env.NODE_ENV}]`);
  });
}

module.exports = app;