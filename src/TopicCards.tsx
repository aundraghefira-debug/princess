import { useState } from 'react';
import { saveUserState, type ChemiVerseState } from './types';

interface TopicCardsProps {
  userState: ChemiVerseState;
  onUpdateUserState: (newState: ChemiVerseState) => void;
  onSelectModule?: (moduleId: string) => void;
}

interface ModuleData {
  id: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  johnstoneLevels: { label: string; type: 'macro' | 'symbolic' | 'micro' }[];
  description: string;
  chemicalEquations: string[];
  scientificHighlights: { label: string; formula: string }[];
  features: string[];
  themeColor: 'cyan' | 'magenta' | 'emerald';
  badgeIcon: string;
}

export const TopicCards: React.FC<TopicCardsProps> = ({
  userState,
  onUpdateUserState,
  onSelectModule,
}) => {
  const [selectedPreviewModule, setSelectedPreviewModule] = useState<ModuleData | null>(null);

  const modules: ModuleData[] = [
    {
      id: 'modul_1',
      moduleNumber: 1,
      title: 'Teori Asam Basa',
      subtitle: 'Sandbox Ikatan & Transfer Elektron',
      johnstoneLevels: [
        { label: 'Tingkat Simbolik', type: 'symbolic' },
        { label: 'Tingkat Sub-Mikro', type: 'micro' },
      ],
      description:
        'Kanvas seret-lepas (drag-and-drop) molekul 2D. Tarik atom hidrogen (H⁺) dari molekul asam ke basa (Teori Brønsted-Lowry), atau tarik panah pasangan elektron bebas (PEB) dari donor ke akseptor (Teori Lewis). Sistem secara otomatis mengunci ikatan baru dan melabeli pasangan konjugasi secara instan.',
      chemicalEquations: [
        'NH₃ + H₂O ⇌ NH₄⁺ + OH⁻',
        'HCl + H₂O → H₃O⁺ + Cl⁻',
        'HCO₃⁻ (Amfiprotik: Asam/Basa)',
      ],
      scientificHighlights: [
        { label: 'Donor Proton', formula: 'Asam Brønsted-Lowry (H⁺)' },
        { label: 'Akseptor Proton', formula: 'Basa Brønsted-Lowry' },
        { label: 'Pasangan Elektron Bebas', formula: 'Donor PEB (Lewis)' },
      ],
      features: [
        'Kanvas Drag-and-Drop Molekul 2D',
        'Deteksi Spesi Amfoter / Amfiprotik',
        'Visualisasi Pasangan Asam-Basa Konjugasi',
      ],
      themeColor: 'cyan',
      badgeIcon: '⚛️',
    },
    {
      id: 'modul_2',
      moduleNumber: 2,
      title: 'Simulasi Mikroskopis pH',
      subtitle: 'Micro-Macro Simulator & Zoom Partikel',
      johnstoneLevels: [
        { label: 'Tingkat Makroskopis', type: 'macro' },
        { label: 'Tingkat Sub-Mikro', type: 'micro' },
        { label: 'Tingkat Simbolik', type: 'symbolic' },
      ],
      description:
        'Simulasi gelas kimia interaktif dengan slider konsentrasi dan jenis zat kimia. Buka jendela zoom-in sub-mikroskopis menggunakan Kaca Pembesar Virtual untuk melihat ionisasi 100% pada asam kuat versus disosiasi sebagian pada asam lemah (Kₐ = 10⁻⁵). Grafik kurva pH dan rumus logaritma bergerak serentak.',
      chemicalEquations: [
        'HCl → H⁺ + Cl⁻ (Ionisasi 100%)',
        'CH₃COOH ⇌ CH₃COO⁻ + H⁺ (Kₐ = 1.8 × 10⁻⁵)',
        'pH = -log[H⁺] (Presisi 2 Desimal)',
      ],
      scientificHighlights: [
        { label: 'Disosiasi Asam Kuat', formula: 'α = 1 (Pecah Sempurna)' },
        { label: 'Tetapan Ionisasi Asam', formula: 'Kₐ = 10⁻⁵' },
        { label: 'Skala pH Logaritmik', formula: 'ΔpH 1 = 10× Kepekatan' },
      ],
      features: [
        'Kaca Pembesar Virtual Sub-Mikroskopis',
        'Komparasi Asam Kuat vs Asam Lemah',
        'Kalkulator pH Real-Time (.toFixed(2))',
      ],
      themeColor: 'magenta',
      badgeIcon: '🔬',
    },
    {
      id: 'modul_3',
      moduleNumber: 3,
      title: 'Laboratorium Titrasi Virtual',
      subtitle: 'Gamified Titration Lab with Color Blending',
      johnstoneLevels: [
        { label: 'Tingkat Makroskopis', type: 'macro' },
        { label: 'Tingkat Simbolik', type: 'symbolic' },
      ],
      description:
        'Laboratorium titrasi virtual interaktif dengan kran buret digital presisi tetes demi tetes (0.01 mL). Amati pergeseran warna indikator fenolftalein secara gradual dari bening, merah muda semu, hingga magenta pekat berdasarkan kalkulasi Larutan Penyangga dan Hidrolisis Garam pada kurva titrasi dinamis.',
      chemicalEquations: [
        'NaOH + CH₃COOH → CH₃COONa + H₂O',
        'Titik Ekuivalen pada pH 8.72',
        'Transisi Fenolftalein (pH 8.3 - 10.0)',
      ],
      scientificHighlights: [
        { label: 'Presisi Aliran Buret', formula: '0.01 mL per tetes' },
        { label: 'Daerah Buffer', formula: 'Larutan Penyangga Asam' },
        { label: 'Titik Akhir Titrasi', formula: 'Gradasi Warna RGB Asli' },
      ],
      features: [
        'Knob Putar Digital Buret Presisi Tinggi',
        'Pencampuran Gradasi Warna Hex-RGB Nyata',
        'Plot Kurva Titrasi Dinamis Titik demi Titik',
      ],
      themeColor: 'emerald',
      badgeIcon: '🧪',
    },
  ];

  const toggleModuleCompletion = (moduleId: string) => {
    const isCompleted = userState.completed_modules.includes(moduleId);
    const newCompleted = isCompleted
      ? userState.completed_modules.filter((id) => id !== moduleId)
      : [...userState.completed_modules, moduleId];

    const updatedState: ChemiVerseState = {
      ...userState,
      completed_modules: newCompleted,
    };

    onUpdateUserState(updatedState);
    saveUserState(updatedState);
  };

  const handleOpenModule = (mod: ModuleData) => {
    if (onSelectModule) {
      onSelectModule(mod.id);
    } else {
      setSelectedPreviewModule(mod);
    }
  };

  return (
    <section id="modul-belajar" className="topic-cards-section">
      <div className="section-header-block">
        <div className="section-badge">
          <span>Kurikulum Sains Interaktif</span>
        </div>
        <h2 className="section-title">
          Tiga Modul Pembelajaran <span className="text-gradient-cyan">ChemiVerse</span>
        </h2>
        <p className="section-subtitle">
          Disusun secara bertingkat untuk mengatasi miskonsepsi Tiga Tingkat Johnstone, 
          limbo teori Brønsted-Lowry & Lewis, serta <em>logarithmic blind spot</em> pada perhitungan pH.
        </p>
      </div>

      <div className="modules-cards-grid">
        {modules.map((mod) => {
          const isCompleted = userState.completed_modules.includes(mod.id);

          return (
            <article
              key={mod.id}
              className={`module-card card-theme-${mod.themeColor} ${
                isCompleted ? 'module-completed' : ''
              }`}
            >
              {/* Card Header & Johnstone Tags */}
              <div className="card-top-bar">
                <div className="module-number-pill">
                  <span className="mod-icon">{mod.badgeIcon}</span>
                  <span className="mod-tag">Modul {mod.moduleNumber}</span>
                </div>

                {/* Completion Status Badge */}
                <button
                  type="button"
                  className={`status-chip ${isCompleted ? 'status-completed' : 'status-pending'}`}
                  title={
                    isCompleted
                      ? 'Modul telah diselesaikan. Klik untuk mengubah status progres.'
                      : 'Modul belum diselesaikan. Klik untuk menandai selesai.'
                  }
                  onClick={() => toggleModuleCompletion(mod.id)}
                >
                  <span className="status-indicator-dot"></span>
                  <span>{isCompleted ? 'Selesai ✓' : 'Belum Selesai'}</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="card-heading-group">
                <h3 className="card-main-title">{mod.title}</h3>
                <span className="card-sub-title">{mod.subtitle}</span>
              </div>

              {/* Johnstone Triplet Level Badges */}
              <div className="johnstone-level-pills">
                {mod.johnstoneLevels.map((lvl, idx) => (
                  <span key={idx} className={`johnstone-pill pill-${lvl.type}`}>
                    {lvl.label}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="card-description-text">{mod.description}</p>

              {/* Scientific Formula Box (Format Ilmiah Baku) */}
              <div className="card-scientific-box">
                <div className="sci-box-header">
                  <span className="sci-box-icon">📐</span>
                  <span className="sci-box-title">Notasi & Rumus Ilmiah:</span>
                </div>
                <div className="sci-equations-list">
                  {mod.chemicalEquations.map((eq, eqIdx) => (
                    <div key={eqIdx} className="equation-tag">
                      <code>{eq}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Features List */}
              <div className="card-features-list">
                <span className="features-title">Fitur Pembelajaran:</span>
                <ul>
                  {mod.features.map((feat, fIdx) => (
                    <li key={fIdx}>
                      <span className="feature-check">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer Actions */}
              <div className="card-action-footer">
                <button
                  type="button"
                  id={`btn-open-${mod.id}`}
                  className="btn btn-card-primary"
                  onClick={() => handleOpenModule(mod)}
                >
                  <span>Buka Modul {mod.moduleNumber}</span>
                  <span className="arrow-icon">→</span>
                </button>
                <button
                  type="button"
                  className="btn btn-card-outline"
                  title="Tandai progres penyelesaian"
                  onClick={() => toggleModuleCompletion(mod.id)}
                >
                  {isCompleted ? 'Tandai Belum' : 'Tandai Selesai'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Johnstone Triplet Explanatory Section */}
      <div id="johnstone-triplet" className="johnstone-summary-banner">
        <div className="banner-icon-side">
          <div className="triplet-triangle-visual">
            <div className="triangle-vertex vertex-macro">Makro</div>
            <div className="triangle-vertex vertex-submicro">Sub-Mikro</div>
            <div className="triangle-vertex vertex-symbolic">Simbolik</div>
            <div className="triangle-center-label">Johnstone's Triplet</div>
          </div>
        </div>
        <div className="banner-text-side">
          <div className="banner-badge">Landasan Teori Pendidikan Kimia</div>
          <h3 className="banner-title">
            Mengapa Tiga Tingkat Representasi Johnstone Sangat Penting?
          </h3>
          <p className="banner-text">
            Menurut Alex Johnstone (1991), pemahaman sains yang utuh memerlukan integrasi simultan 
            dari tiga domain representasi:
          </p>
          <div className="triplet-grid-explanation">
            <div className="triplet-item">
              <strong className="text-emerald">1. Makroskopis:</strong>
              <span>Apa yang dapat diamati oleh indra siswa di lab (seperti transisi gradasi warna indikator fenolftalein).</span>
            </div>
            <div className="triplet-item">
              <strong className="text-cyan">2. Simbolik:</strong>
              <span>Representasi matematis dan notasi rumus kimia (seperti pH = -log[H⁺], Kₐ = 10⁻⁵, rumus disosiasi).</span>
            </div>
            <div className="triplet-item">
              <strong className="text-magenta">3. Sub-Mikroskopis:</strong>
              <span>Perilaku partikel ion molekuler nyata di tingkat mikroskopis (ion H⁺, OH⁻, dan H₃O⁺ di dalam pelarut air).</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Overview Preview Modal (Bila dipilih) */}
      {selectedPreviewModule && (
        <div className="modal-overlay" onClick={() => setSelectedPreviewModule(null)}>
          <div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-badge">
                  {selectedPreviewModule.badgeIcon} Modul {selectedPreviewModule.moduleNumber}
                </span>
                <h3 className="modal-title">{selectedPreviewModule.title}</h3>
                <span className="modal-subtitle">{selectedPreviewModule.subtitle}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedPreviewModule(null)}
                aria-label="Tutup pratinjau"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">{selectedPreviewModule.description}</p>

              <div className="modal-formula-section">
                <h4>Format Ilmiah & Spesi Kimia:</h4>
                <div className="modal-formulas-grid">
                  {selectedPreviewModule.chemicalEquations.map((eq, i) => (
                    <div key={i} className="modal-eq-badge">
                      <code>{eq}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-highlights-section">
                <h4>Sorotan Konsep Kunci:</h4>
                <div className="modal-highlights-grid">
                  {selectedPreviewModule.scientificHighlights.map((sh, idx) => (
                    <div key={idx} className="modal-highlight-card">
                      <span className="sh-label">{sh.label}</span>
                      <strong className="sh-formula">{sh.formula}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-privacy-note">
                🔒 <em>Catatan: Seluruh data progres modul ini disimpan secara lokal di peramban Anda (Zero-Login LocalStorage).</em>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedPreviewModule(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  toggleModuleCompletion(selectedPreviewModule.id);
                  setSelectedPreviewModule(null);
                }}
              >
                {userState.completed_modules.includes(selectedPreviewModule.id)
                  ? 'Batal Tandai Selesai'
                  : 'Tandai Selesai Modul Ini ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TopicCards;
