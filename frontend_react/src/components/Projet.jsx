import { Link } from 'react-router-dom'

export default function Projet({ projet, onSupprimer }) {
  const { id, libelle, image, technologie, date } = projet

  return (
    <div className="projet-card">
      <div className="projet-img-wrap">
        <img
          src={image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop'}
          alt={libelle}
          className="projet-img"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop' }}
        />
        <div className="projet-img-overlay">
          <Link to={`/projet/${id}`} className="btn-voir">Voir le projet →</Link>
        </div>
      </div>
      <div className="projet-body">
        <Link to={`/projet/${id}`} className="projet-libelle">{libelle}</Link>
        {technologie && <p className="projet-tech">{technologie}</p>}
        {date && <p className="projet-date">{new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
        <button
          className="btn-supprimer"
          onClick={() => onSupprimer(id)}
          title="Supprimer ce projet"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
