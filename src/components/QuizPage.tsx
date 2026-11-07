import { useState } from 'react';
import type { Halaman } from '../App';
import QuizGabungan from './QuizGabungan';
   import QuizBelajar from './QuizBelajar';

interface QuizPageProps {
  onNavigate: (halaman: Halaman) => void;
}

type ModeKuis = 'evaluasi' | 'belajar' | null;
const tombolGaya: React.CSSProperties = {
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  border: '1px solid #67e8f9',
  background: 'transparent',
  color: '#e2e8f0',
  cursor: 'pointer',
  font: 'inherit',
};

const QuizPage = ({ onNavigate }: QuizPageProps) => {
  const [mode, setMode] = useState<ModeKuis>(null);

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
            <li><strong>Evaluasi:</strong> 15 soal, materi tidak bisa dibuka, pembahasan muncul setelah semua dikirim.</li>
            <li><strong>Belajar:</strong> setelah dikirim, pembahasan menautkan ke sub materi.</li>
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
             <QuizBelajar />
        </>
      )}
    </div>
  );
};

export default QuizPage;