import type { Halaman } from '../App';

interface QuizPageProps {
  onNavigate: (halaman: Halaman) => void;
}

const QuizPage = ({ onNavigate }: QuizPageProps) => {
  return (
    <div style={{ maxWidth: '980px', margin: '1.5rem auto', padding: '0 1.5rem' }}>
      <button type="button" onClick={() => onNavigate('beranda')}>
        ← Kembali ke Beranda
      </button>
      <h1>Kuis</h1>
      <p>Halaman kuis sedang disiapkan.</p>
    </div>
  );
};

export default QuizPage;
