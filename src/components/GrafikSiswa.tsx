// Grafik kemajuan satu siswa: skor tiap percobaan Evaluasi, urut waktu.
import type { FC } from 'react';
import type { AttemptRecord } from '../lib/firebaseService';

const W = 560;
const H = 230;
const KIRI = 44;
const KANAN = 20;
const ATAS = 20;
const DASAR = 190;
const TINGGI = DASAR - ATAS;

export const GrafikSiswa: FC<{ attempts: AttemptRecord[] }> = ({ attempts }) => {
  const data = attempts
    .filter((a) => a.kind === 'diagnostic')
    .sort((a, b) => (a.completedAt || '').localeCompare(b.completedAt || ''));

  const yDari = (skor: number) => DASAR - (skor / 100) * TINGGI;
  const xDari = (i: number) =>
    data.length === 1
      ? (KIRI + W - KANAN) / 2
      : KIRI + (i * (W - KIRI - KANAN)) / (data.length - 1);

  const garis = data.map((d, i) => `${xDari(i)},${yDari(d.score)}`).join(' ');

  return (
    <section style={{ margin: '0 0 1.25rem' }} aria-label="Grafik kemajuan siswa">
      <h3 style={{ margin: '0 0 0.25rem', color: '#3b2a57', fontSize: '1rem' }}>
        Grafik Kemajuan Siswa (Mode Evaluasi)
      </h3>
      <p style={{ margin: '0 0 0.5rem', color: '#6b5b86', fontSize: '0.85rem' }}>
        Setiap titik adalah satu percobaan, urut dari yang paling awal.
      </p>

      {data.length === 0 ? (
        <p style={{ color: '#6b5b86' }}>Siswa ini belum punya percobaan Evaluasi.</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img"
          aria-label={`Grafik skor ${data.length} percobaan Evaluasi`}>
          {[0, 20, 40, 60, 80, 100].map((v) => (
            <g key={v}>
              <line x1={KIRI} x2={W - KANAN} y1={yDari(v)} y2={yDari(v)}
                stroke={v === 60 ? '#7c3aed' : '#e4d9f5'}
                strokeWidth={v === 60 ? 2 : 1}
                strokeDasharray={v === 60 ? '6 4' : undefined} />
              <text x={KIRI - 8} y={yDari(v) + 4} fontSize="11" textAnchor="end"
                fill={v === 60 ? '#7c3aed' : '#8b7ca6'}>{v}</text>
            </g>
          ))}
          <text x={W - KANAN} y={yDari(60) - 6} fontSize="10" textAnchor="end"
            fill="#7c3aed" fontWeight="700">Batas Tuntas (60)</text>

          {data.length > 1 && (
            <polyline points={garis} fill="none" stroke="#7c3aed" strokeWidth="3"
              strokeLinejoin="round" strokeLinecap="round" />
          )}

          {data.map((d, i) => (
            <g key={d.id}>
              <circle cx={xDari(i)} cy={yDari(d.score)} r="6"
                fill={d.score >= 60 ? '#10b981' : '#f59e0b'} stroke="#ffffff" strokeWidth="2" />
              <text x={xDari(i)} y={yDari(d.score) - 12} fontSize="12" fontWeight="800"
                textAnchor="middle" fill="#3b2a57">{d.score}</text>
              <text x={xDari(i)} y={DASAR + 18} fontSize="11" textAnchor="middle"
                fill="#6b5b86">Ke-{i + 1}</text>
            </g>
          ))}
          <line x1={KIRI} x2={W - KANAN} y1={DASAR} y2={DASAR} stroke="#c4b5fd" strokeWidth="2" />
        </svg>
      )}
    </section>
  );
};

export default GrafikSiswa;