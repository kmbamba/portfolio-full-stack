import { useState } from 'react'
import { addProjet } from '../services/api'

export default function AjouterProjet({ onAjouter, onAnnuler }) {
  const [form, setForm] = useState({
    libelle: '', description: '', image: '', technologie: '', date: '', lien: ''
  })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageFile = e => {
    const file = e.target.files[0]
    if (file) {
      // Vérifier la taille (max 3MB)
      if (file.size > 3 * 1024 * 1024) {
        alert('L\'image est trop volumineuse (max 3MB). Veuillez choisir une image plus petite.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target.result
        setForm(prev => ({ ...prev, image: base64 }))
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.libelle.trim()) { setErreur('Le libellé est obligatoire.'); return }
    setLoading(true)
    setErreur(null)
    try {
      const nouveau = await addProjet(form)
      onAjouter(nouveau)
    } catch {
      setErreur("Erreur lors de l'ajout du projet.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onAnnuler()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Nouveau projet</h2>
          <button className="modal-close" onClick={onAnnuler}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="projet-form">
          {erreur && <p className="form-erreur">{erreur}</p>}

          <div className="form-group">
            <label>Libellé <span className="required">*</span></label>
            <input name="libelle" value={form.libelle} onChange={handleChange} placeholder="Nom du projet" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrivez votre projet…" rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Technologie</label>
              <input name="technologie" value={form.technologie} onChange={handleChange} placeholder="React, Node.js…" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Image du projet</label>
            <label style={{
              display: 'block',
              padding: '20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              border: '2px dashed #ddd',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {imagePreview ? 'Changer l\'image' : 'Cliquez pour sélectionner une image'}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageFile}
                style={{ display: 'none' }}
              />
            </label>
            {imagePreview && (
              <div style={{ marginTop: '15px' }}>
                <img 
                  src={imagePreview} 
                  alt="Aperçu" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#888', marginTop: '8px', textAlign: 'center' }}>
                  ✓ Image prête à être envoyée
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Lien GitHub / Live</label>
            <input name="lien" value={form.lien} onChange={handleChange} placeholder="https://github.com/…" />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-annuler" onClick={onAnnuler}>Annuler</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Ajout en cours…' : '+ Ajouter le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
