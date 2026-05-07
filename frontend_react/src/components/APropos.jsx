export default function APropos() {
  const skills = [
    { cat: 'Cloud', items: ['AWS', 'Azure', 'GCP', 'Terraform'] },
    { cat: 'CI/CD', items: ['GitHub Actions', 'Jenkins', 'GitLab CI', 'ArgoCD'] },
    { cat: 'Conteneurs', items: ['Docker', 'Kubernetes', 'Helm', 'Docker Compose'] },
    { cat: 'Monitoring', items: ['Prometheus', 'Grafana', 'ELK Stack', 'Datadog'] },
    { cat: 'Scripting', items: ['Bash', 'Python', 'YAML', 'HCL'] },
    { cat: 'OS & Réseau', items: ['Linux', 'Nginx', 'DNS', 'VPN'] },
  ]

  return (
    <section className="apropos" id="apropos">
      <div className="section-inner">
        <div className="section-label">À propos</div>

        <div className="apropos-grid">
          <div className="apropos-left">
            <div className="apropos-photo-wrap">
              <div className="apropos-photo-ring"></div>
              <div className="apropos-photo">
                <img src="/src/assets/photo.jpg" alt="Khadim Mbaye" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} />
              </div>
              <div className="apropos-photo-badge">
                <span>☁</span> Cloud & DevOps
              </div>
            </div>

            <div className="apropos-infos">
              <div className="info-row">
                <span className="info-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <span>Khadim Mbaye</span>
              </div>
              <div className="info-row">
                <span className="info-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
                </span>
                <a href="mailto:kmbamba567@gmail.com" className="info-link">kmbamba567@gmail.com</a>
              </div>
              <div className="info-row">
                <span className="info-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                </span>
                <a href="https://github.com/kmbamba" target="_blank" rel="noopener noreferrer" className="info-link">github.com/kmbamba</a>
              </div>
              <div className="info-row">
                <span className="info-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </span>
                <a href="https://www.linkedin.com/in/khadim-mbaye-88ab00329" target="_blank" rel="noopener noreferrer" className="info-link">LinkedIn</a>
              </div>
            </div>
          </div>

          <div className="apropos-right">
            <h2 className="apropos-title">
              Passionné par l'<em>automatisation</em><br/>& le <em>cloud</em>
            </h2>
            <p className="apropos-bio">
              Passionné par le cloud et les technologies DevOps, j'apprends en réalisant
              des projets concrets autour de l'automatisation et du déploiement d'applications.
              Je suis en constante évolution pour maîtriser les outils modernes du DevOps.
            </p>
            <p className="apropos-bio">
              Mon objectif est de construire des pipelines robustes, des infrastructures
              scalables et des environnements de déploiement fiables, en appliquant
              les meilleures pratiques de l'industrie.
            </p>

            <div className="skills-section">
              <h3 className="skills-title">Compétences techniques</h3>
              <div className="skills-grid">
                {skills.map(s => (
                  <div key={s.cat} className="skill-group">
                    <p className="skill-cat">{s.cat}</p>
                    <div className="skill-tags">
                      {s.items.map(item => (
                        <span key={item} className="skill-tag">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
