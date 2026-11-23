import React from 'react';
import './TitrationLab.css';

export interface FlaskProps {
  /** Volume total larutan di dalam labu dalam mL (volume titrat + volume titran) */
  volumeTotal: number;
  /** Warna cairan di dalam labu (format string CSS, e.g. rgb(...) atau hex) */
  warnaCairan: string;
  /** Label informasi larutan untuk alat bantu siswa */
  labelZat?: string;
  /** Status apakah ada tetesan yang sedang jatuh ke dalam labu */
  sedangMenetes?: boolean;
  /** Nilai pH larutan di dalam labu saat ini untuk tooltip/badge */
  nilaiPH?: number;
}

export const Flask: React.FC<FlaskProps> = ({
  volumeTotal,
  warnaCairan,
  labelZat = 'Labu Erlenmeyer',
  sedangMenetes = false,
  nilaiPH,
}) => {
  // Geometri Labu Erlenmeyer SVG (viewBox 0 0 200 180)
  // Leher labu: x=86 sampai x=114 (lebar 28), y=15 sampai y=60
  // Bibir labu: x=82 sampai x=118, y=10 sampai y=15
  // Badan kerucut: dari (86, 60) dan (114, 60) meluas ke (25, 160) dan (175, 160)
  // Dasar labu: y=160 dengan lengkungan dasar y=165

  // Kapasitas visual labu Erlenmeyer: 100 mL
  // Batas minimum tinggi cairan (saat ada cairan 10 mL) = y=145
  // Batas maksimum tinggi cairan (saat cairan 100 mL) = y=75
  const kapasitasVisual = 100;
  const persentaseVol = Math.max(0.1, Math.min(1, volumeTotal / kapasitasVisual));

  // Menghitung koordinat Y permukaan cairan
  // y=155 (dasar) hingga y=75 (leher bawah)
  const yDasar = 155;
  const yPuncakCairan = yDasar - persentaseVol * 80;

  // Lebar cairan pada tinggi yPuncakCairan:
  // Pada y=60, lebar leher = 28 (x=86 ke x=114, setengah lebar = 14)
  // Pada y=160, lebar dasar = 150 (x=25 ke x=175, setengah lebar = 75)
  // Kemiringan: setengahLebar(y) = 14 + (y - 60) * ((75 - 14) / 100) = 14 + (y - 60) * 0.61
  const setengahLebarPermukaan = 14 + (yPuncakCairan - 60) * 0.61;
  const xKiriPermukaan = Math.max(25, 100 - setengahLebarPermukaan);
  const xKananPermukaan = Math.min(175, 100 + setengahLebarPermukaan);

  return (
    <div className="flask-wrapper" aria-label="Visualisasi Labu Erlenmeyer">
      <div className="flask-visual-container">
        <svg
          className={`flask-svg ${sedangMenetes ? 'flask-swirling' : ''}`}
          viewBox="0 0 200 185"
          width="200"
          height="185"
          aria-hidden="true"
        >
          <defs>
            {/* Gradien pantulan kaca luar */}
            <linearGradient id="gradienKacaErlenmeyer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
              <stop offset="20%" stopColor="rgba(255, 255, 255, 0.08)" />
              <stop offset="80%" stopColor="rgba(255, 255, 255, 0.04)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.4)" />
            </linearGradient>

            {/* Klip bentuk bagian dalam labu Erlenmeyer */}
            <clipPath id="klipBadanErlenmeyer">
              <path
                d="M 86 15 
                   L 86 60 
                   L 26 156 
                   Q 25 165 35 166 
                   L 165 166 
                   Q 175 165 174 156 
                   L 114 60 
                   L 114 15 
                   Z"
              />
            </clipPath>

            {/* Gradien bayangan dasar labu */}
            <radialGradient id="bayanganBawah" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 0, 0, 0.45)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>
          </defs>

          {/* 1. Bayangan meja di bawah labu */}
          <ellipse cx="100" cy="174" rx="72" ry="7" fill="url(#bayanganBawah)" />

          {/* 2. Isi Cairan di dalam Labu Erlenmeyer */}
          <g clipPath="url(#klipBadanErlenmeyer)">
            {/* Latar warna cairan utama */}
            <path
              d={`M ${xKiriPermukaan} ${yPuncakCairan}
                 L 24 156
                 Q 25 167 36 167
                 L 164 167
                 Q 175 167 176 156
                 L ${xKananPermukaan} ${yPuncakCairan}
                 Z`}
              fill={warnaCairan}
              style={{
                transition: 'fill 0.35s ease, d 0.2s ease',
              }}
            />

            {/* Permukaan cairan dengan efek meniskus / ripple saat menetes */}
            <ellipse
              cx="100"
              cy={yPuncakCairan}
              rx={setengahLebarPermukaan}
              ry="4"
              fill={warnaCairan}
              style={{
                filter: 'brightness(1.15)',
                transition: 'all 0.35s ease',
              }}
            />

            {/* Riak gelombang tetesan di tengah permukaan */}
            {sedangMenetes && (
              <ellipse
                cx="100"
                cy={yPuncakCairan}
                rx={setengahLebarPermukaan * 0.45}
                ry="2.2"
                fill="none"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="1.2"
                className="liquid-ripple-ring"
              />
            )}
          </g>

          {/* 3. Dinding Kaca Labu Erlenmeyer Luar */}
          {/* Bibir atas leher labu */}
          <rect
            x="82"
            y="10"
            width="36"
            height="5"
            rx="2.5"
            fill="url(#gradienKacaErlenmeyer)"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1.2"
          />

          {/* Dinding kaca leher dan badan */}
          <path
            d="M 86 15 
               L 86 60 
               L 26 156 
               Q 25 165 35 166 
               L 165 166 
               Q 175 165 174 156 
               L 114 60 
               L 114 15 
               Z"
            fill="url(#gradienKacaErlenmeyer)"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          {/* 4. Garis Tanda Skala Erlenmeyer (Graduasi Kasar) */}
          <g className="flask-scale-marks" opacity="0.9">
            {/* Tanda 25 mL (y ≈ 135) */}
            <line x1="126" y1="135" x2="140" y2="135" stroke="#302044" strokeWidth="1.2" />
            <text x="144" y="137.5" fill="#302044" fontSize="8" fontWeight="700" fontFamily="var(--font-mono, monospace)">25</text>

            {/* Tanda 50 mL (y ≈ 115) */}
            <line x1="118" y1="115" x2="134" y2="115" stroke="#302044" strokeWidth="1.2" />
            <text x="138" y="117.5" fill="#302044" fontSize="8" fontWeight="700" fontFamily="var(--font-mono, monospace)">50</text>

            {/* Tanda 75 mL (y ≈ 95) */}
            <line x1="110" y1="95" x2="128" y2="95" stroke="#302044" strokeWidth="1.2" />
            <text x="132" y="97.5" fill="#302044" fontSize="8" fontWeight="700" fontFamily="var(--font-mono, monospace)">75</text>
          </g>

          {/* 5. Pantulan Cahaya Kaca (Highlights) */}
          <path
            d="M 33 154 L 88 64 L 88 20"
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Label Keterangan Labu & Indikator pH */}
      <div className="flask-info-box">
        <div className="flask-title-row">
          <span className="flask-title-icon">🧪</span>
          <span className="flask-title-text">{labelZat}</span>
        </div>
        <div className="flask-volume-row">
          <span className="flask-vol-label">Volume Cairan:</span>
          <span className="flask-vol-val font-mono">{volumeTotal.toFixed(2).replace('.', ',')} mL</span>
          {typeof nilaiPH === 'number' && (
            <span className="flask-ph-badge" title="pH Larutan Saat Ini">
              pH {nilaiPH.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flask;

