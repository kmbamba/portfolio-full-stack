const express = require("express");
const router = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getTrashProjects,
  restoreProject,
  permanentlyDeleteProject,
} = require("../controllers/projectController");

// ─────────────────────────────────────────────
//  Route de base : /api/projects
// ─────────────────────────────────────────────

// GET  /api/projects/trash/list        → Projets supprimés (DOIT être avant /:id)
router.get("/trash/list", getTrashProjects);

// GET  /api/projects       → Tous les projets
// POST /api/projects       → Créer un projet
router.route("/").get(getAllProjects).post(createProject);

// GET    /api/projects/:id          → Un projet par ID
// PUT    /api/projects/:id          → Modifier un projet
// DELETE /api/projects/:id          → Supprimer un projet (soft delete)
router.route("/:id").get(getProjectById).put(updateProject).delete(deleteProject);

// PUT    /api/projects/:id/restore   → Restaurer un projet
router.put("/:id/restore", restoreProject);

// DELETE /api/projects/:id/permanent  → Supprimer définitivement
router.delete("/:id/permanent", permanentlyDeleteProject);

module.exports = router;
