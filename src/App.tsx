import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import TopicCards from './TopicCards';
import { loadUserState, saveUserState, DEFAULT_USER_STATE, type ChemiVerseState } from './types';
import './App.css';

function App() {
  const [userState, setUserState] = useState<ChemiVerseState>(loadUserState);

  // Sync state dengan LocalStorage bila ada perubahan
  useEffect(() => {
    saveUserState(userState);
  }, [userState]);

  const handleStartLearning = () => {
    const target = document.getElementById('modul-belajar');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang seluruh data progres belajar lokal?')) {
      setUserState(DEFAULT_USER_STATE);
      saveUserState(DEFAULT_USER_STATE);
    }
  };

  return (
    <div className="app-wrapper">
      {/* 01. Navbar dengan Identitas Media ChemiVerse & Tracker Progres */}
      <Navbar onResetProgress={handleResetProgress} />

      <main className="main-content">
        {/* 02. Hero Section dengan Judul Edukatif & Live Johnstone Triplet Visualizer */}
        <HeroSection onStartLearning={handleStartLearning} />

        {/* 03. Tiga Kartu Modul Interaktif Sesuai PRD & AGENT.md */}
        <TopicCards
          userState={userState}
          onUpdateUserState={setUserState}
        />
      </main>

      {/* 04. Footer Edukasi Sains */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-top-row">
            <div className="footer-brand-col">
              <div className="brand-name">
                Chemi<span className="brand-highlight">Verse</span>
              </div>
              <p className="footer-desc">
                Laboratorium Virtual Kimia Asam Basa Berbasis Tiga Tingkat Representasi Johnstone 
                (Makroskopis, Simbolik, dan Sub-Mikroskopis) untuk Siswa SMA Kelas XI dan Mahasiswa Kimia Dasar.
              </p>
            </div>

            <div className="footer-specs-col">
              <div className="footer-spec-group">
                <h5>Modul Pembelajaran</h5>
                <ul>
                  <li>Modul 1: Teori Asam Basa (Sandbox Ikatan)</li>
                  <li>Modul 2: Simulasi Mikroskopis pH</li>
                  <li>Modul 3: Laboratorium Titrasi Virtual</li>
                </ul>
              </div>

              <div className="footer-spec-group">
                <h5>Standar & Sains</h5>
                <ul>
                  <li>Format Notasi Ilmiah Kimia Baku</li>
                  <li>Kalkulasi pH Client-Side Presisi .toFixed(2)</li>
                  <li>Scaffolding & Johnstone Triplet Model</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom-row">
            <div className="footer-privacy-pill">
              <span>🔒 Zero-Login LocalStorage: Privasi belajar 100% di peramban Anda.</span>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} ChemiVerse Interactive Lab. Hak Cipta Dilindungi.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
