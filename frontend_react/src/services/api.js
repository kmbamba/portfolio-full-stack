const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/projects'
// ── Fonction d'adaptation: Backend → Frontend ──
function adaptProjetFromBackend(projetBackend) {
  return {
    id: projetBackend._id,
    libelle: projetBackend.titre,
    description: projetBackend.description,
    technologie: projetBackend.technologies ? projetBackend.technologies.join(', ') : '',
    image: projetBackend.image,
    date: projetBackend.dateDebut,
    lien: projetBackend.lienGithub,
    lienDemo: projetBackend.lienDemo,
    statut: projetBackend.statut
  }
}

// ── Fonction d'adaptation: Frontend → Backend ──
function adaptProjetToBackend(projetFrontend) {
  return {
    titre: projetFrontend.libelle,
    description: projetFrontend.description,
    technologies: projetFrontend.technologie ? projetFrontend.technologie.split(',').map(t => t.trim()) : [],
    image: projetFrontend.image,
    dateDebut: projetFrontend.date,
    lienGithub: projetFrontend.lien,
    lienDemo: projetFrontend.lienDemo,
    statut: projetFrontend.statut || 'en cours'
  }
}

export async function getProjets() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Erreur lors du chargement des projets')
  const responseData = await res.json()
  const projets = responseData.data || responseData
  return Array.isArray(projets) ? projets.map(adaptProjetFromBackend) : []
}

export async function getProjet(id) {
  const res = await fetch(`${API_URL}/${id}`)
  if (!res.ok) throw new Error('Projet introuvable')
  const responseData = await res.json()
  const projet = responseData.data || responseData
  return adaptProjetFromBackend(projet)
}

export async function addProjet(projet) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adaptProjetToBackend(projet))
  })
  if (!res.ok) throw new Error("Erreur lors de l'ajout")
  const responseData = await res.json()
  const nouveau = responseData.data || responseData
  return adaptProjetFromBackend(nouveau)
}

export async function updateProjet(id, projet) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adaptProjetToBackend(projet))
  })
  if (!res.ok) throw new Error("Erreur lors de la mise à jour")
  const responseData = await res.json()
  const updated = responseData.data || responseData
  return adaptProjetFromBackend(updated)
}

export async function deleteProjet(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression')
}

export async function getProjetsSupprimes() {
  const res = await fetch(`${API_URL}/trash/list`)
  if (!res.ok) throw new Error('Erreur lors du chargement de la corbeille')
  const responseData = await res.json()
  const projets = responseData.data || responseData
  return Array.isArray(projets) ? projets.map(adaptProjetFromBackend) : []
}

export async function restaurerProjet(id) {
  const res = await fetch(`${API_URL}/${id}/restore`, { method: 'PUT' })
  if (!res.ok) throw new Error('Erreur lors de la restauration')
  const responseData = await res.json()
  const projet = responseData.data || responseData
  return adaptProjetFromBackend(projet)
}

export async function supprimerDefinitivement(id) {
  const res = await fetch(`${API_URL}/${id}/permanent`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression définitive')
}
