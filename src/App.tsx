import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import TopicCards from './TopicCards';
import ModulDetail from './components/ModulDetail';
import { loadUserState, saveUserState, DEFAULT_USER_STATE, type ChemiVerseState } from './types';
import './App.css';

export type Halaman = 'beranda' | 'eksplorasi-ph' | 'modul_1' | 'modul_2' | 'modul_3';

function App() {
  const [userState, setUserState] = useState<ChemiVerseState>(loadUserState);
  const [halaman, setHalaman] = useState<Halaman>('beranda');

  // Sync state dengan LocalStorage bila ada perubahan
  useEffect(() => {
    saveUserState(userState);
  }, [userState]);

  // Gulir ke atas setiap kali halaman berganti (DESAIN_TEKNIS.md Bagian 4)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [halaman]);

  const handleNavigate = (targetHalaman: Halaman) => {
    setHalaman(targetHalaman);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartLearning = () => {
    const target = document.getElementById('modul-belajar');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      handleNavigate('modul_1');
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
      <Navbar
        onResetProgress={handleResetProgress}
        onNavigate={handleNavigate}
        currentPage={halaman}
      />

      <main className="main-content">
        {halaman === 'beranda' && (
          <>
            {/* 02. Hero Section dengan Judul Edukatif & Live Johnstone Triplet Visualizer (Eksplorasi Skala pH) */}
            <HeroSection onStartLearning={handleStartLearning} />

            {/* 03. Tiga Kartu Modul Interaktif Sesuai PRD, USER_FLOW.md, & DESAIN_TEKNIS.md */}
            <TopicCards
              userState={userState}
              onUpdateUserState={setUserState}
              onSelectModule={(moduleId) => handleNavigate(moduleId as Halaman)}
            />
          </>
        )}

        {(halaman === 'modul_1' || halaman === 'modul_2' || halaman === 'modul_3') && (
          /* Komponen Detail Modul Sesuai USER_FLOW.md Bagian 3 */
          <ModulDetail
            moduleId={halaman}
            onBackToHome={() => handleNavigate('beranda')}
            onNavigateModule={(nextModuleId) => handleNavigate(nextModuleId as Halaman)}
            userState={userState}
            onUpdateUserState={setUserState}
          />
        )}

        {halaman === 'eksplorasi-ph' && (
          <div className="eksplorasi-ph-page">
            <div style={{ maxWidth: '980px', margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
              <button
                type="button"
                className="btn-back-home"
                onClick={() => handleNavigate('beranda')}
              >
                ← Kembali ke Beranda
              </button>
            </div>
            <HeroSection onStartLearning={() => handleNavigate('modul_1')} />
          </div>
        )}
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
                  <li>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => handleNavigate('modul_1')}
                    >
                      Modul 1: Teori Asam Basa
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => handleNavigate('modul_2')}
                    >
                      Modul 2: Kekuatan Asam Basa &amp; pH
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => handleNavigate('modul_3')}
                    >
                      Modul 3: Titrasi Asam Basa
                    </button>
                  </li>
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
