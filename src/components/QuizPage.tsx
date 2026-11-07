import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Halaman } from '../App';
import QuizGabungan from './QuizGabungan';
import QuizBelajar from './QuizBelajar';

export type ModeKuis = 'evaluasi' | 'belajar' | null;

interface QuizPageProps {
  onNavigate: (halaman: Halaman) => void;
  /** Dari Mode Belajar: buka modul lalu gulir ke sub-materi terkait */
  onBukaMateri?: (modulId: 'modul_1' | 'modul_2' | 'modul_3', subMateriId: string) => void;
  /** Mode yang langsung dibuka, misalnya saat kembali dari materi */
  modeAwal?: ModeKuis;
}

const tombolGaya: CSSProperties = {
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  border: '1px solid #67e8f9',
  background: 'transparent',
  color: '#e2e8f0',
  cursor: 'pointer',
  font: 'inherit',
};

const QuizPage = ({ onNavigate, onBukaMateri, modeAwal = null }: QuizPageProps) => {
  const [mode, setMode] = useState<ModeKuis>(modeAwal);

  return (
    <div style={{ maxWidth: '980px', margin: '1.5rem auto', padding: '0 1.5rem' }}>
      <button type="button" style={tombolGaya} onClick={() => onNavigate('beranda')}>
        ← Kembali ke Beranda
      </button>

      <h1>Kuis Modul 1–3</h1>

      {mode === null && (
        <>
          <p>Pilih mode kuis:</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" style={tombolGaya} onClick={() => setMode('evaluasi')}>
              Mode Evaluasi
            </button>
            <button type="button" style={tombolGaya} onClick={() => setMode('belajar')}>
              Mode Belajar
            </button>
          </div>
          <ul>
            <li>
              <strong>Evaluasi:</strong> 15 soal, materi tidak bisa dibuka, pembahasan muncul
              setelah semua dikirim.
            </li>
            <li>
              <strong>Belajar:</strong> periksa jawaban per soal, langsung ada pembahasan dan
              tautan ke sub-materi.
            </li>
          </ul>
        </>
      )}

      {mode === 'evaluasi' && (
        <>
          <button type="button" style={tombolGaya} onClick={() => setMode(null)}>
            ← Ganti mode
          </button>
          <QuizGabungan />
        </>
      )}

      {mode === 'belajar' && (
        <>
          <button type="button" style={tombolGaya} onClick={() => setMode(null)}>
            ← Ganti mode
          </button>
          <QuizBelajar onBukaMateri={onBukaMateri} />
        </>
      )}
    </div>
  );
};

export default QuizPage;