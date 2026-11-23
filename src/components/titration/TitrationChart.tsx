import React, { useMemo, useState } from 'react';
import type { ParameterTitrasi } from '../../utils/titrationEngine';
import { buatKurva } from '../../utils/titrationEngine';
import type { Indikator } from '../../data/chemData';
import './TitrationLab.css';

export interface TitrationChartProps {
  /** Parameter dasar titrasi untuk membuat kurva teoretis */
  parameter: Omit<ParameterTitrasi, 'volumeTitran'>;
  /** Volume maksimum pada sumbu X (mL), biasanya kapasitas buret (50 mL) */
  volumeMaks?: number;
  /** Volume titran aktual saat ini (mL) */
  volumeTitranAktual: number;
  /** pH larutan aktual saat ini */
  phAktual: number;
  /** Volume titik ekuivalen teoretis (mL) */
  volumeEkuivalen: number;
  /** pH pada titik ekuivalen */
  phEkuivalen: number;
  /** Indikator terpilih untuk menampilkan pita trayek pH */
  indikator?: Indikator;
}

export const TitrationChart: React.FC<TitrationChartProps> = ({
  parameter,
  volumeMaks = 50,
  volumeTitranAktual,
  phAktual,
  volumeEkuivalen,
  phEkuivalen,
  indikator,
}) => {
  const [_hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; v: number; ph: number } | null>(null);

  // Dimensi canvas SVG
  const svgWidth = 560;
  const svgHeight = 340;
  const padding = { top: 25, right: 30, bottom: 45, left: 45 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Konversi data ke koordinat SVG
  // X: 0 -> volumeMaks mL
  // Y: 0 -> 14 pH
  const getX = (volume: number) => {
    const clampedV = Math.max(0, Math.min(volumeMaks, volume));
    return padding.left + (clampedV / volumeMaks) * plotWidth;
  };

  const getY = (ph: number) => {
    const clampedPH = Math.max(0, Math.min(14, ph));
    return padding.top + ((14 - clampedPH) / 14) * plotHeight;
  };

  // Buat kurva teoretis dengan useMemo agar tidak dihitung ulang setiap render
  const titikKurva = useMemo(() => {
    return buatKurva(parameter, volumeMaks, 0.2);
  }, [parameter, volumeMaks]);

  // Bangun path SVG (d attribute)
  const pathData = useMemo(() => {
    if (!titikKurva || titikKurva.length === 0) return '';
    return titikKurva.reduce((acc, pt, idx) => {
      const x = getX(pt.volume);
      const y = getY(pt.pH);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [titikKurva, volumeMaks, plotWidth, plotHeight]);

  // Koordinat Titik Ekuivalen
  const xTE = getX(volumeEkuivalen);
  const yTE = getY(phEkuivalen);

  // Koordinat Posisi Aktual Titrasi
  const xAktual = getX(volumeTitranAktual);
  const yAktual = getY(phAktual);

  // Koordinat Pita Trayek Indikator
  const yIndikatorBawah = indikator ? getY(indikator.trayekBawah) : 0;
  const yIndikatorAtas = indikator ? getY(indikator.trayekAtas) : 0;
  const tinggiPitaIndikator = indikator ? Math.abs(yIndikatorBawah - yIndikatorAtas) : 0;

  // Garis-garis sumbu X (setiap 10 mL)
  const xTicks = [0, 10, 20, 25, 30, 40, 50].filter((v) => v <= volumeMaks);
  // Garis-garis sumbu Y (setiap 2 unit pH + pH 7)
  const yTicks = [0, 2, 4, 6, 7, 8, 10, 12, 14];

  return (
    <div className="titration-chart-card">
      <div className="chart-header-row">
        <div>
          <h4 className="chart-title">Kurva Titrasi pH vs Volume Titran</h4>
          <p className="chart-desc">
            Grafik teoretis kontinu hasil persamaan kesetimbangan muatan (bisection) dengan penanda posisi simulasi real-time.
          </p>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-line kurva-line" />
            <span>Kurva Teoretis</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot te-dot" />
            <span>Titik Ekuivalen (TE)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot current-dot" />
            <span>Posisi Terkini</span>
          </div>
          {indikator && (
            <div className="legend-item">
              <span className="legend-band" style={{ backgroundColor: indikator.warnaBasa }} />
              <span>Trayek {indikator.nama}</span>
            </div>
          )}
        </div>
      </div>

      <div className="chart-svg-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="chart-svg"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            {/* Gradien garis kurva */}
            <linearGradient id="gradienKurva" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Filter glow titik terkini */}
            <filter id="glowTitik" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Latar Belakang Area Plot */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="#FAFAFE"
            stroke="#E8D9F5"
            strokeWidth="1"
            rx="4"
          />

          {/* 2. Pita Trayek Indikator (Horizontal Band) */}
          {indikator && (
            <g className="indicator-range-band">
              <rect
                x={padding.left}
                y={Math.min(yIndikatorAtas, yIndikatorBawah)}
                width={plotWidth}
                height={tinggiPitaIndikator}
                fill={indikator.warnaBasa}
                opacity="0.18"
              />
              <line
                x1={padding.left}
                y1={yIndikatorAtas}
                x2={padding.left + plotWidth}
                y2={yIndikatorAtas}
                stroke={indikator.warnaBasa}
                strokeDasharray="4 3"
                strokeWidth="1"
                opacity="0.8"
              />
              <line
                x1={padding.left}
                y1={yIndikatorBawah}
                x2={padding.left + plotWidth}
                y2={yIndikatorBawah}
                stroke={indikator.warnaAsam}
                strokeDasharray="4 3"
                strokeWidth="1"
                opacity="0.8"
              />
              <text
                x={padding.left + plotWidth - 6}
                y={Math.min(yIndikatorAtas, yIndikatorBawah) + 11}
                fill="#4C1D95"
                fontSize="8"
                fontWeight="600"
                fontFamily="var(--font-mono, monospace)"
                textAnchor="end"
              >
                Trayek {indikator.nama} ({indikator.trayekBawah}–{indikator.trayekAtas})
              </text>
            </g>
          )}

          {/* 3. Garis Grid Sumbu Y & Label Angka */}
          {yTicks.map((val) => {
            const y = getY(val);
            const isNeutral = val === 7;
            return (
              <g key={`y-grid-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke={isNeutral ? '#10B981' : '#E8D9F5'}
                  strokeDasharray={isNeutral ? '4 3' : undefined}
                  strokeWidth={isNeutral ? 1.2 : 0.8}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  fill={isNeutral ? '#059669' : '#665A73'}
                  fontSize="9.5"
                  fontFamily="var(--font-mono, monospace)"
                  fontWeight={isNeutral ? '700' : '500'}
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* 4. Garis Grid Sumbu X & Label Angka */}
          {xTicks.map((val) => {
            const x = getX(val);
            return (
              <g key={`x-grid-${val}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + plotHeight}
                  stroke="#E8D9F5"
                  strokeWidth="0.8"
                />
                <text
                  x={x}
                  y={padding.top + plotHeight + 16}
                  fill="#665A73"
                  fontSize="9.5"
                  fontFamily="var(--font-mono, monospace)"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* 5. Garis Penanda Titik Ekuivalen (Ve) */}
          {volumeEkuivalen > 0 && volumeEkuivalen <= volumeMaks && (
            <g className="te-marker-group">
              {/* Garis vertikal Ve */}
              <line
                x1={xTE}
                y1={padding.top}
                x2={xTE}
                y2={padding.top + plotHeight}
                stroke="#10B981"
                strokeDasharray="5 3"
                strokeWidth="1.2"
                opacity="0.9"
              />
              {/* Garis horizontal pHE */}
              <line
                x1={padding.left}
                y1={yTE}
                x2={xTE}
                y2={yTE}
                stroke="#10B981"
                strokeDasharray="3 3"
                strokeWidth="0.9"
                opacity="0.8"
              />
              {/* Titik TE */}
              <circle cx={xTE} cy={yTE} r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
              {/* Lencana TE */}
              <rect
                x={xTE + 6}
                y={Math.max(padding.top + 2, yTE - 18)}
                width="84"
                height="16"
                rx="3"
                fill="#DCFCE7"
                stroke="#10B981"
                strokeWidth="0.8"
              />
              <text
                x={xTE + 10}
                y={Math.max(padding.top + 13, yTE - 7)}
                fill="#166534"
                fontSize="8"
                fontFamily="var(--font-mono, monospace)"
                fontWeight="700"
              >
                TE: {volumeEkuivalen.toFixed(1)} mL | pH {phEkuivalen.toFixed(1)}
              </text>
            </g>
          )}

          {/* 6. Garis Kurva Titrasi Teoretis Utama */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#gradienKurva)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 7. Penanda Posisi Aktual Simulasi */}
          <g className="current-marker-group">
            {/* Garis vertikal proyeksi posisi saat ini */}
            <line
              x1={xAktual}
              y1={yAktual}
              x2={xAktual}
              y2={padding.top + plotHeight}
              stroke="#7137B8"
              strokeDasharray="3 3"
              strokeWidth="1.2"
              opacity="0.7"
            />
            {/* Lingkaran pulsa di belakang titik */}
            <circle
              cx={xAktual}
              cy={yAktual}
              r="9"
              fill="rgba(113, 55, 184, 0.2)"
              className="pulse-circle"
            />
            {/* Titik penanda utama */}
            <circle
              cx={xAktual}
              cy={yAktual}
              r="5.5"
              fill="#7137B8"
              stroke="#FFFFFF"
              strokeWidth="2"
              filter="url(#glowTitik)"
            />
            {/* Tooltip Mengambang Posisi Terkini */}
            <g transform={`translate(${Math.min(plotWidth - 50, Math.max(padding.left + 50, xAktual))}, ${Math.max(padding.top + 20, yAktual - 14)})`}>
              <rect
                x="-48"
                y="-18"
                width="96"
                height="18"
                rx="4"
                fill="#FFFFFF"
                stroke="#7137B8"
                strokeWidth="1.2"
                filter="drop-shadow(0 2px 6px rgba(113, 55, 184, 0.2))"
              />
              <text
                x="0"
                y="-6"
                fill="#302044"
                fontSize="8.5"
                fontFamily="var(--font-mono, monospace)"
                fontWeight="700"
                textAnchor="middle"
              >
                {volumeTitranAktual.toFixed(2).replace('.', ',')} mL · pH {phAktual.toFixed(2).replace('.', ',')}
              </text>
            </g>
          </g>

          {/* Label Sumbu X & Y */}
          <text
            x={padding.left + plotWidth / 2}
            y={svgHeight - 10}
            fill="#302044"
            fontSize="10.5"
            fontWeight="700"
            textAnchor="middle"
          >
            Volume Titran NaOH (mL)
          </text>
          <text
            x={-(padding.top + plotHeight / 2)}
            y={15}
            transform="rotate(-90)"
            fill="#302044"
            fontSize="10.5"
            fontWeight="700"
            textAnchor="middle"
          >
            pH Larutan
          </text>
        </svg>
      </div>
    </div>
  );
};

export default TitrationChart;

