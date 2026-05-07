import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Projet from './Projet'
import AjouterProjet from './AjouterProjet'
import { getProjets, deleteProjet } from '../services/api'

export default function Dossier() {
  const [projets, setProjets] = useState([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [showAjouter, setShowAjouter] = useState(false)

  const chargerProjets = async () => {
    try {
      setLoading(true)
      setErreur(null)
      const data = await getProjets()
      setProjets(data)
    } catch (e) {
      setErreur('Impossible de charger les projets. Vérifiez que le backend tourne sur le port 5000.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerProjets() }, [])

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return
    try {
      await deleteProjet(id)
      setProjets(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      alert('Erreur lors de la suppression.')
    }
  }

  const handleAjouter = (nouveau) => {
    setProjets(prev => [...prev, nouveau])
    setShowAjouter(false)
  }

  const projetsFiltres = projets.filter(p =>
    p.libelle.toLowerCase().includes(recherche.toLowerCase()) ||
    p.technologie?.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div className="dossier">
      <div className="dossier-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Rechercher un projet…"
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="search-input"
          />
          {recherche && (
            <button className="clear-search" onClick={() => setRecherche('')}>×</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ajouter" onClick={() => setShowAjouter(true)}>
            <span>+</span> Nouveau projet
          </button>
          <Link to="/corbeille" className="btn-corbeille" style={{ textDecoration: 'none' }}>
            🗑️ Corbeille
          </Link>
        </div>
      </div>

      {showAjouter && (
        <AjouterProjet
          onAjouter={handleAjouter}
          onAnnuler={() => setShowAjouter(false)}
        />
      )}

      {loading && (
        <div className="state-box">
          <div className="spinner"></div>
          <p>Chargement des projets…</p>
        </div>
      )}

      {erreur && (
        <div className="state-box erreur">
          <span className="state-icon">⚠</span>
          <p>{erreur}</p>
          <button className="btn-retry" onClick={chargerProjets}>Réessayer</button>
        </div>
      )}

      {!loading && !erreur && (
        <>
          <div className="dossier-stats">
            <span>{projetsFiltres.length} projet{projetsFiltres.length !== 1 ? 's' : ''}
              {recherche ? ` pour "${recherche}"` : ''}</span>
          </div>

          {projetsFiltres.length === 0 ? (
            <div className="state-box">
              <span className="state-icon">◎</span>
              <p>Aucun projet trouvé.</p>
            </div>
          ) : (
            <div className="projets-grid">
              {projetsFiltres.map(p => (
                <Projet
                  key={p.id}
                  projet={p}
                  onSupprimer={handleSupprimer}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
