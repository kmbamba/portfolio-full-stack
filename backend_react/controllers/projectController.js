const Project = require("../models/Project");

// ─────────────────────────────────────────────
// @desc    Ajouter un nouveau projet
// @route   POST /api/projects
// @access  Public
// ─────────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { titre, description, technologies, lienGithub, lienDemo, image, statut, dateDebut, dateFin } = req.body;

    // Vérification des champs obligatoires
    if (!titre || !description || !technologies) {
      return res.status(400).json({
        success: false,
        message: "Les champs titre, description et technologies sont obligatoires",
      });
    }

    const projet = await Project.create({
      titre,
      description,
      technologies,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Projet créé avec succès",
      data: projet,
    });
  } catch (error) {
    // Gérer les erreurs de validation Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Retourner tous les projets
// @route   GET /api/projects
// @access  Public
// ─────────────────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    const { statut, sort } = req.query;

    // Filtre optionnel par statut + EXCLURE les supprimés
    const filter = { estSupprime: false };
    if (statut) filter.statut = statut;

    // Tri optionnel (ex: ?sort=-createdAt pour le plus récent en premier)
    const sortOption = sort || "-createdAt";

    const projets = await Project.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: projets.length,
      data: projets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Retourner un projet par ID
// @route   GET /api/projects/:id
// @access  Public
// ─────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const projet = await Project.findById(req.params.id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: `Aucun projet trouvé avec l'ID : ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: projet,
    });
  } catch (error) {
    // ID MongoDB invalide
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID de projet invalide" });
    }
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Modifier un projet par ID
// @route   PUT /api/projects/:id
// @access  Public
// ─────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const projet = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // Retourner le document mis à jour
        runValidators: true, // Appliquer les validations du schéma
      }
    );

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: `Aucun projet trouvé avec l'ID : ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Projet mis à jour avec succès",
      data: projet,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID de projet invalide" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Supprimer un projet par ID (soft delete)
// @route   DELETE /api/projects/:id
// @access  Public
// ─────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const projet = await Project.findByIdAndUpdate(
      req.params.id,
      {
        estSupprime: true,
        dateSuppression: new Date(),
      },
      { new: true }
    );

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: `Aucun projet trouvé avec l'ID : ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Projet supprimé (placé dans la corbeille)",
      data: {},
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID de projet invalide" });
    }
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Récupérer les projets supprimés (corbeille)
// @route   GET /api/projects/trash/list
// @access  Public
// ─────────────────────────────────────────────
const getTrashProjects = async (req, res) => {
  try {
    const projets = await Project.find({ estSupprime: true }).sort("-dateSuppression");

    res.status(200).json({
      success: true,
      count: projets.length,
      data: projets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Restaurer un projet de la corbeille
// @route   PUT /api/projects/:id/restore
// @access  Public
// ─────────────────────────────────────────────
const restoreProject = async (req, res) => {
  try {
    const projet = await Project.findByIdAndUpdate(
      req.params.id,
      {
        estSupprime: false,
        dateSuppression: null,
      },
      { new: true }
    );

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: `Aucun projet trouvé avec l'ID : ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Projet restauré avec succès",
      data: projet,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID de projet invalide" });
    }
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Supprimer définitivement un projet
// @route   DELETE /api/projects/:id/permanent
// @access  Public
// ─────────────────────────────────────────────
const permanentlyDeleteProject = async (req, res) => {
  try {
    const projet = await Project.findByIdAndDelete(req.params.id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: `Aucun projet trouvé avec l'ID : ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Projet supprimé définitivement",
      data: {},
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID de projet invalide" });
    }
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getTrashProjects,
  restoreProject,
  permanentlyDeleteProject,
};
