const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre du projet est obligatoire"],
      trim: true,
      maxlength: [100, "Le titre ne peut pas dépasser 100 caractères"],
    },
    description: {
      type: String,
      required: [true, "La description est obligatoire"],
      trim: true,
    },
    technologies: {
      type: [String],
      required: [true, "Au moins une technologie est requise"],
    },
    lienGithub: {
      type: String,
      trim: true,
      default: "",
    },
    lienDemo: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    statut: {
      type: String,
      enum: ["en cours", "terminé", "en pause"],
      default: "en cours",
    },
    dateDebut: {
      type: Date,
      default: Date.now,
    },
    dateFin: {
      type: Date,
      default: null,
    },
    estSupprime: {
      type: Boolean,
      default: false,
    },
    dateSuppression: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
