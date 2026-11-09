import { useEffect, useState } from 'react';
import './App.css';
import HeroSection from './HeroSection';
import Navbar from './Navbar';
import TopicCards from './TopicCards';
import ModulDetail from './components/ModulDetail';
import {
  applyTheme,
  persistTheme,
  readStoredTheme,
  resolveTheme,
  subscribeSystemTheme,
  type ThemePreference,
} from './lib/theme';
import PhCalculatorPage from './pages/PhCalculatorPage';
import QuizPage, { type ModeKuis } from './components/QuizPage';
import TitrationLabPage from './pages/TitrationLabPage';
import { DEFAULT_USER_STATE, loadUserState, saveUserState, type ChemiVerseState } from './types';

export type Halaman =
  | 'beranda'
  | 'eksplorasi-ph'
  | 'modul_1'
  | 'modul_2'
  | 'modul_3'
  | 'kuis'
  | 'kalkulator-ph'
  | 'laboratorium-titrasi';

function App() {
  const [userState, setUserState] = useState<ChemiVerseState>(loadUserState);
  const [halaman, setHalaman] = useState<Halaman>('beranda');
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => readStoredTheme());
  // Mode Belajar → materi: sub-materi tujuan dan mode kuis saat kembali dari materi
  const [subTujuan, setSubTujuan] = useState<string | null>(null);
  const [dariKuisBelajar, setDariKuisBelajar] = useState(false);
  const [modeKuisAwal, setModeKuisAwal] = useState<ModeKuis | null>(null);

  // Sync state dengan LocalStorage bila ada perubahan
  useEffect(() => {
    saveUserState(userState);
  }, [userState]);

  useEffect(() => {
    const resolved = resolveTheme(themePreference);
    applyTheme(resolved);
    if (themePreference === 'system') {
      return subscribeSystemTheme(applyTheme);
    }
  }, [themePreference]);

  const handleThemeChange = (pref: ThemePreference) => {
    setThemePreference(pref);
    persistTheme(pref);
  };

  // Gulir ke atas setiap kali halaman berganti (DESAIN_TEKNIS.md Bagian 4)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [halaman]);

  // Setelah modul terbuka dari Mode Belajar, gulir ke sub-materi terkait
  useEffect(() => {
    if (!subTujuan) return;
    const timer = window.setTimeout(() => {
      document
        .getElementById(`sub-${subTujuan}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSubTujuan(null);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [halaman, subTujuan]);

  const handleNavigate = (targetHalaman: Halaman) => {
    setDariKuisBelajar(false);
    setModeKuisAwal(null);
    setHalaman(targetHalaman);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBukaMateri = (modulId: 'modul_1' | 'modul_2' | 'modul_3', subMateriId: string) => {
    setDariKuisBelajar(true);
    setSubTujuan(subMateriId);
    setHalaman(modulId);
  };

  const handleKembaliKeKuis = () => {
    setDariKuisBelajar(false);
    setModeKuisAwal('belajar');
    setHalaman('kuis');
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
        themePreference={themePreference}
        onThemeChange={handleThemeChange}
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
          <>
            {/* Tombol kembali ke Mode Belajar, hanya muncul jika datang dari kuis */}
            {dariKuisBelajar && (
              <div style={{ maxWidth: '980px', margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
                <button type="button" className="btn-back-home" onClick={handleKembaliKeKuis}>
                  ← Kembali ke Latihan (Mode Belajar)
                </button>
              </div>
            )}
            {/* Komponen Detail Modul Sesuai USER_FLOW.md Bagian 3 */}
            <ModulDetail
              moduleId={halaman}
              onBackToHome={() => handleNavigate('beranda')}
              onNavigateModule={(nextModuleId) => handleNavigate(nextModuleId as Halaman)}
              onNavigateToQuiz={() => handleNavigate('kuis')}
              userState={userState}
              onUpdateUserState={setUserState}
            />
          </>
        )}

        {halaman === 'kuis' && (
          <QuizPage
            onNavigate={handleNavigate}
            onBukaMateri={handleBukaMateri}
            modeAwal={modeKuisAwal}
          />
        )}

        {halaman === 'kalkulator-ph' && (
          <PhCalculatorPage onBackToHome={() => handleNavigate('beranda')} />
        )}

        {halaman === 'laboratorium-titrasi' && (
          <TitrationLabPage
            onBackToHome={() => handleNavigate('beranda')}
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