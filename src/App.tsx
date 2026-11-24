import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import TopicCards from './TopicCards';
import ModulDetail from './components/ModulDetail';
import QuizPage, { type ModeKuis } from './components/QuizPage';
import AkunPage from './components/AkunPage';
import PanelGuru from './components/PanelGuru';
import { loadUserState, saveUserState, DEFAULT_USER_STATE, type ChemiVerseState } from './types';
import { resetModuleProgress, resetAllDrafts, resetAllRecords } from './lib/localStore';
import './App.css';
export type Halaman = 'beranda' | 'eksplorasi-ph' | 'kuis' | 'akun' | 'panel-guru' | 'modul_1' | 'modul_2' | 'modul_3';

type ResetJenis = 'progres' | 'draf' | 'riwayat';

const TEKS_KONFIRMASI: Record<ResetJenis, { judul: string; isi: string }> = {
  progres: {
    judul: 'Reset progres modul?',
    isi: 'Tanda "selesai" pada Modul 1-3 akan dihapus. Draf kuis dan riwayat hasil kuis TIDAK dihapus.',
  },
  draf: {
    judul: 'Hapus semua draf kuis?',
    isi: 'Jawaban kuis yang belum dikirim akan dihapus. Progres modul dan riwayat hasil kuis TIDAK dihapus.',
  },
  riwayat: {
    judul: 'Hapus riwayat hasil kuis?',
    isi: 'Semua hasil kuis yang sudah selesai di perangkat ini akan dihapus. Progres modul dan draf kuis TIDAK dihapus.',
  },
};

const OPSI_RESET: { jenis: ResetJenis; label: string }[] = [
  { jenis: 'progres', label: '🔄 Reset progres modul' },
  { jenis: 'draf', label: '📝 Hapus semua draf kuis' },
  { jenis: 'riwayat', label: '🗑️ Hapus riwayat hasil kuis' },
];

function App() {
  const [userState, setUserState] = useState<ChemiVerseState>(loadUserState);
  const [halaman, setHalaman] = useState<Halaman>('beranda');
  // Mode Belajar → materi: sub-materi tujuan dan tombol kembali ke kuis
  const [subTujuan, setSubTujuan] = useState<string | null>(null);
  const [dariKuisBelajar, setDariKuisBelajar] = useState(false);
  const [modeKuisAwal, setModeKuisAwal] = useState<ModeKuis>(null);

  // Reset progres (AD08-03): tiga reset terpisah
  const [menuData, setMenuData] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState<ResetJenis | null>(null);
  const [pesanReset, setPesanReset] = useState<{ ok: boolean; teks: string } | null>(null);

  // Sync state dengan LocalStorage bila ada perubahan
  useEffect(() => {
    saveUserState(userState);
  }, [userState]);

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

  // Escape: kembali dari konfirmasi, atau tutup dialog
  useEffect(() => {
    if (!menuData) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (konfirmasi) setKonfirmasi(null);
      else setMenuData(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuData, konfirmasi]);

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

  // Tombol dari Navbar: buka dialog Reset Progres
  const handleResetProgress = () => {
    setPesanReset(null);
    setKonfirmasi(null);
    setMenuData(true);
  };

  const jalankanReset = () => {
    if (!konfirmasi) return;
    let hasil: { success: boolean; error?: string };
    if (konfirmasi === 'progres') {
      // Penyimpanan lama (_chemiverse_user_state) + penyimpanan baru (chem:chemiverse:v1)
      setUserState(DEFAULT_USER_STATE);
      saveUserState(DEFAULT_USER_STATE);
      hasil = resetModuleProgress();
    } else if (konfirmasi === 'draf') {
      hasil = resetAllDrafts();
    } else {
      hasil = resetAllRecords();
    }
    setPesanReset(
      hasil.success
        ? { ok: true, teks: 'Data berhasil dihapus.' }
        : { ok: false, teks: hasil.error ?? 'Gagal menghapus data.' }
    );
    setKonfirmasi(null);
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
              userState={userState}
              onUpdateUserState={setUserState}
            />
          </>
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
        {halaman === 'kuis' && (
          <QuizPage
            onNavigate={handleNavigate}
            onBukaMateri={handleBukaMateri}
            modeAwal={modeKuisAwal}
          />
        )}
        {halaman === 'akun' && (
          <AkunPage onNavigate={handleNavigate} />
        )}
        {halaman === 'panel-guru' && (
          <PanelGuru onNavigate={handleNavigate} />
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

      {/* Dialog Reset Progres: tiga tindakan reset terpisah (AD08-03) */}
      {menuData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reset progres"
          style={{ position: 'fixed', inset: 0, background: 'rgba(46, 16, 101, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
        >
          <div style={{ background: '#f5f0ff', border: '1px solid #c4b5fd', borderRadius: 16, padding: '1.5rem', maxWidth: 440, width: '100%', color: '#2e1065', boxShadow: '0 20px 50px rgba(91, 33, 182, 0.25)' }}>
            {konfirmasi ? (
              <>
                <h3 style={{ marginTop: 0, color: '#2e1065' }}>{TEKS_KONFIRMASI[konfirmasi].judul}</h3>
                <p style={{ color: '#3b0764' }}>{TEKS_KONFIRMASI[konfirmasi].isi}</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setKonfirmasi(null)}
                    style={{ padding: '0.55rem 1rem', borderRadius: 10, border: '1px solid #a78bfa', background: '#ede9fe', color: '#5b21b6', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={jalankanReset}
                    style={{ padding: '0.55rem 1rem', borderRadius: 10, border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Ya, hapus
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginTop: 0, color: '#2e1065' }}>Reset Progres</h3>
                <p style={{ color: '#4c1d95' }}>Pilih data yang ingin dihapus. Setiap tombol hanya menghapus satu jenis data.</p>
                {pesanReset && (
                  <p role="status" style={{ color: pesanReset.ok ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
                    {pesanReset.teks}
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {OPSI_RESET.map((item) => (
                    <button
                      key={item.jenis}
                      type="button"
                      onClick={() => setKonfirmasi(item.jenis)}
                      style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #a78bfa', background: '#ede9fe', color: '#4c1d95', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMenuData(false)}
                    style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #c4b5fd', background: '#ffffff', color: '#5b21b6', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;