import React, { useState, useMemo } from 'react';

interface HeroSectionProps {
  onStartLearning: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartLearning }) => {
  // State untuk interaktif mini pH explorer di Hero
  const [currentPh, setCurrentPh] = useState<number>(7.0);
  const [activeTripletTab, setActiveTripletTab] = useState<'makro' | 'simbolik' | 'mikro'>('makro');

  // Kalkulasi eksponensial ilmiah
  const calculations = useMemo(() => {
    const phVal = Number(currentPh.toFixed(2));
    const hConc = Math.pow(10, -phVal);
    const pohVal = Number((14 - phVal).toFixed(2));
    const ohConc = Math.pow(10, -pohVal);

    // Format notasi ilmiah Ka atau konsentrasi
    const formatSci = (val: number) => {
      if (val === 1) return '1.00 × 10⁰';
      const exponent = Math.floor(Math.log10(val));
      const mantissa = (val / Math.pow(10, exponent)).toFixed(2);
      // Superscript converter
      const supMap: { [key: string]: string } = {
        '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³',
        '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
      };
      const expSup = String(exponent).split('').map(c => supMap[c] || c).join('');
      return `${mantissa} × 10${expSup}`;
    };

    // Warna indikator makroskopis
    let indicatorColor = '#10b981'; // netral (hijau)
    let indicatorName = 'Netral (Air Murni)';
    let acidityStatus = 'Netral';

    if (phVal < 3.0) {
      indicatorColor = '#ef4444'; // merah asam kuat
      indicatorName = 'Asam Kuat (Merah Terang)';
      acidityStatus = 'Asam Kuat';
    } else if (phVal < 6.5) {
      indicatorColor = '#f97316'; // jingga / kuning asam lemah
      indicatorName = 'Asam Lemah (Jingga Kekuningan)';
      acidityStatus = 'Asam Lemah';
    } else if (phVal <= 7.5) {
      indicatorColor = '#10b981'; // hijau netral
      indicatorName = 'Netral Seimbang (Hijau Zamrud)';
      acidityStatus = 'Netral';
    } else if (phVal <= 11.5) {
      indicatorColor = '#06b6d4'; // biru cyan basa lemah
      indicatorName = 'Basa Lemah (Biru Cerah)';
      acidityStatus = 'Basa Lemah';
    } else {
      indicatorColor = '#a855f7'; // ungu magenta basa kuat
      indicatorName = 'Basa Kuat (Ungu Pekat)';
      acidityStatus = 'Basa Kuat';
    }

    // Ratio partikel untuk tampilan sub-mikroskopis
    const totalSimParticles = 14;
    const hCount = Math.max(1, Math.min(13, Math.round((14 - phVal) * (totalSimParticles / 14))));
    const ohCount = totalSimParticles - hCount;

    return {
      phStr: phVal.toFixed(2),
      pohStr: pohVal.toFixed(2),
      hConcStr: formatSci(hConc),
      ohConcStr: formatSci(ohConc),
      indicatorColor,
      indicatorName,
      acidityStatus,
      hCount,
      ohCount
    };
  }, [currentPh]);

  return (
    <section id="hero" className="hero-section">
      <div className="hero-background-elements" aria-hidden="true">
        <div className="glow-sphere glow-sphere-cyan"></div>
        <div className="glow-sphere glow-sphere-magenta"></div>
        <div className="particle-grid"></div>
      </div>

      <div className="hero-container">
        {/* Kolom Kiri: Teks Narasi & Call to Action */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            <span>Tiga Tingkat Representasi Johnstone · Kimia SMA XI & Mahasiswa</span>
          </div>

          <h1 className="hero-title">
            Kuasai Konsep <span className="text-gradient-cyan">Asam Basa</span> Tanpa Rasa Cemas Rumus
          </h1>

          <p className="hero-description">
            Selamat datang di <strong>ChemiVerse</strong>. Menghubungkan secara instan antara fenomena 
            makroskopis (perubahan warna indikator), rumus simbolik pH matematika, dan 
            visualisasi sub-mikroskopis pergerakan ion <strong>H⁺</strong>, <strong>OH⁻</strong>, serta 
            <strong>H₃O⁺</strong> di dalam air.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              id="btn-start-learning"
              className="btn btn-primary"
              onClick={onStartLearning}
            >
              <span className="btn-icon">🚀</span>
              <span>Mulai Belajar Sekarang</span>
            </button>
            <a
              href="#johnstone-triplet"
              id="btn-learn-johnstone"
              className="btn btn-secondary"
            >
              <span className="btn-icon">📐</span>
              <span>Pelajari Johnstone's Triplet</span>
            </a>
          </div>

          {/* Fitur sorotan ringkas */}
          <div className="hero-highlights-row">
            <div className="highlight-item">
              <span className="highlight-icon">✨</span>
              <div className="highlight-text">
                <strong>Zero-Login</strong>
                <span>Progres tersimpan di LocalStorage</span>
              </div>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🎯</span>
              <div className="highlight-text">
                <strong>Scaffolding</strong>
                <span>Kuis adaptif dengan pohon eror</span>
              </div>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🔬</span>
              <div className="highlight-text">
                <strong>Presisi 0.01 mL</strong>
                <span>Kurva titrasi digital real-time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Interactive Johnstone pH Live Visualizer */}
        <div className="hero-visualizer-wrapper">
          <div className="hero-glass-card">
            <div className="card-header-bar">
              <div className="header-badge-tag">
                <span className="live-dot"></span>
                <span>Eksplorasi Skala pH Real-Time</span>
              </div>
              <span className="ph-badge-value" style={{ borderColor: calculations.indicatorColor }}>
                pH {calculations.phStr}
              </span>
            </div>

            {/* Slider pH 0 - 14 */}
            <div className="slider-control-group">
              <div className="slider-label-row">
                <span className="slider-label">Geser Nilai pH:</span>
                <span className="slider-status" style={{ color: calculations.indicatorColor }}>
                  {calculations.acidityStatus}
                </span>
              </div>
              <input
                type="range"
                id="hero-ph-slider"
                min="0"
                max="14"
                step="0.1"
                value={currentPh}
                onChange={(e) => setCurrentPh(parseFloat(e.target.value))}
                className="custom-range-slider"
                aria-label="Pilih nilai pH larutan"
              />
              <div className="slider-ticks-scale">
                <span>0 (Asam)</span>
                <span>7 (Netral)</span>
                <span>14 (Basa)</span>
              </div>
            </div>

            {/* Triplet Switcher Buttons */}
            <div className="triplet-tab-nav" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTripletTab === 'makro'}
                className={`triplet-tab-btn ${activeTripletTab === 'makro' ? 'active' : ''}`}
                onClick={() => setActiveTripletTab('makro')}
              >
                1. Makroskopis
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTripletTab === 'simbolik'}
                className={`triplet-tab-btn ${activeTripletTab === 'simbolik' ? 'active' : ''}`}
                onClick={() => setActiveTripletTab('simbolik')}
              >
                2. Simbolik
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTripletTab === 'mikro'}
                className={`triplet-tab-btn ${activeTripletTab === 'mikro' ? 'active' : ''}`}
                onClick={() => setActiveTripletTab('mikro')}
              >
                3. Sub-Mikro
              </button>
            </div>

            {/* Tab Display Area */}
            <div className="triplet-display-box">
              {activeTripletTab === 'makro' && (
                <div className="tab-pane-content fade-in">
                  <div className="macro-beaker-preview">
                    <div 
                      className="liquid-surface" 
                      style={{ 
                        backgroundColor: calculations.indicatorColor,
                        boxShadow: `0 0 25px ${calculations.indicatorColor}88`
                      }}
                    >
                      <div className="liquid-bubble b1"></div>
                      <div className="liquid-bubble b2"></div>
                      <div className="liquid-bubble b3"></div>
                    </div>
                  </div>
                  <div className="triplet-caption">
                    <div className="caption-title">Tingkat Makroskopis</div>
                    <p>Fenomena warna indikator universal: <strong>{calculations.indicatorName}</strong>.</p>
                  </div>
                </div>
              )}

              {activeTripletTab === 'simbolik' && (
                <div className="tab-pane-content fade-in">
                  <div className="formula-cards-grid">
                    <div className="formula-mini-box">
                      <span className="formula-label">Konsentrasi Ion Hidronium</span>
                      <span className="formula-code">[H⁺] = {calculations.hConcStr} M</span>
                    </div>
                    <div className="formula-mini-box">
                      <span className="formula-label">Konsentrasi Ion Hidroksida</span>
                      <span className="formula-code">[OH⁻] = {calculations.ohConcStr} M</span>
                    </div>
                    <div className="formula-mini-box">
                      <span className="formula-label">Hubungan Kesetimbangan Air (K_w)</span>
                      <span className="formula-code">pH + pOH = 14.00 ({calculations.phStr} + {calculations.pohStr})</span>
                    </div>
                  </div>
                  <div className="triplet-caption">
                    <div className="caption-title">Tingkat Simbolik</div>
                    <p>Rumus logaritma <code>pH = -log[H⁺]</code> dihitung presisi 2 desimal.</p>
                  </div>
                </div>
              )}

              {activeTripletTab === 'mikro' && (
                <div className="tab-pane-content fade-in">
                  <div className="micro-particles-chamber">
                    {/* Render partikel H+ / H3O+ */}
                    {Array.from({ length: calculations.hCount }).map((_, i) => (
                      <div 
                        key={`h-${i}`} 
                        className="micro-ion ion-h"
                        style={{
                          top: `${15 + (i * 18) % 65}%`,
                          left: `${10 + (i * 24) % 75}%`,
                          animationDelay: `${i * 0.25}s`
                        }}
                        title="Ion Hidronium H⁺ / H₃O⁺"
                      >
                        H⁺
                      </div>
                    ))}
                    {/* Render partikel OH- */}
                    {Array.from({ length: calculations.ohCount }).map((_, i) => (
                      <div 
                        key={`oh-${i}`} 
                        className="micro-ion ion-oh"
                        style={{
                          bottom: `${15 + (i * 20) % 65}%`,
                          right: `${10 + (i * 22) % 75}%`,
                          animationDelay: `${i * 0.3}s`
                        }}
                        title="Ion Hidroksida OH⁻"
                      >
                        OH⁻
                      </div>
                    ))}
                  </div>
                  <div className="triplet-caption">
                    <div className="caption-title">Tingkat Sub-Mikroskopis</div>
                    <p>
                      Populasi partikel: <span className="text-cyan"><strong>{calculations.hCount} H⁺</strong></span> berbanding <span className="text-magenta"><strong>{calculations.ohCount} OH⁻</strong></span>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="triplet-footer-tip">
              💡 <em>Tips Belajar: Perubahan 1 angka pH berarti perubahan 10× lipat kepekatan ion asam atau basa (skala eksponensial).</em>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
