// src/components/QuizBelajar.tsx
// Kuis gabungan Modul 1-3, Mode Belajar (kind: "practice")
// Umpan balik langsung per soal + tautan ke sub-materi. Materi boleh dibuka.
// Draf dan riwayat terpisah dari Mode Evaluasi (activityId: kuis-belajar).

import { useEffect, useState } from 'react';
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
type ModulKuisId = (typeof MODUL_IDS)[number];

const MODUL_LABEL: Record<ModulKuisId, string> = {
  modul_1: 'Modul 1',
  modul_2: 'Modul 2',
  modul_3: 'Modul 3',
};

type SoalGabungan = SoalKuis & { modulId: ModulKuisId };

const MODULE_ID = 'gabungan';
const ACTIVITY_ID = 'kuis-belajar';
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

interface QuizBelajarProps {
  /** Membuka halaman modul dan menggulir ke sub-materi terkait */
  onBukaMateri?: (modulId: ModulKuisId, subMateriId: string) => void;
}

type Fase = 'mulai' | 'mengerjakan' | 'hasil';
type StatusSimpan = 'belum' | 'tersimpan' | 'gagal' | 'rusak';

export function QuizBelajar({ onBukaMateri }: QuizBelajarProps) {
  const [fase, setFase] = useState<Fase>('mulai');
  const [draf, setDraf] = useState<Draft | null>(null);
  const [nomorAktif, setNomorAktif] = useState(0);
  // Pilihan yang sedang ditandai siswa, sebelum tombol "Periksa jawaban" ditekan
  const [pilihanSementara, setPilihanSementara] = useState<Record<string, string>>({});
  const [peringatanPilih, setPeringatanPilih] = useState(false);
  const [statusDraf, setStatusDraf] = useState<StatusSimpan>('belum');
  const [penyimpananRusak, setPenyimpananRusak] = useState(false);
  const [hasilTerakhir, setHasilTerakhir] = useState<QuizRecord | null>(null);
  const [hasil, setHasil] = useState<QuizRecord | null>(null);
  const [hasilTersimpan, setHasilTersimpan] = useState<StatusSimpan>('belum');

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
    const latihan = bacaHasil.data.filter((r) => r.kind === 'practice');
    setHasilTerakhir(latihan[0] ?? null);
  }, []);

  const soalList = SOAL_LIST;
  const jawabanDiperiksa = draf?.answers ?? {};
  const jumlahDiperiksa = soalList.filter((s) => jawabanDiperiksa[s.id]).length;
  const jumlahBenarSementara = soalList.filter(
    (s) => jawabanDiperiksa[s.id] === s.jawabanBenar
  ).length;
  const semuaDiperiksa = jumlahDiperiksa === soalList.length;

  function simpanDraf(drafBaru: Draft) {
    const r = saveDraft(ACTIVITY_KEY, drafBaru);
    if (r.success) setStatusDraf('tersimpan');
    else setStatusDraf(r.status === 'rusak' ? 'rusak' : 'gagal');
  }

  function mulaiLatihan() {
    setHasil(null);
    setHasilTersimpan('belum');
    setPeringatanPilih(false);

    if (draf) {
      // Lanjutkan draf: tampilkan lagi jawaban yang sudah diperiksa
      setPilihanSementara({ ...draf.answers });
      const belum = soalList.findIndex((s) => !draf.answers[s.id]);
      setNomorAktif(belum === -1 ? 0 : belum);
      setFase('mengerjakan');
      return;
    }

    const sekarang = new Date().toISOString();
    const drafBaru: Draft = {
      id: generateSessionId(),
      moduleId: MODULE_ID,
      activityId: ACTIVITY_ID,
      questionVersion: QUESTION_VERSION,
      kind: 'practice',
      answers: {},
      startedAt: sekarang,
      updatedAt: sekarang,
    };
    setDraf(drafBaru);
    setPilihanSementara({});
    setNomorAktif(0);
    simpanDraf(drafBaru);
    setFase('mengerjakan');
  }

  function tandaiPilihan(soalId: string, opsiId: string) {
    setPeringatanPilih(false);
    setPilihanSementara((p) => ({ ...p, [soalId]: opsiId }));
  }

  function periksaJawaban(soalId: string) {
    if (!draf) return;
    const pilihan = pilihanSementara[soalId];
    if (!pilihan) {
      setPeringatanPilih(true);
      return;
    }
    const drafBaru: Draft = {
      ...draf,
      answers: { ...draf.answers, [soalId]: pilihan },
      updatedAt: new Date().toISOString(),
    };
    setDraf(drafBaru);
    simpanDraf(drafBaru);
  }

  function pindahSoal(i: number) {
    setPeringatanPilih(false);
    setNomorAktif(i);
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
  }

  function selesaiLatihan() {
    if (!draf || !semuaDiperiksa) return;
    const record: QuizRecord = {
      id: draf.id,
      ownerId: 'guest',
      alias: '',
      moduleId: MODULE_ID,
      activityId: ACTIVITY_ID,
      questionVersion: QUESTION_VERSION,
      kind: 'practice',
      answers: { ...draf.answers },
      correctCount: jumlahBenarSementara,
      totalQuestions: soalList.length,
      score: calculateScore(jumlahBenarSementara, soalList.length),
      startedAt: draf.startedAt,
      completedAt: new Date().toISOString(),
      status: 'local',
    };
    setHasil(record);
    setDraf(null);
    setFase('hasil');
    simpanHasil(record);
  }

  function latihanLagi() {
    setDraf(null);
    setHasil(null);
    setPilihanSementara({});
    setHasilTersimpan('belum');
    setFase('mulai');
  }

  // --- Data penyimpanan rusak ---
  if (penyimpananRusak) {
    return (
      <section className="qz-section" aria-labelledby="qb-judul">
        <h2 id="qb-judul" className="qz-heading">Latihan Modul 1–3</h2>
        <div className="qz-alert qz-alert-error" role="alert">
          Data latihan yang tersimpan di perangkat ini rusak, sehingga jawaban belum bisa
          disimpan. Materi tetap bisa kamu baca.
        </div>
      </section>
    );
  }

  // --- Sebelum mulai ---
  if (fase === 'mulai') {
    return (
      <section className="qz-section" aria-labelledby="qb-judul">
        <h2 id="qb-judul" className="qz-heading">Latihan Modul 1–3</h2>
        <div className="qz-card">
          <span className="qz-mode-pill">Mode Belajar</span>
          <ul className="qz-rules">
            <li>Ada {soalList.length} soal pilihan ganda dari Modul 1, 2, dan 3.</li>
            <li>Pilih jawaban, lalu tekan “Periksa jawaban” untuk langsung melihat pembahasannya.</li>
            <li>Kalau salah, kamu bisa membaca lagi sub-materi terkait lalu mencoba lagi.</li>
            <li>Hasil latihan disimpan terpisah dari Mode Evaluasi.</li>
            <li>Jawabanmu tersimpan otomatis di perangkat ini.</li>
          </ul>

          {draf && (
            <p className="qz-alert qz-alert-info">
              Kamu punya latihan yang belum selesai ({jumlahDiperiksa} dari {soalList.length} soal
              sudah diperiksa).
            </p>
          )}

          <p className="qz-last-score">
            {hasilTerakhir
              ? `Skor latihan terakhir: ${hasilTerakhir.score}`
              : 'Belum ada hasil latihan.'}
          </p>

          <button type="button" className="qz-btn qz-btn-primary" onClick={mulaiLatihan}>
            {draf ? 'Lanjutkan Latihan' : 'Mulai Latihan'}
          </button>
        </div>
      </section>
    );
  }

  // --- Ringkasan hasil ---
  if (fase === 'hasil' && hasil) {
    const ringkasan = skorPerModul(hasil.answers);
    return (
      <section className="qz-section" aria-labelledby="qb-judul">
        <h2 id="qb-judul" className="qz-heading">Hasil Latihan</h2>

        {hasilTersimpan === 'tersimpan' && (
          <p className="qz-alert qz-alert-success" role="status">
            Hasil latihan tersimpan pada perangkat.
          </p>
        )}
        {(hasilTersimpan === 'gagal' || hasilTersimpan === 'rusak') && (
          <div className="qz-alert qz-alert-error" role="alert">
            <span>Hasil latihan belum tersimpan pada perangkat.</span>
            <button type="button" className="qz-btn qz-btn-small" onClick={() => simpanHasil(hasil)}>
              Coba simpan lagi
            </button>
          </div>
        )}

        <div className="qz-score">
          <div>
            <span className="qz-mode-pill">Mode Belajar</span>
            <p className="qz-score-text">
              Benar {hasil.correctCount} dari {hasil.totalQuestions} soal pada pemeriksaan terakhir
            </p>
          </div>
          <div className="qz-score-circle" aria-label={`Skor ${hasil.score}`}>
            <span className="qz-score-number">{hasil.score}</span>
            <span className="qz-score-label">Skor</span>
          </div>
        </div>

        <ul className="qz-rules">
          {ringkasan.map((m) => (
            <li key={m.modulId}>
              <strong>{MODUL_LABEL[m.modulId]}:</strong> {m.benar} dari {m.total} benar (skor{' '}
              {m.skor})
            </li>
          ))}
        </ul>

        <p className="qz-last-score">
          Skor latihan hanya untuk membantumu belajar. Untuk mengukur pemahaman, kerjakan Mode
          Evaluasi.
        </p>

        <div className="qz-actions">
          <button type="button" className="qz-btn qz-btn-primary" onClick={latihanLagi}>
            Latihan Lagi
          </button>
        </div>
      </section>
    );
  }

  // --- Sedang mengerjakan ---
  const soal = soalList[nomorAktif];
  const pilihan = pilihanSementara[soal.id];
  const jawabanTerperiksa = jawabanDiperiksa[soal.id];
  const tampilUmpanBalik = Boolean(jawabanTerperiksa) && pilihan === jawabanTerperiksa;
  const benar = jawabanTerperiksa === soal.jawabanBenar;

  return (
    <section className="qz-section" aria-labelledby="qb-judul-aktif">
      <header className="qz-active-head">
        <div className="qz-active-info">
          <span className="qz-mode-pill">Mode Belajar</span>
          <h2 id="qb-judul-aktif" className="qz-counter">
            Soal {nomorAktif + 1} dari {soalList.length} · {MODUL_LABEL[soal.modulId]}
          </h2>
        </div>
        <span className={`qz-save qz-save-${statusDraf}`} role="status" aria-live="polite">
          {statusDraf === 'tersimpan' && 'Jawaban tersimpan'}
          {statusDraf === 'gagal' && 'Jawaban belum tersimpan'}
          {statusDraf === 'rusak' && 'Penyimpanan rusak, jawaban tidak disimpan'}
        </span>
      </header>

      <nav className="qz-stepper" aria-label="Pilih nomor soal">
        {soalList.map((s, i) => {
          const sudah = jawabanDiperiksa[s.id];
          const status = !sudah ? 'belum diperiksa' : sudah === s.jawabanBenar ? 'benar' : 'salah';
          return (
            <button
              key={s.id}
              type="button"
              className={`qz-step${i === nomorAktif ? ' is-aktif' : ''}${sudah ? ' is-terjawab' : ''}`}
              onClick={() => pindahSoal(i)}
              aria-current={i === nomorAktif ? 'step' : undefined}
              aria-label={`Soal ${i + 1}, ${status}`}
            >
              {i + 1}
            </button>
          );
        })}
      </nav>

      <fieldset className="qz-card qz-fieldset">
        <legend className="qz-question">{soal.pertanyaan}</legend>
        <div className="qz-options">
          {soal.opsi.map((opsi) => {
            const dipilih = pilihan === opsi.id;
            return (
              <label key={opsi.id} className={`qz-option${dipilih ? ' is-dipilih' : ''}`}>
                <input
                  type="radio"
                  name={`latihan-${soal.id}`}
                  value={opsi.id}
                  checked={dipilih}
                  onChange={() => tandaiPilihan(soal.id, opsi.id)}
                />
                <span className="qz-key">{opsi.id}</span>
                <span className="qz-option-text">{opsi.teks}</span>
              </label>
            );
          })}
        </div>

        {peringatanPilih && (
          <p className="qz-alert qz-alert-warning" role="alert">
            Pilih salah satu jawaban dulu, lalu tekan “Periksa jawaban”.
          </p>
        )}

        <button
          type="button"
          className="qz-btn qz-btn-primary"
          onClick={() => periksaJawaban(soal.id)}
          aria-disabled={!pilihan}
        >
          Periksa jawaban
        </button>
      </fieldset>

      {tampilUmpanBalik && (
        <div
          className={`qz-review ${benar ? 'is-benar' : 'is-salah'}`}
          role="status"
          aria-live="polite"
        >
          <div className="qz-review-head">
            <span>Jawabanmu: {jawabanTerperiksa}</span>
            <span className={`qz-tag ${benar ? 'qz-tag-benar' : 'qz-tag-salah'}`}>
              {benar ? 'Benar' : 'Belum tepat'}
            </span>
          </div>

          {benar ? (
            <div className="qz-explain">
              <strong>Pembahasan:</strong> {soal.pembahasan}
            </div>
          ) : (
            <>
              {soal.miskonsepsi && (
                <div className="qz-misconception">
                  <strong>Kemungkinan keliru:</strong> {soal.miskonsepsi}
                </div>
              )}
              <div className="qz-explain">
                <strong>Pembahasan:</strong> {soal.pembahasan} Jawaban yang tepat:{' '}
                <strong>{soal.jawabanBenar}</strong>.
              </div>
              <p className="qz-last-score">
                Kamu boleh memilih jawaban lain lalu memeriksa lagi.
              </p>
            </>
          )}

          {onBukaMateri && (
            <div className="qz-actions">
              <button
                type="button"
                className="qz-btn qz-btn-ghost"
                onClick={() => onBukaMateri(soal.modulId, soal.subMateriId)}
              >
                📖 Baca lagi materinya ({MODUL_LABEL[soal.modulId]})
              </button>
            </div>
          )}
        </div>
      )}

      <div className="qz-nav">
        <button
          type="button"
          className="qz-btn qz-btn-ghost"
          onClick={() => pindahSoal(nomorAktif - 1)}
          disabled={nomorAktif === 0}
        >
          ← Sebelumnya
        </button>
        <button
          type="button"
          className="qz-btn qz-btn-ghost"
          onClick={() => pindahSoal(nomorAktif + 1)}
          disabled={nomorAktif === soalList.length - 1}
        >
          Berikutnya →
        </button>
      </div>

      <div className="qz-submit">
        <p className="qz-progress">
          {jumlahDiperiksa} dari {soalList.length} soal sudah diperiksa · {jumlahBenarSementara} benar
        </p>
        {semuaDiperiksa && (
          <button type="button" className="qz-btn qz-btn-submit" onClick={selesaiLatihan}>
            Selesai &amp; simpan hasil latihan
          </button>
        )}
      </div>
    </section>
  );
}

export default QuizBelajar;