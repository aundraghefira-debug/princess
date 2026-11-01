import React from 'react';
import { modules } from './data/chemData';
import { type ChemiVerseState } from './types';

interface TopicCardsProps {
  userState?: ChemiVerseState;
  onUpdateUserState?: (newState: ChemiVerseState) => void;
  onSelectModule?: (moduleId: string) => void;
}

const THEME_CONFIGS = [
  { themeColor: 'cyan' as const, badgeIcon: '⚛️' },
  { themeColor: 'magenta' as const, badgeIcon: '🔬' },
  { themeColor: 'emerald' as const, badgeIcon: '🧪' },
];

export const TopicCards: React.FC<TopicCardsProps> = ({
  onSelectModule,
}) => {
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
          limbo teori Brønsted-Lowry &amp; Lewis, serta <em>logarithmic blind spot</em> pada perhitungan pH.
        </p>
      </div>

      <div className="modules-cards-grid">
        {modules.map((mod, idx) => {
          const config = THEME_CONFIGS[idx % THEME_CONFIGS.length];
          const moduleNumber = idx + 1;
          const moduleId = `modul_${moduleNumber}`;

          // Ambil daftar judul sub-materi yang tidak kosong dari subMateri[].judul
          const validSubMateri = (mod.subMateri || []).filter(
            (sub) => sub.judul && sub.judul.trim().length > 0
          );

          return (
            <article
              key={mod.id || moduleId}
              className={`module-card card-theme-${config.themeColor}`}
            >
              {/* Card Top Bar: Nomor Modul & Ikon */}
              <div className="card-top-bar">
                <div className="module-number-pill">
                  <span className="mod-icon">{config.badgeIcon}</span>
                  <span className="mod-tag">Modul {moduleNumber}</span>
                </div>
              </div>

              {/* Judul Modul (dari chemData.ts) */}
              <div className="card-heading-group">
                <h3 className="card-main-title">{mod.judul}</h3>
              </div>

              {/* Daftar Judul Sub-Materi (jika data ada) */}
              {validSubMateri.length > 0 && (
                <div className="card-submateri-list">
                  <span className="submateri-list-title">Sub-Materi:</span>
                  <ul>
                    {validSubMateri.map((sub, sIdx) => (
                      <li key={sub.id || sIdx}>
                        <span className="submateri-bullet">•</span>
                        <span>{sub.judul}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer Kartu: Tombol "Mulai Belajar" */}
              <div className="card-action-footer">
                <button
                  type="button"
                  id={`btn-open-${moduleId}`}
                  className="btn btn-card-primary"
                  onClick={() => onSelectModule && onSelectModule(moduleId)}
                >
                  <span>Mulai Belajar</span>
                  <span className="arrow-icon">→</span>
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
    </section>
  );
};

export default TopicCards;
