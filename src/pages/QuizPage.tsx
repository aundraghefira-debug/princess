import { useMemo, useState } from 'react';
import { modules, kuisPerModul } from '../data/chemData';
import { type ChemiVerseState } from '../types';
import QuizSection from '../components/QuizSection';
import { buildActivityKey, getDraft, getRecordsByActivity } from '../lib/localStore';
import './QuizPage.css';

interface QuizPageProps {
  initialModuleId?: string | null;
  onBackToHome: () => void;
  userState?: ChemiVerseState;
  onUpdateUserState?: (newState: ChemiVerseState) => void;
}

function normalizeModulId(id: string): 'modul_1' | 'modul_2' | 'modul_3' | null {
  const m = id.replace('-', '_');
  if (m === 'modul_1' || m === 'modul_2' || m === 'modul_3') return m;
  return null;
}

export function QuizPage({ initialModuleId, onBackToHome, userState, onUpdateUserState }: QuizPageProps) {
  const [selected, setSelected] = useState<string | null>(() => (initialModuleId ? normalizeModulId(initialModuleId) : null));

  const items = useMemo(() => {
    return modules.map((mod, idx) => {
      const key = `modul_${idx + 1}` as 'modul_1' | 'modul_2' | 'modul_3';
      const kuis = kuisPerModul[key];
      const moduleIdHyphen = `modul-${idx + 1}`;
      let status = 'Belum ada data kuis';
      let lastScore: number | null = null;
      let hasDraft = false;
      if (kuis) {
        const activityKey = buildActivityKey(moduleIdHyphen, kuis.activityId, kuis.questionVersion);
        const draftRes = getDraft(activityKey);
        hasDraft = draftRes.status === 'berhasil' && !!draftRes.data;
        const recRes = getRecordsByActivity(activityKey);
        if (recRes.status === 'berhasil' && recRes.data.length > 0) {
          lastScore = recRes.data[0].score;
        }
        status = hasDraft ? 'Ada draf belum dikirim' : lastScore != null ? `Skor terakhir: ${lastScore}` : 'Siap dikerjakan';
      }
      return { key, title: mod.judul, kuis, status, lastScore, hasDraft };
    });
  }, []);

  return (
    <div className="quiz-page">
      <div className="quiz-page-inner">
        <button type="button" className="btn-back-home" onClick={onBackToHome}>
          ← Kembali ke Beranda
        </button>

        <header className="quiz-page-header">
          <div className="section-title-badge" style={{ marginBottom: '0.75rem' }}>
            <span>Evaluasi</span>
          </div>
          <h1 className="quiz-page-title">Kuis</h1>
          <p className="quiz-page-desc">
            Pilih kuis evaluasi per modul. Materi modul tetap bisa dibaca terpisah; saat mengerjakan evaluasi, layar kuis akan fokus penuh.
          </p>
        </header>

        {!selected ? (
          <div className="quiz-select-grid" role="list">
            {items.map((it) => (
              <article key={it.key} className="quiz-select-card" role="listitem">
                <div className="quiz-select-top">
                  <span className="quiz-select-pill">{it.key.replace('_', ' ').toUpperCase()}</span>
                  {it.lastScore != null && <span className="quiz-score-chip">Skor {it.lastScore}</span>}
                </div>
                <h2 className="quiz-select-title">{it.title}</h2>
                <p className="quiz-select-status">{it.status}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 'auto' }}
                  disabled={!it.kuis?.soal?.length}
                  onClick={() => setSelected(it.key)}
                >
                  {it.hasDraft ? 'Lanjutkan Kuis' : 'Mulai Kuis'}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="quiz-active-wrap">
            <button type="button" className="btn-back-home" onClick={() => setSelected(null)} style={{ marginBottom: '1rem' }}>
              ← Pilih kuis lain
            </button>
            <QuizSection
              moduleId={selected}
              onModuleCompleted={(modId) => {
                if (userState && onUpdateUserState) {
                  const current = userState.completed_modules;
                  if (!current.includes(modId) && !current.includes(modId.replace('-', '_'))) {
                    onUpdateUserState({ ...userState, completed_modules: [...current, modId] });
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
