// src/components/QuizSection.tsx
// Kuis Mode Evaluasi (kind: "diagnostic") — Pertemuan 03
// Soal dari src/data/chemData.ts (kuisPerModul), penyimpanan lewat src/lib/localStore.ts
// Aturan: docs/PRD.md F7, docs/DATABASE.md

import { useEffect, useMemo, useRef, useState } from 'react';
import { kuisPerModul } from '../data/chemData';
import type { Modul, SoalKuis } from '../data/chemData';
import {
  buildActivityKey,
  calculateScore,
  deleteDraft,
  generateSessionId,
  getDraft,
  getRecordsByActivity,
  markModuleCompleted,
  saveDraft,
  saveRecord,
} from '../lib/localStore';
import type { Draft, QuizRecord } from '../lib/localStore';
import './QuizGabungan.css';

interface QuizSectionProps {
  moduleId: string; // 'modul_1' atau 'modul-1'
  onQuizActiveChange?: (aktif: boolean) => void;
  onModuleCompleted?: (moduleId: string) => void;
}

type Fase = 'mulai' | 'mengerjakan' | 'hasil';
type StatusSimpan = 'belum' | 'tersimpan' | 'gagal' | 'rusak';

export function QuizGabungan({ moduleId: idDariHalaman, onQuizActiveChange, onModuleCompleted }: QuizSectionProps) {
  // 'modul-1' → 'modul_1' (id di chemData.ts)
  const modulId = idDariHalaman.replace('-', '_') as Modul['id'];
  const kuis = kuisPerModul[modulId];

  // 'modul_1' → 'modul-1' (format moduleId di docs/DATABASE.md)
  const moduleId = modulId.replace('_', '-');
  const activityKey = kuis
    ? buildActivityKey(moduleId, kuis.activityId, kuis.questionVersion)
    : '';

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

  // Baca draf dan hasil terakhir saat halaman dibuka (termasuk setelah refresh)
  useEffect(() => {
    if (!kuis) return;
    const bacaDraf = getDraft(activityKey);
    if (bacaDraf.status === 'rusak') {
      setPenyimpananRusak(true);
      return;
    }
    setDraf(bacaDraf.data);
    const bacaHasil = getRecordsByActivity(activityKey);
    if (bacaHasil.status === 'rusak') {
      setPenyimpananRusak(true);
      return;
    }
    const daftarDiagnostik = bacaHasil.data.filter((r) => r.kind === 'diagnostic');
    setHasilTerakhir(daftarDiagnostik[0] ?? null);
  }, [kuis, activityKey]);

  // Beri tahu halaman modul apakah evaluasi sedang dikerjakan
  useEffect(() => {
    onQuizActiveChange?.(fase === 'mengerjakan');
  }, [fase, onQuizActiveChange]);

  // Saat mengerjakan: kunci scroll halaman di belakang dan fokus ke judul
  useEffect(() => {
    if (fase !== 'mengerjakan') return;
    const overflowLama = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    judulRef.current?.focus();
    return () => {
      document.body.style.overflow = overflowLama;
    };
  }, [fase]);

  const soalList: SoalKuis[] = useMemo(() => kuis?.soal ?? [], [kuis]);

  if (!kuis || soalList.length === 0) return null;

  const jawaban = draf?.answers ?? {};
  const jumlahTerjawab = soalList.filter((s) => jawaban[s.id]).length;
  const nomorBelumDijawab = soalList
    .map((s, i) => (jawaban[s.id] ? null : i + 1))
    .filter((n): n is number => n !== null);

  function simpanDraf(drafBaru: Draft) {
    const hasilSimpan = saveDraft(activityKey, drafBaru);
    if (hasilSimpan.success) setStatusDraf('tersimpan');
    else setStatusDraf(hasilSimpan.status === 'rusak' ? 'rusak' : 'gagal');
  }

  function mulaiEvaluasi() {
    setKonfirmasiKeluar(false);
    setTampilBelumDijawab(false);
    setHasil(null);
    setHasilTersimpan('belum');
    setNomorAktif(0);

    // Draf yang belum dikirim dilanjutkan dengan ID yang sama
    if (draf) {
      setFase('mengerjakan');
      return;
    }

    const sekarang = new Date().toISOString();
    const drafBaru: Draft = {
      id: generateSessionId(), // dibuat sekali saat Mulai
      moduleId,
      activityId: kuis.activityId,
      questionVersion: kuis.questionVersion,
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
    const hasilSimpan = saveRecord(record);
    if (!hasilSimpan.success) {
      setHasilTersimpan(hasilSimpan.status === 'rusak' ? 'rusak' : 'gagal');
      return;
    }
    setHasilTersimpan('tersimpan');
    setHasilTerakhir(record);
    deleteDraft(activityKey);
    markModuleCompleted(modulId);
    onModuleCompleted?.(modulId);
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
      moduleId,
      activityId: kuis.activityId,
      questionVersion: kuis.questionVersion,
      kind: 'diagnostic',
      answers: { ...draf.answers }, // jawaban dibekukan
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

  // ---------------------------------------------------------------------------
  // Tampilan: data penyimpanan rusak
  // ---------------------------------------------------------------------------
  if (penyimpananRusak) {
    return (
      <section className="qz-section" id="kuis-evaluasi" aria-labelledby="qz-judul">
        <span className="qz-badge">Kuis</span>
        <h2 id="qz-judul" className="qz-heading">Evaluasi Modul</h2>
        <div className="qz-alert qz-alert-error" role="alert">
          Data kuis yang tersimpan di perangkat ini rusak, sehingga jawaban belum bisa
          disimpan. Materi tetap bisa kamu baca. Minta bantuan guru untuk menghapus data
          ChemiVerse di perangkat ini.
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // Tampilan: sebelum mulai
  // ---------------------------------------------------------------------------
  if (fase === 'mulai') {
    return (
      <section className="qz-section" id="kuis-evaluasi" aria-labelledby="qz-judul">
        <span className="qz-badge">Kuis</span>
        <h2 id="qz-judul" className="qz-heading">Evaluasi Modul</h2>

        <div className="qz-card">
          <span className="qz-mode-pill">Mode Evaluasi</span>
          <ul className="qz-rules">
            <li>Ada {soalList.length} soal pilihan ganda.</li>
            <li>Selama mengerjakan, materi tidak bisa dibuka.</li>
            <li>Jawaban bisa dikirim setelah semua soal terisi.</li>
            <li>Skor dan pembahasan muncul setelah jawaban dikirim.</li>
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

  // ---------------------------------------------------------------------------
  // Tampilan: hasil dan pembahasan
  // ---------------------------------------------------------------------------
  if (fase === 'hasil' && hasil) {
    return (
      <section className="qz-section" id="kuis-evaluasi" aria-labelledby="qz-judul">
        <span className="qz-badge">Kuis</span>
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

        <ol className="qz-review-list">
          {soalList.map((soal, i) => {
            const pilihan = hasil.answers[soal.id];
            const benar = pilihan === soal.jawabanBenar;
            return (
              <li key={soal.id} className={`qz-review ${benar ? 'is-benar' : 'is-salah'}`}>
                <div className="qz-review-head">
                  <span>Soal {i + 1}</span>
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

  // ---------------------------------------------------------------------------
  // Tampilan: sedang mengerjakan (layar penuh, navigasi materi tertutup)
  // ---------------------------------------------------------------------------
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
