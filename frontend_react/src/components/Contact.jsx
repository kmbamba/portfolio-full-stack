import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
      setForm({ nom: '', email: '', sujet: '', message: '' })
    }, 1500)
  }

  return (
    <section className="contact" id="contact">
      <div className="section-inner">
        <div className="section-label">Contact</div>

        <div className="contact-grid">
          <div className="contact-left">
            <h2 className="contact-title">Travaillons<br/><em>ensemble</em></h2>
            <p className="contact-desc">
              Vous avez un projet, une opportunité ou simplement envie d'échanger
              sur le cloud et le DevOps ? N'hésitez pas à me contacter.
            </p>

            <div className="contact-items">
              <a href="mailto:kmbamba567@gmail.com" className="contact-item">
                <div className="contact-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
                </div>
                <div>
                  <p className="contact-item-label">Email</p>
                  <p className="contact-item-val">kmbamba567@gmail.com</p>
                </div>
              </a>

              <a href="https://github.com/kmbamba" target="_blank" rel="noopener noreferrer" className="contact-item">
                <div className="contact-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                </div>
                <div>
                  <p className="contact-item-label">GitHub</p>
                  <p className="contact-item-val">github.com/kmbamba</p>
                </div>
              </a>

              <a href="https://www.linkedin.com/in/khadim-mbaye-88ab00329" target="_blank" rel="noopener noreferrer" className="contact-item">
                <div className="contact-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </div>
                <div>
                  <p className="contact-item-label">LinkedIn</p>
                  <p className="contact-item-val">Khadim Mbaye</p>
                </div>
              </a>
            </div>
          </div>

          <div className="contact-right">
            {sent ? (
              <div className="contact-success">
                <div className="success-icon">✓</div>
                <h3>Message envoyé !</h3>
                <p>Merci Khadim, je vous répondrai dans les plus brefs délais.</p>
                <button className="btn-submit" onClick={() => setSent(false)} style={{marginTop:'1rem'}}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Votre nom</label>
                    <input name="nom" value={form.nom} onChange={handleChange} placeholder="Jean Dupont" required />
                  </div>
                  <div className="form-group">
                    <label>Votre email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jean@email.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Sujet</label>
                  <input name="sujet" value={form.sujet} onChange={handleChange} placeholder="Opportunité / Collaboration / Question…" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Décrivez votre projet ou votre demande…" rows={5} required />
                </div>
                <button type="submit" className="btn-submit contact-submit" disabled={loading}>
                  {loading ? (
                    <><span className="btn-spinner"></span> Envoi en cours…</>
                  ) : (
                    <>Envoyer le message <span>→</span></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
