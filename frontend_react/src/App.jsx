import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Hero from './components/Hero'
import APropos from './components/APropos'
import Contact from './components/Contact'
import Dossier from './components/Dossier'
import DetaillerProjet from './components/DetaillerProjet'
import Corbeille from './components/Corbeille'
import './App.css'

function NavBar({ onAccueil, onProjets, showBack }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-block" onClick={onAccueil} style={{ cursor: 'pointer' }}>
          <span className="logo-mark">◈</span>
          <div>
            <h1 className="app-title">Khadim Mbaye</h1>
            <p className="app-sub">Cloud & DevOps Engineer</p>
          </div>
        </div>
        <nav className="header-nav">
          {showBack ? (
            <button className="nav-back-btn" onClick={onAccueil}>← Accueil</button>
          ) : (
            <>
              <a href="#apropos" className="nav-link">À propos</a>
              <a href="#contact" className="nav-link">Contact</a>
              <button className="nav-btn-projets" onClick={onProjets}>Mes projets</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function LandingPage({ onVoirProjets }) {
  return (
    <>
      <NavBar onAccueil={() => {}} onProjets={onVoirProjets} showBack={false} />
      <Hero onExplorer={onVoirProjets} />
      <APropos />
      <Contact />
      <footer className="footer">
        <p>© {new Date().getFullYear()} Khadim Mbaye — Cloud & DevOps Engineer</p>
        <div className="footer-socials">
          <a href="https://github.com/kmbamba" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span>·</span>
          <a href="https://www.linkedin.com/in/khadim-mbaye-88ab00329" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <span>·</span>
          <a href="mailto:kmbamba567@gmail.com">Email</a>
        </div>
      </footer>
    </>
  )
}

function Home() {
  const [showProjects, setShowProjects] = useState(false)

  if (showProjects) {
    return (
      <>
        <NavBar onAccueil={() => setShowProjects(false)} showBack={true} />
        <main className="app-main">
          <Dossier />
        </main>
      </>
    )
  }

  return <LandingPage onVoirProjets={() => setShowProjects(true)} />
}

function ProjetDetail() {
  const navigate = useNavigate()
  return (
    <>
      <NavBar onAccueil={() => navigate('/')} showBack={true} />
      <main className="app-main">
        <DetaillerProjet />
      </main>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projet/:id" element={<ProjetDetail />} />
          <Route path="/corbeille" element={<Corbeille />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
