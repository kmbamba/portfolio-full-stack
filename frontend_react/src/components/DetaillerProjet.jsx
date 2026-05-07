import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjet, updateProjet } from '../services/api'

export default function DetaillerProjet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projet, setProjet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await getProjet(id)
        setProjet(data)
        setForm(data)
        setImagePreview(data.image)
        setOriginalImage(data.image)
      } catch {
        setErreur('Projet introuvable.')
      } finally {
        setLoading(false)
      }
    }
    charger()
  }, [id])

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

  const handleSave = async e => {
    e.preventDefault()
    if (!form.libelle || !form.libelle.trim()) {
      alert('Le libellé est obligatoire.')
      return
    }
    
    setSaving(true)
    try {
      // Si l'image a pas changé (ou est base64 trop grande), on l'envoie pas
      let formToSend = { ...form }
      
      if (form.image && form.image.startsWith('data:')) {
        // C'est une base64 (image changée)
        const sizeInMB = (form.image.length * 3) / (4 * 1024 * 1024)
        if (sizeInMB > 3) {
          console.warn(`Image trop grande (${sizeInMB.toFixed(2)}MB), utilisation de l'image précédente`)
          formToSend.image = originalImage
        }
      }
      
      const updated = await updateProjet(id, formToSend)
      setProjet(updated)
      setImagePreview(updated.image)
      setOriginalImage(updated.image)
      setEditing(false)
      alert('Projet mis à jour avec succès!')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données et réessayez.'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="state-box"><div className="spinner"></div><p>Chargement…</p></div>
  )

  if (erreur) return (
    <div className="state-box erreur">
      <span className="state-icon">⚠</span>
      <p>{erreur}</p>
      <button className="btn-retry" onClick={() => navigate('/')}>← Retour</button>
    </div>
  )

  return (
    <div className="detail-page">
      <button className="btn-back" onClick={() => navigate('/')}>← Retour au portfolio</button>

      <div className="detail-card">
        <div className="detail-img-wrap">
          <img
            src={projet.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=500&fit=crop'}
            alt={projet.libelle}
            className="detail-img"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=500&fit=crop' }}
          />
          <div className="detail-img-badge">{projet.technologie}</div>
        </div>

        {!editing ? (
          <div className="detail-content">
            <div className="detail-meta">
              {projet.date && <span className="detail-date">{new Date(projet.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            </div>
            <h1 className="detail-title">{projet.libelle}</h1>
            <p className="detail-desc">{projet.description || 'Aucune description disponible.'}</p>

            {projet.lien && (
              <a href={projet.lien} target="_blank" rel="noopener noreferrer" className="detail-lien">
                Voir le projet ↗
              </a>
            )}

            <div className="detail-actions">
              <button className="btn-annuler" onClick={() => navigate('/')}>Annuler</button>
              <button className="btn-editer" onClick={() => {
                setEditing(true)
                setImagePreview(projet.image)
                setForm(projet)
              }}>Éditer</button>
            </div>
          </div>
        ) : (
          <form className="detail-content edit-form" onSubmit={handleSave}>
            <h2 className="modal-title" style={{marginBottom:'1.5rem'}}>Modifier le projet</h2>

            <div className="form-group">
              <label>Libellé</label>
              <input name="libelle" value={form.libelle || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description || ''} onChange={handleChange} rows={4} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Technologie</label>
                <input name="technologie" value={form.technologie || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={form.date || ''} onChange={handleChange} />
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
              <label>Lien</label>
              <input name="lien" value={form.lien || ''} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-annuler" onClick={() => {
                setEditing(false)
                setForm(projet)
                setImagePreview(projet.image)
              }}>Annuler</button>
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
