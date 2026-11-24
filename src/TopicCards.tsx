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

/** Mengecek apakah sebuah modul sudah ditandai selesai di userState. */
function modulSelesai(userState: ChemiVerseState | undefined, moduleId: string): boolean {
  return Boolean(userState?.completed_modules?.includes(moduleId));
}

export const TopicCards: React.FC<TopicCardsProps> = ({
  userState,
  onSelectModule,
}) => {
  const totalModul = modules.length;
  const jumlahSelesai = modules.filter((_, i) => modulSelesai(userState, `modul_${i + 1}`)).length;
  const persen = totalModul > 0 ? Math.round((jumlahSelesai / totalModul) * 100) : 0;

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

        {/* Ringkasan progres modul */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            maxWidth: 420,
            margin: '1.25rem auto 0',
            padding: '1rem 1.25rem',
            borderRadius: 16,
            background: 'rgba(15, 30, 45, 0.8)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '2rem' }} aria-hidden="true">🧪</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {jumlahSelesai} / {totalModul}
            </div>
            <div style={{ fontWeight: 600 }}>Modul Diselesaikan</div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={totalModul}
              aria-valuenow={jumlahSelesai}
              aria-label="Progres modul diselesaikan"
              style={{ height: 8, borderRadius: 999, background: 'rgba(148,163,184,0.25)', marginTop: 8, overflow: 'hidden' }}
            >
              <div
                style={{
                  width: `${persen}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #3b82f6, #22d3ee)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="modules-cards-grid">
        {modules.map((mod, idx) => {
          const config = THEME_CONFIGS[idx % THEME_CONFIGS.length];
          const moduleNumber = idx + 1;
          const moduleId = `modul_${moduleNumber}`;
          const selesai = modulSelesai(userState, moduleId);

          const validSubMateri = (mod.subMateri || []).filter(
            (sub) => sub.judul && sub.judul.trim().length > 0
          );

          return (
            <article
              key={mod.id || moduleId}
              className={`module-card card-theme-${config.themeColor}`}
            >
              <div className="card-top-bar">
                <div className="module-number-pill">
                  <span className="mod-icon">{config.badgeIcon}</span>
                  <span className="mod-tag">Modul {moduleNumber}</span>
                </div>
                {selesai && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '0.2rem 0.65rem',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#4ade80',
                      border: '1px solid rgba(74, 222, 128, 0.5)',
                      background: 'rgba(74, 222, 128, 0.12)',
                    }}
                  >
                    ✓ Selesai
                  </span>
                )}
              </div>

              <div className="card-heading-group">
                <h3 className="card-main-title">{mod.judul}</h3>
              </div>

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

              <div className="card-action-footer">
                <button
                  type="button"
                  id={`btn-open-${moduleId}`}
                  className="btn btn-card-primary"
                  onClick={() => onSelectModule && onSelectModule(moduleId)}
                >
                  <span>{selesai ? 'Buka Lagi' : 'Mulai Belajar'}</span>
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