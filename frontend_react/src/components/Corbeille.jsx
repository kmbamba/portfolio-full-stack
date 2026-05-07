import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjetsSupprimes, restaurerProjet, supprimerDefinitivement } from '../services/api'

export default function Corbeille() {
  const navigate = useNavigate()
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    chargerCorbeille()
  }, [])

  const chargerCorbeille = async () => {
    try {
      setLoading(true)
      setErreur(null)
      const data = await getProjetsSupprimes()
      setProjets(data)
    } catch (e) {
      setErreur('Impossible de charger la corbeille.')
    } finally {
      setLoading(false)
    }
  }

  const handleRestaurer = async (id) => {
    if (!window.confirm('Restaurer ce projet ?')) return
    try {
      await restaurerProjet(id)
      setProjets(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      alert('Erreur lors de la restauration.')
    }
  }

  const handleSupprimerDef = async (id) => {
    if (!window.confirm('Supprimer définitivement ce projet ? Cette action est irréversible.')) return
    try {
      await supprimerDefinitivement(id)
      setProjets(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      alert('Erreur lors de la suppression définitive.')
    }
  }

  return (
    <div className="corbeille-page">
      <button className="btn-back" onClick={() => navigate('/')}>← Retour au portfolio</button>

      <div className="corbeille-container">
        <div className="corbeille-header">
          <h1>🗑️ Corbeille</h1>
          <p>Projets supprimés (conservés 30 jours)</p>
        </div>

        {loading && (
          <div className="state-box">
            <div className="spinner"></div>
            <p>Chargement de la corbeille…</p>
          </div>
        )}

        {erreur && (
          <div className="state-box erreur">
            <span className="state-icon">⚠</span>
            <p>{erreur}</p>
            <button className="btn-retry" onClick={chargerCorbeille}>Réessayer</button>
          </div>
        )}

        {!loading && !erreur && (
          <>
            {projets.length === 0 ? (
              <div className="state-box">
                <span className="state-icon">◎</span>
                <p>La corbeille est vide</p>
              </div>
            ) : (
              <div className="corbeille-list">
                {projets.map(projet => (
                  <div key={projet.id} className="corbeille-item">
                    <div className="corbeille-img-wrap">
                      <img
                        src={projet.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'}
                        alt={projet.libelle}
                        className="corbeille-img"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop' }}
                      />
                    </div>
                    <div className="corbeille-content">
                      <h3 className="corbeille-titre">{projet.libelle}</h3>
                      <p className="corbeille-desc">{projet.description?.substring(0, 100)}…</p>
                      <div className="corbeille-meta">
                        <span className="corbeille-tech">{projet.technologie}</span>
                        {projet.dateSuppression && (
                          <span className="corbeille-date">
                            Supprimé le {new Date(projet.dateSuppression).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="corbeille-actions">
                      <button
                        className="btn-restaurer"
                        onClick={() => handleRestaurer(projet.id)}
                        title="Restaurer ce projet"
                      >
                        ↻ Restaurer
                      </button>
                      <button
                        className="btn-supprimer-def"
                        onClick={() => handleSupprimerDef(projet.id)}
                        title="Supprimer définitivement"
                      >
                        ✕ Supprimer def.
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .corbeille-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .corbeille-container {
          margin-top: 2rem;
        }

        .corbeille-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .corbeille-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .corbeille-header p {
          color: #888;
          font-size: 1rem;
        }

        .corbeille-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .corbeille-item {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .corbeille-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .corbeille-img-wrap {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f0f0f0;
        }

        .corbeille-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .corbeille-content {
          padding: 1rem;
          flex: 1;
        }

        .corbeille-titre {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .corbeille-desc {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .corbeille-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .corbeille-tech {
          background: #f0f0f0;
          color: #666;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .corbeille-date {
          color: #999;
          font-style: italic;
        }

        .corbeille-actions {
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          border-top: 1px solid #eee;
        }

        .btn-restaurer, .btn-supprimer-def {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-restaurer {
          background: #4CAF50;
          color: white;
        }

        .btn-restaurer:hover {
          background: #45a049;
        }

        .btn-supprimer-def {
          background: #f44336;
          color: white;
        }

        .btn-supprimer-def:hover {
          background: #da190b;
        }

        .state-box {
          text-align: center;
          padding: 3rem 2rem;
          background: #f9f9f9;
          border-radius: 8px;
          color: #666;
        }

        .state-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #333;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
