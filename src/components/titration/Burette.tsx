import React from 'react';
import './TitrationLab.css';

export interface BuretteProps {
  /** Volume titran yang telah dikeluarkan dari buret (0 - volumeBuret) dalam mL */
  volumeTerpakai: number;
  /** Kapasitas total buret dalam mL (default 50 mL) */
  volumeBuret?: number;
  /** Warna cairan titran di dalam buret */
  warnaTitran?: string;
  /** Handler saat tombol penambahan volume ditekan */
  onTambahVolume: (tambahMl: number) => void;
  /** Status apakah kran buret sedang membuka aliran kontinu */
  aliranAktif?: boolean;
  /** Handler toggle aliran kran kontinu */
  onToggleAliran?: () => void;
  /** Nonaktifkan kontrol */
  disabled?: boolean;
}

export const Burette: React.FC<BuretteProps> = ({
  volumeTerpakai,
  volumeBuret = 50,
  warnaTitran = 'rgba(216, 235, 255, 0.65)',
  onTambahVolume,
  aliranAktif = false,
  onToggleAliran,
  disabled = false,
}) => {
  // Volume tersisa di buret (dari 50 turun ke 0)
  const volumeTersisa = Math.max(0, volumeBuret - volumeTerpakai);
  // Persentase isi cairan (100% saat terpakai 0, 0% saat terpakai 50)
  const persentaseIsi = Math.max(0, Math.min(100, (volumeTersisa / volumeBuret) * 100));

  // Parameter geometri buret SVG
  // Tabung buret dari y=40 sampai y=340 (tinggi total 300)
  const tinggiTabung = 300;
  const lebarTabung = 22;
  const tabungX = 64; // posisi horizontal tengah tabung
  const tabungY = 40;

  // Level cairan: 0 mL di atas (y=40), 50 mL di bawah (y=340)
  // Jadi saat volumeTerpakai = 0, cairan penuh dari y=40 hingga y=340
  // Saat volumeTerpakai bertambah, permukaan atas cairan turun dari y=40 ke bawah
  const levelPermukaanY = tabungY + (volumeTerpakai / volumeBuret) * tinggiTabung;
  const tinggiCairan = Math.max(0, tabungY + tinggiTabung - levelPermukaanY);

  // Buat garis-garis skala (setiap 5 mL garis sedang, setiap 10 mL garis panjang bertuliskan angka)
  const tandaSkala = [];
  for (let v = 0; v <= volumeBuret; v += 1) {
    const y = tabungY + (v / volumeBuret) * tinggiTabung;
    const isMajor = v % 10 === 0;
    const isMedium = v % 5 === 0 && !isMajor;

    let panjangGaris = 4;
    if (isMajor) panjangGaris = 10;
    else if (isMedium) panjangGaris = 7;

    tandaSkala.push(
      <g key={`skala-${v}`}>
        <line
          x1={tabungX + lebarTabung / 2}
          y1={y}
          x2={tabungX + lebarTabung / 2 + panjangGaris}
          y2={y}
          stroke={isMajor ? '#302044' : '#64748B'}
          strokeWidth={isMajor ? 1.6 : 1.0}
        />
        {isMajor && (
          <text
            x={tabungX + lebarTabung / 2 + 13}
            y={y + 3.5}
            fill="#302044"
            fontSize="9"
            fontWeight="700"
            fontFamily="var(--font-mono, monospace)"
            textAnchor="start"
          >
            {v}
          </text>
        )}
      </g>
    );
  }

  return (
    <div className="burette-wrapper" aria-label="Visualisasi Buret Berskala">
      <div className="burette-visual-container">
        <svg
          className="burette-svg"
          viewBox="0 0 160 440"
          width="160"
          height="440"
          aria-hidden="true"
        >
          <defs>
            {/* Gradien kaca buret */}
            <linearGradient id="gradienKacaBuret" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
              <stop offset="25%" stopColor="rgba(255, 255, 255, 0.2)" />
              <stop offset="75%" stopColor="rgba(255, 255, 255, 0.12)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.55)" />
            </linearGradient>

            {/* Gradien cairan buret */}
            <linearGradient id="gradienCairanBuret" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={warnaTitran} stopOpacity="0.9" />
              <stop offset="60%" stopColor={warnaTitran} stopOpacity="0.75" />
              <stop offset="100%" stopColor={warnaTitran} stopOpacity="0.95" />
            </linearGradient>

            {/* Klip buret silinder */}
            <clipPath id="klipTabungBuret">
              <rect
                x={tabungX - lebarTabung / 2}
                y={tabungY}
                width={lebarTabung}
                height={tinggiTabung}
                rx="2"
              />
            </clipPath>
          </defs>

          {/* 1. Statif dan Klem Penjepit Buret */}
          <g className="burette-stand" opacity="0.88">
            {/* Tiang Statif Vertikal di latar belakang */}
            <rect x="24" y="15" width="6" height="420" fill="#64748b" rx="3" />
            <rect x="25" y="15" width="2" height="420" fill="#cbd5e1" />
            {/* Lengan Klem Buret atas */}
            <rect x="26" y="80" width="30" height="7" fill="#7c3aed" rx="2" />
            <ellipse cx="64" cy="83.5" rx="14" ry="5" fill="none" stroke="#a855f7" strokeWidth="2.5" />
            {/* Lengan Klem Buret bawah */}
            <rect x="26" y="240" width="30" height="7" fill="#7c3aed" rx="2" />
            <ellipse cx="64" cy="243.5" rx="14" ry="5" fill="none" stroke="#a855f7" strokeWidth="2.5" />
          </g>

          {/* 2. Corong Buret Atas */}
          <path
            d={`M ${tabungX - 16} 25 L ${tabungX + 16} 25 L ${tabungX + lebarTabung / 2} 40 L ${tabungX - lebarTabung / 2} 40 Z`}
            fill="url(#gradienKacaBuret)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.2"
          />

          {/* 3. Cairan di dalam Tabung Buret */}
          <g clipPath="url(#klipTabungBuret)">
            {tinggiCairan > 0 && (
              <>
                <rect
                  x={tabungX - lebarTabung / 2}
                  y={levelPermukaanY}
                  width={lebarTabung}
                  height={tinggiCairan}
                  fill="url(#gradienCairanBuret)"
                />
                {/* Meniskus Cekung Cairan */}
                <ellipse
                  cx={tabungX}
                  cy={levelPermukaanY}
                  rx={lebarTabung / 2}
                  ry="2.5"
                  fill="rgba(255, 255, 255, 0.45)"
                  opacity="0.8"
                />
              </>
            )}
          </g>

          {/* 4. Dinding Kaca Tabung Buret */}
          <rect
            x={tabungX - lebarTabung / 2}
            y={tabungY}
            width={lebarTabung}
            height={tinggiTabung}
            fill="url(#gradienKacaBuret)"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="1.5"
            rx="2"
          />

          {/* Kilauan pantulan kaca */}
          <line
            x1={tabungX - lebarTabung / 2 + 3}
            y1={tabungY + 4}
            x2={tabungX - lebarTabung / 2 + 3}
            y2={tabungY + tinggiTabung - 4}
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* 5. Garis Skala & Angka Buret */}
          <g className="burette-ticks">{tandaSkala}</g>

          {/* 6. Ujung Bawah Buret Menuju Kran */}
          <path
            d={`M ${tabungX - lebarTabung / 2} ${tabungY + tinggiTabung} 
               L ${tabungX + lebarTabung / 2} ${tabungY + tinggiTabung} 
               L ${tabungX + 4} 360 
               L ${tabungX - 4} 360 Z`}
            fill="url(#gradienKacaBuret)"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.2"
          />

          {/* 7. Kran Buret (Stopcock) Interaktif */}
          <g className="burette-stopcock" onClick={!disabled ? onToggleAliran : undefined} style={{ cursor: disabled ? 'default' : 'pointer' }}>
            {/* Badan tempat kran */}
            <rect
              x={tabungX - 8}
              y="360"
              width="16"
              height="14"
              rx="2"
              fill="#334155"
              stroke="#64748b"
              strokeWidth="1.2"
            />
            {/* Gagang Kran (Stopcock Handle): Horizontal jika tertutup, Vertikal jika terbuka */}
            <g
              transform={`rotate(${aliranAktif ? 90 : 0}, ${tabungX}, 367)`}
              style={{ transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <rect
                x={tabungX - 18}
                y="364"
                width="36"
                height="6"
                rx="3"
                fill={aliranAktif ? '#ec4899' : '#38bdf8'}
                stroke="#ffffff"
                strokeWidth="1"
              />
              <circle cx={tabungX - 14} cy="367" r="2.5" fill="#ffffff" />
              <circle cx={tabungX + 14} cy="367" r="2.5" fill="#ffffff" />
            </g>
          </g>

          {/* 8. Tip Buret (Pipa Lancip Bawah Tempat Menetes) */}
          <path
            d={`M ${tabungX - 3.5} 374 L ${tabungX + 3.5} 374 L ${tabungX + 1.8} 400 L ${tabungX - 1.8} 400 Z`}
            fill="url(#gradienKacaBuret)"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1"
          />

          {/* 9. Tetesan Air / Animasi Tetes */}
          {(aliranAktif || volumeTerpakai > 0) && (
            <g className={`droplet-group ${aliranAktif ? 'continuous-flow' : 'single-drop'}`}>
              <circle
                cx={tabungX}
                cy="406"
                r="2.5"
                fill={warnaTitran}
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="0.8"
                className="animated-droplet"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Kontrol Penambahan Titran */}
      <div className="burette-controls-box">
        <div className="burette-readout-row">
          <div className="readout-card">
            <span className="readout-label">Volume Terpakai</span>
            <span className="readout-value font-mono">
              {volumeTerpakai.toFixed(2).replace('.', ',')} mL
            </span>
          </div>
          <div className="readout-card">
            <span className="readout-label">Buret Tersisa</span>
            <span className="readout-value font-mono">
              {volumeTersisa.toFixed(2).replace('.', ',')} mL
            </span>
          </div>
        </div>

        {/* Indikator Progres Buret */}
        <div className="burette-progress-track" title={`Kapasitas buret: ${persentaseIsi.toFixed(1)}%`}>
          <div
            className="burette-progress-fill"
            style={{ width: `${persentaseIsi}%` }}
          />
        </div>

        {/* Tombol Tetes Bertahap */}
        <div className="titration-actions-grid">
          <button
            type="button"
            className="btn-tetes btn-tetes-fine"
            disabled={disabled || volumeTersisa <= 0}
            onClick={() => onTambahVolume(0.01)}
            title="Tambah 0,01 mL (1 tetes mikro presisi)"
          >
            +0,01 mL
          </button>
          <button
            type="button"
            className="btn-tetes btn-tetes-small"
            disabled={disabled || volumeTersisa < 0.05}
            onClick={() => onTambahVolume(0.05)}
            title="Tambah 0,05 mL (1 tetes standar)"
          >
            +0,05 mL
          </button>
          <button
            type="button"
            className="btn-tetes btn-tetes-medium"
            disabled={disabled || volumeTersisa < 0.1}
            onClick={() => onTambahVolume(0.1)}
            title="Tambah 0,10 mL"
          >
            +0,10 mL
          </button>
          <button
            type="button"
            className="btn-tetes btn-tetes-large"
            disabled={disabled || volumeTersisa < 1.0}
            onClick={() => onTambahVolume(1.0)}
            title="Tambah 1,00 mL"
          >
            +1,00 mL
          </button>
        </div>

        {/* Tombol Buka / Tutup Kran Aliran Kontinu */}
        {onToggleAliran && (
          <button
            type="button"
            className={`btn-stopcock-toggle ${aliranAktif ? 'active-flow' : ''}`}
            disabled={disabled || volumeTersisa <= 0}
            onClick={onToggleAliran}
          >
            <span className="toggle-icon">{aliranAktif ? '⏸' : '💧'}</span>
            <span>{aliranAktif ? 'Tutup Kran (Hentikan)' : 'Buka Kran (Aliran Kontinu)'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Burette;

