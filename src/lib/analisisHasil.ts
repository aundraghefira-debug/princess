// src/lib/analisisHasil.ts
// Modul fungsi murni untuk analisis hasil kuis ChemiVerse (Panel Guru).
// Sesuai dengan spesifikasi tugas:
// 1. Skor per modul dihitung dari answers + bank soal (calculateScore dari localStore).
// 2. Batas tuntas per modul = 60.
// 3. Status tuntas siswa dihitung dari percobaan Evaluasi (kind: "diagnostic") TERBARU siswa.
// 4. Mode Belajar (kind: "practice") tidak ikut menentukan tuntas.
// 5. Analisis miskonsepsi tersering mengelompokkan jawaban salah berdasarkan `konsep`.

import { kuisPerModul } from '../data/chemData';
import type { SoalKuis, OpsiSoal } from '../data/chemData';
import { calculateScore } from './localStore';
import type { AttemptRecord } from './firebaseService';

// ============================================================================
// KONSTANTA & TIPE DASAR
// ============================================================================

export const MODUL_IDS = ['modul_1', 'modul_2', 'modul_3'] as const;
export type ModulId = (typeof MODUL_IDS)[number];

export const BATAS_TUNTAS = 60;

export const MODUL_LABEL: Record<ModulId, string> = {
  modul_1: 'Modul 1',
  modul_2: 'Modul 2',
  modul_3: 'Modul 3',
};

export const MODUL_JUDUL: Record<ModulId, string> = {
  modul_1: 'Teori Asam Basa',
  modul_2: 'Kekuatan dan pH Asam Basa',
  modul_3: 'Titrasi Asam Basa',
};

export interface SoalDenganModul extends SoalKuis {
  modulId: ModulId;
}

/** Seluruh butir soal gabungan Modul 1-3 dengan informasi modul asal. */
export const SEMUA_SOAL: SoalDenganModul[] = MODUL_IDS.flatMap((mid) =>
  kuisPerModul[mid].soal.map((s) => ({ ...s, modulId: mid }))
);

/** Peta butir soal berdasarkan ID soal untuk pencarian O(1). */
export const PETA_SOAL: Map<string, SoalDenganModul> = new Map(
  SEMUA_SOAL.map((s) => [s.id, s])
);

// ============================================================================
// TIPE HASIL ANALISIS
// ============================================================================

export type StatusTuntasModul = 'tuntas' | 'belum_tuntas' | 'belum_evaluasi';

export interface ModulSkor {
  modulId: ModulId;
  label: string;
  benar: number;
  total: number;
  skor: number;
  tuntas: boolean;
}

export interface DetailJawabanSoal {
  soalId: string;
  modulId: ModulId;
  konsep: string;
  subMateriId: string;
  pertanyaan: string;
  opsi: OpsiSoal[];
  jawabanSiswa: string;
  kunciJawaban: string;
  benar: boolean;
  pembahasan: string;
  miskonsepsi?: string;
}

export interface StatusSiswa {
  ownerId: string;
  alias: string;
  totalPercobaan: number;
  percobaanEvaluasiCount: number;
  percobaanBelajarCount: number;
  sudahEvaluasi: boolean;
  evaluasiTerbaru: AttemptRecord | null;
  percobaanTerbaru: AttemptRecord;
  skorTotalTerbaru: number | null;
  skorTotalDisplay: string;
  waktuKirimTerbaru: string;
  tuntasPerModul: Record<ModulId, boolean>;
  statusModul: Record<ModulId, StatusTuntasModul>;
  skorPerModulTerbaru: Record<ModulId, number | null>;
  rincianModulTerbaru: ModulSkor[];
  tuntasSemuaModul: boolean;
  attempts: AttemptRecord[];
}

export interface RingkasanKelas {
  jumlahSiswa: number;
  jumlahSiswaEvaluasi: number;
  totalPercobaan: number;
  totalPercobaanEvaluasi: number;
  totalPercobaanBelajar: number;
  rataRataSkorEvaluasi: number;
  rataRataSemuaEvaluasi: number;
  persentaseTuntas: Record<ModulId, number>;
  persentaseTuntasSemua: number;
  rataRataPerModul: Record<ModulId, number>;
  jumlahTuntasPerModul: Record<ModulId, number>;
}

export interface ItemMiskonsepsi {
  konsep: string;
  subMateriId: string;
  modulId: ModulId;
  soalId: string;
  pertanyaan: string;
  jawabanBenar: string;
  jumlahSalah: number;
  jumlahSiswaSalah: number;
  totalSiswaTeruji: number;
  persentaseSiswaSalah: number;
  teksMiskonsepsi: string;
  distribusiOpsiSalah: Record<string, number>;
}

// ============================================================================
// FUNGSI MURNI ANALISIS
// ============================================================================

/**
 * Menghitung skor dan status tuntas per modul dari peta jawaban siswa.
 * Menggunakan calculateScore() dari localStore. Ambang batas tuntas = 60.
 */
export function hitungSkorPerModul(answers: Record<string, string> = {}): ModulSkor[] {
  return MODUL_IDS.map((id) => {
    const soalModul = kuisPerModul[id].soal;
    const total = soalModul.length;
    const benar = soalModul.filter((s) => answers[s.id] === s.jawabanBenar).length;
    const skor = calculateScore(benar, total);
    return {
      modulId: id,
      label: MODUL_LABEL[id],
      benar,
      total,
      skor,
      tuntas: skor >= BATAS_TUNTAS,
    };
  });
}

/**
 * Mengevaluasi jawaban per butir soal: jawaban siswa, kunci, benar/salah,
 * modul asal, konsep, sub-materi, dan teks miskonsepsi.
 */
export function evaluasiJawabanPerButir(
  answers: Record<string, string> = {}
): DetailJawabanSoal[] {
  return SEMUA_SOAL.map((s) => {
    const jawabanSiswa = answers[s.id] ?? '';
    const benar = jawabanSiswa === s.jawabanBenar;
    return {
      soalId: s.id,
      modulId: s.modulId,
      konsep: s.konsep,
      subMateriId: s.subMateriId,
      pertanyaan: s.pertanyaan,
      opsi: s.opsi,
      jawabanSiswa,
      kunciJawaban: s.jawabanBenar,
      benar,
      pembahasan: s.pembahasan,
      miskonsepsi: s.miskonsepsi,
    };
  });
}

/**
 * Mengelompokkan riwayat percobaan ke status per siswa.
 * Status tuntas dihitung HANYA dari percobaan Evaluasi (kind: "diagnostic") TERBARU siswa itu.
 * Mode Belajar (kind: "practice") tidak ikut menentukan tuntas.
 * Siswa tanpa Evaluasi memiliki sudahEvaluasi = false, statusModul "belum_evaluasi",
 * dan skor total "-".
 */
export function ekstrakStatusSiswa(attempts: AttemptRecord[]): StatusSiswa[] {
  if (!attempts || attempts.length === 0) return [];

  // 1. Kelompokkan per ownerId
  const grup = new Map<string, AttemptRecord[]>();
  for (const att of attempts) {
    const key = att.ownerId || att.alias || 'anonim';
    const list = grup.get(key) ?? [];
    list.push(att);
    grup.set(key, list);
  }

  const hasil: StatusSiswa[] = [];

  for (const [ownerId, list] of grup.entries()) {
    // Urutkan percobaan siswa dari yang terbaru ke terlama
    const sorted = [...list].sort((a, b) =>
      (b.completedAt || '').localeCompare(a.completedAt || '')
    );

    const evaluasiAttempts = sorted.filter((a) => a.kind === 'diagnostic');
    const belajarAttempts = sorted.filter((a) => a.kind === 'practice');

    const evaluasiTerbaru = evaluasiAttempts.length > 0 ? evaluasiAttempts[0] : null;
    const percobaanTerbaru = sorted[0];
    const sudahEvaluasi = evaluasiTerbaru !== null;

    let tuntasPerModul: Record<ModulId, boolean> = {
      modul_1: false,
      modul_2: false,
      modul_3: false,
    };
    let statusModul: Record<ModulId, StatusTuntasModul> = {
      modul_1: 'belum_evaluasi',
      modul_2: 'belum_evaluasi',
      modul_3: 'belum_evaluasi',
    };
    let skorPerModulTerbaru: Record<ModulId, number | null> = {
      modul_1: null,
      modul_2: null,
      modul_3: null,
    };
    let rincianModulTerbaru: ModulSkor[] = [];

    if (evaluasiTerbaru) {
      rincianModulTerbaru = hitungSkorPerModul(evaluasiTerbaru.answers);
      for (const m of rincianModulTerbaru) {
        tuntasPerModul[m.modulId] = m.tuntas;
        statusModul[m.modulId] = m.tuntas ? 'tuntas' : 'belum_tuntas';
        skorPerModulTerbaru[m.modulId] = m.skor;
      }
    }

    const tuntasSemuaModul =
      sudahEvaluasi &&
      tuntasPerModul.modul_1 &&
      tuntasPerModul.modul_2 &&
      tuntasPerModul.modul_3;

    hasil.push({
      ownerId,
      alias: percobaanTerbaru.alias || ownerId,
      totalPercobaan: sorted.length,
      percobaanEvaluasiCount: evaluasiAttempts.length,
      percobaanBelajarCount: belajarAttempts.length,
      sudahEvaluasi,
      evaluasiTerbaru,
      percobaanTerbaru,
      skorTotalTerbaru: sudahEvaluasi ? evaluasiTerbaru.score : null,
      skorTotalDisplay: sudahEvaluasi ? String(evaluasiTerbaru.score) : '-',
      waktuKirimTerbaru: percobaanTerbaru.completedAt || '',
      tuntasPerModul,
      statusModul,
      skorPerModulTerbaru,
      rincianModulTerbaru,
      tuntasSemuaModul,
      attempts: sorted,
    });
  }

  // Urutkan default: nama alias alfabetis A-Z
  hasil.sort((a, b) => a.alias.localeCompare(b.alias, 'id', { sensitivity: 'base' }));
  return hasil;
}

/**
 * Menghitung ringkasan statistik kelas:
 * - Jumlah siswa unik yang mengirim
 * - Jumlah percobaan (total, evaluasi, belajar)
 * - Rata-rata skor evaluasi
 * - Persentase siswa tuntas per modul (Modul 1, 2, 3)
 * - Rata-rata skor per modul (untuk grafik batang)
 */
export function hitungRingkasanKelas(attempts: AttemptRecord[]): RingkasanKelas {
  const statusSiswaList = ekstrakStatusSiswa(attempts);

  const totalPercobaan = attempts.length;
  const evaluasiAttempts = attempts.filter((a) => a.kind === 'diagnostic');
  const totalPercobaanEvaluasi = evaluasiAttempts.length;
  const totalPercobaanBelajar = attempts.filter((a) => a.kind === 'practice').length;

  const siswaDenganEvaluasi = statusSiswaList.filter((s) => s.sudahEvaluasi);
  const jumlahSiswa = statusSiswaList.length;
  const jumlahSiswaEvaluasi = siswaDenganEvaluasi.length;

  // Rata-rata skor evaluasi siswa (berdasarkan evaluasi terbaru masing-masing siswa)
  let totalSkorEvaluasiSiswa = 0;
  for (const s of siswaDenganEvaluasi) {
    if (s.skorTotalTerbaru !== null) {
      totalSkorEvaluasiSiswa += s.skorTotalTerbaru;
    }
  }
  const rataRataSkorEvaluasi =
    jumlahSiswaEvaluasi > 0
      ? Math.round((totalSkorEvaluasiSiswa / jumlahSiswaEvaluasi) * 10) / 10
      : 0;

  // Rata-rata seluruh percobaan evaluasi (termasuk pengulangan)
  const totalSkorSemuaEvaluasi = evaluasiAttempts.reduce((acc, cur) => acc + (cur.score || 0), 0);
  const rataRataSemuaEvaluasi =
    totalPercobaanEvaluasi > 0
      ? Math.round((totalSkorSemuaEvaluasi / totalPercobaanEvaluasi) * 10) / 10
      : 0;

  // Hitung jumlah tuntas dan rata-rata skor per modul
  const jumlahTuntasPerModul: Record<ModulId, number> = {
    modul_1: 0,
    modul_2: 0,
    modul_3: 0,
  };
  const totalSkorPerModul: Record<ModulId, number> = {
    modul_1: 0,
    modul_2: 0,
    modul_3: 0,
  };

  for (const s of siswaDenganEvaluasi) {
    for (const mId of MODUL_IDS) {
      if (s.tuntasPerModul[mId]) {
        jumlahTuntasPerModul[mId] += 1;
      }
      totalSkorPerModul[mId] += s.skorPerModulTerbaru[mId] || 0;
    }
  }

  const persentaseTuntas: Record<ModulId, number> = {
    modul_1:
      jumlahSiswaEvaluasi > 0
        ? Math.round((jumlahTuntasPerModul.modul_1 / jumlahSiswaEvaluasi) * 100)
        : 0,
    modul_2:
      jumlahSiswaEvaluasi > 0
        ? Math.round((jumlahTuntasPerModul.modul_2 / jumlahSiswaEvaluasi) * 100)
        : 0,
    modul_3:
      jumlahSiswaEvaluasi > 0
        ? Math.round((jumlahTuntasPerModul.modul_3 / jumlahSiswaEvaluasi) * 100)
        : 0,
  };

  const rataRataPerModul: Record<ModulId, number> = {
    modul_1:
      jumlahSiswaEvaluasi > 0
        ? Math.round((totalSkorPerModul.modul_1 / jumlahSiswaEvaluasi) * 10) / 10
        : 0,
    modul_2:
      jumlahSiswaEvaluasi > 0
        ? Math.round((totalSkorPerModul.modul_2 / jumlahSiswaEvaluasi) * 10) / 10
        : 0,
    modul_3:
      jumlahSiswaEvaluasi > 0
        ? Math.round((totalSkorPerModul.modul_3 / jumlahSiswaEvaluasi) * 10) / 10
        : 0,
  };

  const jumlahTuntasSemua = siswaDenganEvaluasi.filter((s) => s.tuntasSemuaModul).length;
  const persentaseTuntasSemua =
    jumlahSiswaEvaluasi > 0
      ? Math.round((jumlahTuntasSemua / jumlahSiswaEvaluasi) * 100)
      : 0;

  return {
    jumlahSiswa,
    jumlahSiswaEvaluasi,
    totalPercobaan,
    totalPercobaanEvaluasi,
    totalPercobaanBelajar,
    rataRataSkorEvaluasi,
    rataRataSemuaEvaluasi,
    persentaseTuntas,
    persentaseTuntasSemua,
    rataRataPerModul,
    jumlahTuntasPerModul,
  };
}

/**
 * Menganalisis miskonsepsi tersering:
 * - Mengelompokkan jawaban salah menurut `konsep` dan butir soal.
 * - Mengurutkan dari yang paling banyak salah (paling sering dialami siswa).
 * - Menampilkan jumlah siswa yang salah, persentase salah (pembagi = jumlah siswa unik teruji),
 *   teks `miskonsepsi` dari chemData, dan sub-materi terkait (`subMateriId`).
 *
 * @param attempts Seluruh riwayat percobaan kuis kelas
 * @param opsi.hanyaEvaluasiTerbaru Jika true (default), hanya memeriksa evaluasi terbaru tiap siswa.
 */
export function analisisMiskonsepsi(
  attempts: AttemptRecord[],
  opsi: { hanyaEvaluasiTerbaru?: boolean } = { hanyaEvaluasiTerbaru: true }
): ItemMiskonsepsi[] {
  if (!attempts || attempts.length === 0) return [];

  // Tentukan daftar percobaan yang dianalisis
  let percobaanDianalisis: AttemptRecord[] = [];
  if (opsi.hanyaEvaluasiTerbaru) {
    const statusSiswa = ekstrakStatusSiswa(attempts);
    percobaanDianalisis = statusSiswa
      .map((s) => s.evaluasiTerbaru)
      .filter((a): a is AttemptRecord => a !== null);
  } else {
    percobaanDianalisis = attempts;
  }

  // Pembagi persentase adalah JUMLAH SISWA UNIK (ownerId), bukan jumlah percobaan
  const siswaTerujiSet = new Set(
    percobaanDianalisis.map((a) => a.ownerId || a.alias || 'anonim')
  );
  const totalSiswaTeruji = siswaTerujiSet.size;

  if (totalSiswaTeruji === 0) return [];

  // Analisis setiap soal dalam SEMUA_SOAL
  const hasil: ItemMiskonsepsi[] = [];

  for (const soal of SEMUA_SOAL) {
    let jumlahSalah = 0;
    const siswaSalah = new Set<string>();
    const distribusiOpsiSalah: Record<string, number> = {};

    for (const att of percobaanDianalisis) {
      const jawaban = att.answers?.[soal.id];
      // Jika dijawab dan salah
      if (jawaban && jawaban !== soal.jawabanBenar) {
        jumlahSalah += 1;
        siswaSalah.add(att.ownerId || att.alias || 'anonim');
        distribusiOpsiSalah[jawaban] = (distribusiOpsiSalah[jawaban] || 0) + 1;
      }
    }

    const jumlahSiswaSalah = siswaSalah.size;
    const persentaseSiswaSalah =
      totalSiswaTeruji > 0 ? Math.round((jumlahSiswaSalah / totalSiswaTeruji) * 100) : 0;

    hasil.push({
      konsep: soal.konsep,
      subMateriId: soal.subMateriId,
      modulId: soal.modulId,
      soalId: soal.id,
      pertanyaan: soal.pertanyaan,
      jawabanBenar: soal.jawabanBenar,
      jumlahSalah,
      jumlahSiswaSalah,
      totalSiswaTeruji,
      persentaseSiswaSalah,
      teksMiskonsepsi: soal.miskonsepsi || 'Belum ada penjelasan miskonsepsi untuk soal ini.',
      distribusiOpsiSalah,
    });
  }

  // Urutkan dari yang paling banyak salah (jumlahSiswaSalah terbanyak)
  hasil.sort((a, b) => {
    if (b.jumlahSiswaSalah !== a.jumlahSiswaSalah) {
      return b.jumlahSiswaSalah - a.jumlahSiswaSalah;
    }
    return b.jumlahSalah - a.jumlahSalah;
  });

  return hasil;
}

/**
 * Menyaring dan mengurutkan daftar siswa untuk tabel Panel Guru.
 * - urut 'nama': 'asc' = A-Z, 'desc' = Z-A.
 * - urut 'skor': 'desc' = tertinggi ke terendah, 'asc' = terendah ke tertinggi.
 * - urut 'waktu': 'desc' = terbaru ke terlama, 'asc' = terlama ke terbaru.
 */
export function filterDanUrutSiswa(
  siswaList: StatusSiswa[],
  filterMode: 'semua' | 'diagnostic' | 'practice' = 'semua',
  urutBerdasarkan: 'skor' | 'waktu' | 'nama' = 'skor',
  arah: 'asc' | 'desc' = 'desc'
): StatusSiswa[] {
  let filtered = [...siswaList];

  if (filterMode === 'diagnostic') {
    filtered = filtered.filter((s) => s.percobaanEvaluasiCount > 0);
  } else if (filterMode === 'practice') {
    filtered = filtered.filter((s) => s.percobaanBelajarCount > 0);
  }

  filtered.sort((a, b) => {
    let diff = 0;
    if (urutBerdasarkan === 'skor') {
      const skorA = a.skorTotalTerbaru ?? -1;
      const skorB = b.skorTotalTerbaru ?? -1;
      diff = skorA - skorB;
    } else if (urutBerdasarkan === 'waktu') {
      diff = (a.waktuKirimTerbaru || '').localeCompare(b.waktuKirimTerbaru || '');
    } else {
      // Urutan nama: 'asc' = A-Z, 'desc' = Z-A
      diff = a.alias.localeCompare(b.alias, 'id', { sensitivity: 'base' });
    }
    return arah === 'asc' ? diff : -diff;
  });

  return filtered;
}
