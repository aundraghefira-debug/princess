// src/components/QuizGabungan.tsx
// Kuis gabungan Modul 1-3, Mode Evaluasi (kind: "diagnostic")
// Skor per modul dihitung dari jawaban; ambang tuntas 60.

import { useEffect, useRef, useState } from 'react';
import { kuisPerModul } from '../data/chemData';
import type { SoalKuis } from '../data/chemData';
import {
  buildActivityKey,
  calculateScore,
  deleteDraft,
  generateSessionId,
  getDraft,
  getRecordsByActivity,
  saveDraft,
  saveRecord,
} from '../lib/localStore';
import type { Draft, QuizRecord } from '../lib/localStore';
import './QuizGabungan.css';

const MODUL_IDS = ['modul_1', 'modul_2', 'modul_3'] as const;
const MODUL_LABEL: Record<string, string> = {
  modul_1: 'Modul 1',
  modul_2: 'Modul 2',
  modul_3: 'Modul 3',
};
const BATAS_TUNTAS = 60;

type SoalGabungan = SoalKuis & { modulId: (typeof MODUL_IDS)[number] };

const MODULE_ID = 'gabungan';
const ACTIVITY_ID = 'kuis-gabungan';
const QUESTION_VERSION = 'v1';
const ACTIVITY_KEY = buildActivityKey(MODULE_ID, ACTIVITY_ID, QUESTION_VERSION);

const SOAL_LIST: SoalGabungan[] = MODUL_IDS.flatMap((id) =>
  kuisPerModul[id].soal.map((s) => ({ ...s, modulId: id }))
);

function skorPerModul(answers: Record<string, string>) {
  return MODUL_IDS.map((id) => {
    const soalModul = SOAL_LIST.filter((s) => s.modulId === id);
    const benar = soalModul.filter((s) => answers[s.id] === s.jawabanBenar).length;
    return {
      modulId: id,
      benar,
      total: soalModul.length,
      skor: calculateScore(benar, soalModul.length),
    };
  });
}

interface QuizGabunganProps {
  onSelesai?: () => void;
}

type Fase = 'mulai' | 'mengerjakan' | 'hasil';
type StatusSimpan = 'belum' | 'tersimpan' | 'gagal' | 'rusak';

export function QuizGabungan({ onSelesai }: QuizGabunganProps) {
  const [fase, setFase] = useState<Fase>('mulai');
  const [draf, setDraf] = useState<Draft | null>(null);
  const [nomorAktif, setNomorAktif] = useState(0);
  const [statusDraf, setStatusDraf] = useState<StatusSimpan>('belum');
  const [penyimpananRusak, setPenyimpananRusak] = useState(false);
  const [hasilTerakhir, setHasilTerakhir] = useState<QuizRecord | null>(null);
  const [hasil, setHasil] = useState<QuizRecord | null>(null);
  const [hasilTersimpan, setHasilTersimpan] = useState<StatusSimpan>('belum');
  const [tampilBelumDijawab, setTampilBelumDijawab] = useState(false);
  const [konfirmasiKeluar, setKonfirmasiKeluar] = useState(false);

  const judulRef = useRef<HTMLHeadingElement>(null);

  // Baca draf dan hasil terakhir saat dibuka (termasuk setelah refresh)
  useEffect(() => {
    const bacaDraf = getDraft(ACTIVITY_KEY);
    if (bacaDraf.status === 'rusak') {
      setPenyimpananRusak(true);
      return;
    }
    setDraf(bacaDraf.data);
    const bacaHasil = getRecordsByActivity(ACTIVITY_KEY);
    if (bacaHasil.status === 'rusak') {
      setPenyimpananRusak(true);
      return;
    }
    const diagnostik = bacaHasil.data.filter((r) => r.kind === 'diagnostic');
    setHasilTerakhir(diagnostik[0] ?? null);
  }, []);

  // Saat mengerjakan: kunci scroll belakang dan fokus ke judul
  useEffect(() => {
    if (fase !== 'mengerjakan') return;
    const overflowLama = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    judulRef.current?.focus();
    return () => {
      document.body.style.overflow = overflowLama;
    };
  }, [fase]);

  const soalList = SOAL_LIST;
  const jawaban = draf?.answers ?? {};
  const jumlahTerjawab = soalList.filter((s) => jawaban[s.id]).length;
  const nomorBelumDijawab = soalList
    .map((s, i) => (jawaban[s.id] ? null : i + 1))
    .filter((n): n is number => n !== null);

  function simpanDraf(drafBaru: Draft) {
    const r = saveDraft(ACTIVITY_KEY, drafBaru);
    if (r.success) setStatusDraf('tersimpan');
    else setStatusDraf(r.status === 'rusak' ? 'rusak' : 'gagal');
  }

  function mulaiEvaluasi() {
    setKonfirmasiKeluar(false);
    setTampilBelumDijawab(false);
    setHasil(null);
    setHasilTersimpan('belum');
    setNomorAktif(0);

    if (draf) {
      setFase('mengerjakan');
      return;
    }

    const sekarang = new Date().toISOString();
    const drafBaru: Draft = {
      id: generateSessionId(),
      moduleId: MODULE_ID,
      activityId: ACTIVITY_ID,
      questionVersion: QUESTION_VERSION,
      kind: 'diagnostic',
      answers: {},
      startedAt: sekarang,
      updatedAt: sekarang,
    };
    setDraf(drafBaru);
    simpanDraf(drafBaru);
    setFase('mengerjakan');
  }

  function pilihJawaban(soalId: string, opsiId: string) {
    if (!draf) return;
    const drafBaru: Draft = {
      ...draf,
      answers: { ...draf.answers, [soalId]: opsiId },
      updatedAt: new Date().toISOString(),
    };
    setDraf(drafBaru);
    simpanDraf(drafBaru);
  }

  function simpanHasil(record: QuizRecord) {
    const r = saveRecord(record);
    if (!r.success) {
      setHasilTersimpan(r.status === 'rusak' ? 'rusak' : 'gagal');
      return;
    }
    setHasilTersimpan('tersimpan');
    setHasilTerakhir(record);
    deleteDraft(ACTIVITY_KEY);
    onSelesai?.();
  }

  function kirimJawaban() {
    if (!draf) return;
    if (nomorBelumDijawab.length > 0) {
      setTampilBelumDijawab(true);
      return;
    }
    const jumlahBenar = soalList.filter((s) => draf.answers[s.id] === s.jawabanBenar).length;
    const record: QuizRecord = {
      id: draf.id,
      ownerId: 'guest',
      alias: '',
      moduleId: MODULE_ID,
      activityId: ACTIVITY_ID,
      questionVersion: QUESTION_VERSION,
      kind: 'diagnostic',
      answers: { ...draf.answers },
      correctCount: jumlahBenar,
      totalQuestions: soalList.length,
      score: calculateScore(jumlahBenar, soalList.length),
      startedAt: draf.startedAt,
      completedAt: new Date().toISOString(),
      status: 'local',
    };
    setHasil(record);
    setDraf(null);
    setFase('hasil');
    simpanHasil(record);
  }

  function keluarEvaluasi() {
    setKonfirmasiKeluar(false);
    setFase('mulai');
  }

  function ulangiEvaluasi() {
    setDraf(null);
    setHasil(null);
    setHasilTersimpan('belum');
    setFase('mulai');
  }

  // --- Data penyimpanan rusak ---
  if (penyimpananRusak) {
    return (
      <section className="qz-section" aria-labelledby="qz-judul">
        <h2 id="qz-judul" className="qz-heading">Evaluasi Modul 1–3</h2>
        <div className="qz-alert qz-alert-error" role="alert">
          Data kuis yang tersimpan di perangkat ini rusak, sehingga jawaban belum bisa
          disimpan. Materi tetap bisa kamu baca.
        </div>
      </section>
    );
  }

  // --- Sebelum mulai ---
  if (fase === 'mulai') {
    return (
      <section className="qz-section" aria-labelledby="qz-judul">
        <h2 id="qz-judul" className="qz-heading">Evaluasi Modul 1–3</h2>
        <div className="qz-card">
          <span className="qz-mode-pill">Mode Evaluasi</span>
          <ul className="qz-rules">
            <li>Ada {soalList.length} soal pilihan ganda dari Modul 1, 2, dan 3.</li>
            <li>Selama mengerjakan, materi tidak bisa dibuka.</li>
            <li>Jawaban bisa dikirim setelah semua soal terisi.</li>
            <li>Skor per modul dan pembahasan muncul setelah jawaban dikirim.</li>
            <li>Modul dinyatakan tuntas jika skornya minimal {BATAS_TUNTAS}.</li>
            <li>Jawabanmu tersimpan otomatis di perangkat ini.</li>
          </ul>

          {draf && (
            <p className="qz-alert qz-alert-info">
              Kamu punya pengerjaan yang belum dikirim ({jumlahTerjawab} dari{' '}
              {soalList.length} soal terjawab).
            </p>
          )}

          <p className="qz-last-score">
            {hasilTerakhir
              ? `Skor evaluasi terakhir: ${hasilTerakhir.score}`
              : 'Belum ada hasil evaluasi.'}
          </p>

          <button type="button" className="qz-btn qz-btn-primary" onClick={mulaiEvaluasi}>
            {draf ? 'Lanjutkan Evaluasi' : 'Mulai Evaluasi'}
          </button>
        </div>
      </section>
    );
  }

  // --- Hasil dan pembahasan ---
  if (fase === 'hasil' && hasil) {
    const ringkasan = skorPerModul(hasil.answers);
    return (
      <section className="qz-section" aria-labelledby="qz-judul">
        <h2 id="qz-judul" className="qz-heading">Hasil Evaluasi</h2>

        {hasilTersimpan === 'tersimpan' && (
          <p className="qz-alert qz-alert-success" role="status">
            Hasil tersimpan pada perangkat.
          </p>
        )}
        {(hasilTersimpan === 'gagal' || hasilTersimpan === 'rusak') && (
          <div className="qz-alert qz-alert-error" role="alert">
            <span>Hasil belum tersimpan pada perangkat.</span>
            <button type="button" className="qz-btn qz-btn-small" onClick={() => simpanHasil(hasil)}>
              Coba simpan lagi
            </button>
          </div>
        )}

        <div className="qz-score">
          <div>
            <span className="qz-mode-pill">Mode Evaluasi · Jawaban dibekukan</span>
            <p className="qz-score-text">
              Benar {hasil.correctCount} dari {hasil.totalQuestions} soal
            </p>
          </div>
          <div className="qz-score-circle" aria-label={`Skor ${hasil.score}`}>
            <span className="qz-score-number">{hasil.score}</span>
            <span className="qz-score-label">Skor</span>
          </div>
        </div>

        <h3>Skor per modul</h3>
        <ul className="qz-rules">
          {ringkasan.map((m) => (
            <li key={m.modulId}>
              <strong>{MODUL_LABEL[m.modulId]}:</strong> {m.benar} dari {m.total} benar
              (skor {m.skor}) —{' '}
              {m.skor >= BATAS_TUNTAS ? 'Tuntas' : 'Belum tuntas, pelajari ulang materinya'}
            </li>
          ))}
        </ul>

        <ol className="qz-review-list">
          {soalList.map((soal, i) => {
            const pilihan = hasil.answers[soal.id];
            const benar = pilihan === soal.jawabanBenar;
            return (
              <li key={soal.id} className={`qz-review ${benar ? 'is-benar' : 'is-salah'}`}>
                <div className="qz-review-head">
                  <span>
                    Soal {i + 1} · {MODUL_LABEL[soal.modulId]}
                  </span>
                  <span className={`qz-tag ${benar ? 'qz-tag-benar' : 'qz-tag-salah'}`}>
                    {benar ? 'Benar' : 'Salah'}
                  </span>
                </div>
                <p className="qz-question">{soal.pertanyaan}</p>
                <ul className="qz-review-options">
                  {soal.opsi.map((opsi) => {
                    const kunci = opsi.id === soal.jawabanBenar;
                    const dipilih = opsi.id === pilihan;
                    let kelas = 'qz-review-option';
                    if (kunci) kelas += ' is-kunci';
                    else if (dipilih) kelas += ' is-pilihan-salah';
                    return (
                      <li key={opsi.id} className={kelas}>
                        <span className="qz-key">{opsi.id}</span>
                        <span className="qz-option-text">{opsi.teks}</span>
                        {dipilih && <span className="qz-note">Jawabanmu</span>}
                        {kunci && <span className="qz-note">Kunci</span>}
                      </li>
                    );
                  })}
                </ul>
                <div className="qz-explain">
                  <strong>Pembahasan:</strong> {soal.pembahasan}
                </div>
                {!benar && soal.miskonsepsi && (
                  <div className="qz-misconception">
                    <strong>Kemungkinan keliru:</strong> {soal.miskonsepsi}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="qz-actions">
          <button type="button" className="qz-btn qz-btn-primary" onClick={ulangiEvaluasi}>
            Ulangi Evaluasi
          </button>
        </div>
      </section>
    );
  }

  // --- Sedang mengerjakan ---
  const soal = soalList[nomorAktif];

  return (
    <div className="qz-overlay" role="dialog" aria-modal="true" aria-labelledby="qz-judul-aktif">
      <div className="qz-overlay-inner">
        <header className="qz-active-head">
          <div className="qz-active-info">
            <span className="qz-mode-pill">Mode Evaluasi</span>
            <h2 id="qz-judul-aktif" className="qz-counter" tabIndex={-1} ref={judulRef}>
              Soal {nomorAktif + 1} dari {soalList.length}
            </h2>
          </div>
          <div className="qz-active-tools">
            <span className={`qz-save qz-save-${statusDraf}`} role="status" aria-live="polite">
              {statusDraf === 'tersimpan' && 'Draf tersimpan'}
              {statusDraf === 'gagal' && 'Draf belum tersimpan'}
              {statusDraf === 'rusak' && 'Penyimpanan rusak, draf tidak disimpan'}
            </span>
            {!konfirmasiKeluar && (
              <button
                type="button"
                className="qz-btn qz-btn-exit"
                onClick={() => setKonfirmasiKeluar(true)}
              >
                Keluar
              </button>
            )}
          </div>
        </header>

        {konfirmasiKeluar && (
          <div className="qz-alert qz-alert-info" role="alert">
            <span>Keluar dari evaluasi? Jawaban yang sudah dipilih tetap tersimpan sebagai draf.</span>
            <div className="qz-inline-actions">
              <button type="button" className="qz-btn qz-btn-small" onClick={keluarEvaluasi}>
                Ya, keluar
              </button>
              <button
                type="button"
                className="qz-btn qz-btn-small qz-btn-ghost"
                onClick={() => setKonfirmasiKeluar(false)}
              >
                Batal
              </button>
            </div>
          </div>
        )}

        <nav className="qz-stepper" aria-label="Pilih nomor soal">
          {soalList.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`qz-step${i === nomorAktif ? ' is-aktif' : ''}${jawaban[s.id] ? ' is-terjawab' : ''}`}
              onClick={() => setNomorAktif(i)}
              aria-current={i === nomorAktif ? 'step' : undefined}
              aria-label={`Soal ${i + 1}${jawaban[s.id] ? ', sudah dijawab' : ', belum dijawab'}`}
            >
              {i + 1}
            </button>
          ))}
        </nav>

        <fieldset className="qz-card qz-fieldset">
          <legend className="qz-question">{soal.pertanyaan}</legend>
          <div className="qz-options">
            {soal.opsi.map((opsi) => {
              const dipilih = jawaban[soal.id] === opsi.id;
              return (
                <label key={opsi.id} className={`qz-option${dipilih ? ' is-dipilih' : ''}`}>
                  <input
                    type="radio"
                    name={`soal-${soal.id}`}
                    value={opsi.id}
                    checked={dipilih}
                    onChange={() => pilihJawaban(soal.id, opsi.id)}
                  />
                  <span className="qz-key">{opsi.id}</span>
                  <span className="qz-option-text">{opsi.teks}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="qz-nav">
          <button
            type="button"
            className="qz-btn qz-btn-ghost"
            onClick={() => setNomorAktif((n) => n - 1)}
            disabled={nomorAktif === 0}
          >
            ← Sebelumnya
          </button>
          <button
            type="button"
            className="qz-btn qz-btn-ghost"
            onClick={() => setNomorAktif((n) => n + 1)}
            disabled={nomorAktif === soalList.length - 1}
          >
            Berikutnya →
          </button>
        </div>

        <div className="qz-submit">
          {tampilBelumDijawab && nomorBelumDijawab.length > 0 && (
            <p className="qz-alert qz-alert-warning" role="alert">
              Soal nomor {nomorBelumDijawab.join(', ')} belum dijawab.
            </p>
          )}
          <p className="qz-progress">
            {jumlahTerjawab} dari {soalList.length} soal terjawab
          </p>
          <button
            type="button"
            className="qz-btn qz-btn-submit"
            onClick={kirimJawaban}
            aria-disabled={nomorBelumDijawab.length > 0}
          >
            Kirim Jawaban
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizGabungan;