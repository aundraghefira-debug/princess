/**
 * localStore.ts — Modul Penyimpanan Lokal ChemiVerse (Local-First)
 *
 * Mengikuti spesifikasi kontrak docs/DATABASE.md dan aturan docs/AGENT.md.
 * Semua akses localStorage pada aplikasi ChemiVerse WAJIB melalui file ini.
 *
 * Aturan Penting:
 * 1. Single Key: 'chem:chemiverse:v1'
 * 2. Scope default: 'guest' (Pertemuan 03)
 * 3. Dilarang menggunakan localStorage.clear()
 * 4. Jika JSON rusak, jangan ditimpa otomatis; kembalikan status "rusak"
 * 5. Setiap operasi tulis mengembalikan status hasil operasi (berhasil/gagal/rusak)
 */

// ============================================================================
// KONSTANTA & KEY PENYIMPANAN
// ============================================================================

export const STORAGE_KEY = 'chem:chemiverse:v1';
export const CURRENT_SCHEMA_VERSION = 1;
export const DEFAULT_SCOPE = 'guest';

// ============================================================================
// TIPE & STRUKTUR DATA (Sesuai docs/DATABASE.md)
// ============================================================================

/**
 * Mode kuis:
 * - 'diagnostic': Mode Evaluasi (jawaban dikirim sekaligus, dibekukan)
 * - 'practice': Mode Belajar (jawaban per soal, boleh diubah)
 */
export type QuizKind = 'diagnostic' | 'practice';

/**
 * Struktur Draf Jawaban Kuis yang sedang dikerjakan.
 * Disimpan setiap kali siswa memilih atau mengubah opsi.
 */
export interface Draft {
  id: string; // crypto.randomUUID() sesi kuis
  moduleId: string; // contoh: 'modul-1'
  activityId: string; // contoh: 'kuis-teori'
  questionVersion: string; // contoh: 'v1'
  kind: QuizKind;
  answers: Record<string, string>; // Peta ID soal -> ID opsi terpilih
  startedAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
export type Draf = Draft;

/**
 * Struktur Hasil Percobaan / Kuis (Record).
 * Dibuat saat siswa menekan tombol Kirim dan semua validasi lolos.
 * Tidak diubah lagi setelah disimpan (bersifat permanen).
 */
export interface QuizRecord {
  id: string; // ID sesi percobaan
  ownerId: string; // 'guest' (Pertemuan 03)
  alias: string; // Dikosongkan ("") demi privasi
  moduleId: string; // contoh: 'modul-1'
  activityId: string; // contoh: 'kuis-teori'
  questionVersion: string; // contoh: 'v1'
  kind: QuizKind;
  answers: Record<string, string>; // Peta ID soal -> ID opsi
  correctCount: number; // Jumlah jawaban benar
  totalQuestions: number; // Jumlah total butir soal
  score: number; // 0 - 100 (dibulatkan ke bilangan bulat)
  startedAt: string; // ISO timestamp
  completedAt: string; // ISO timestamp
  status: 'local'; // 'local' pada Pertemuan 03
}
export type Hasil = QuizRecord;
export type RecordData = QuizRecord;

/**
 * Progres modul yang telah diselesaikan oleh pengguna.
 */
export interface UserProgress {
  completedModules: string[];
}

/**
 * Data penyimpanan di dalam satu scope (contoh: scope 'guest').
 */
export interface ScopeData {
  drafts: Record<string, Draft>; // Key: activityKey (<moduleId>:<activityId>:<questionVersion>)
  records: Record<string, QuizRecord>; // Key: record id (UUID)
  progress: UserProgress;
}

/**
 * Struktur JSON lengkap di dalam key 'chem:chemiverse:v1'.
 */
export interface ChemiVerseStorage {
  schemaVersion: number;
  scopes: {
    [scopeName: string]: ScopeData;
  };
}
export type StrukturPenyimpanan = ChemiVerseStorage;

// ============================================================================
// STATUS & RESULT TYPES
// ============================================================================

export type StorageWriteStatus = 'berhasil' | 'gagal' | 'rusak';
export type StorageReadStatus = 'berhasil' | 'kosong' | 'rusak' | 'gagal';

export interface StorageWriteResult {
  success: boolean;
  status: StorageWriteStatus;
  error?: string;
}
export type WriteResult = StorageWriteResult;

export interface ReadStorageResult {
  success: boolean;
  status: StorageReadStatus;
  data: ChemiVerseStorage | null;
  error?: string;
}

export interface ReadDraftResult {
  success: boolean;
  status: StorageReadStatus;
  data: Draft | null;
  error?: string;
}

export interface ReadRecordsResult {
  success: boolean;
  status: StorageReadStatus;
  data: QuizRecord[];
  error?: string;
}

export interface ReadProgressResult {
  success: boolean;
  status: StorageReadStatus;
  data: string[];
  error?: string;
}

// ============================================================================
// HELPER INTERNAL & UTILITAS
// ============================================================================

/**
 * Mendapatkan referensi localStorage secara aman (menghindari crash jika disabled/SSR).
 */
function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Akses localStorage ditolak (misal mode privasi ketat / iframe terbatas)
  }
  return null;
}

/**
 * Membuat template struktur penyimpanan kosong yang valid.
 */
export function createEmptyStorage(): ChemiVerseStorage {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    scopes: {
      [DEFAULT_SCOPE]: {
        drafts: {},
        records: {},
        progress: {
          completedModules: [],
        },
      },
    },
  };
}

/**
 * Membentuk activityKey sesuai kontrak docs/DATABASE.md:
 * Format: `<moduleId>:<activityId>:<questionVersion>`
 * Contoh: `modul-1:kuis-teori:v1`
 */
export function buildActivityKey(
  moduleId: string,
  activityId: string,
  questionVersion: string
): string {
  return `${moduleId}:${activityId}:${questionVersion}`;
}

/**
 * Memecah activityKey menjadi komponen moduleId, activityId, dan questionVersion.
 */
export function parseActivityKey(activityKey: string): {
  moduleId: string;
  activityId: string;
  questionVersion: string;
} | null {
  const parts = activityKey.split(':');
  if (parts.length === 3) {
    return {
      moduleId: parts[0],
      activityId: parts[1],
      questionVersion: parts[2],
    };
  }
  return null;
}

/**
 * Menghasilkan UUID unik untuk ID sesi kuis/percobaan.
 * Menggunakan crypto.randomUUID() dengan fallback aman.
 */
export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Menghitung skor kuis: (correctCount / totalQuestions) * 100
 * Dibulatkan ke bilangan bulat terdekat (Math.round).
 */
export function calculateScore(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((correctCount / totalQuestions) * 100);
}

/**
 * Memvalidasi apakah objek hasil parse memenuhi kriteria skema ChemiVerseStorage.
 */
function isValidStorageSchema(obj: unknown): obj is ChemiVerseStorage {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  if (typeof candidate.schemaVersion !== 'number') {
    return false;
  }
  if (typeof candidate.scopes !== 'object' || candidate.scopes === null || Array.isArray(candidate.scopes)) {
    return false;
  }
  return true;
}

/**
 * Memastikan scope tertentu memiliki struktur ScopeData yang valid di memori.
 */
function ensureScope(storage: ChemiVerseStorage, scopeName: string = DEFAULT_SCOPE): ScopeData {
  if (!storage.scopes[scopeName] || typeof storage.scopes[scopeName] !== 'object' || Array.isArray(storage.scopes[scopeName])) {
    storage.scopes[scopeName] = {
      drafts: {},
      records: {},
      progress: {
        completedModules: [],
      },
    };
  }

  const scope = storage.scopes[scopeName];
  if (!scope.drafts || typeof scope.drafts !== 'object' || Array.isArray(scope.drafts)) {
    scope.drafts = {};
  }
  if (!scope.records || typeof scope.records !== 'object' || Array.isArray(scope.records)) {
    scope.records = {};
  }
  if (!scope.progress || typeof scope.progress !== 'object' || !Array.isArray(scope.progress.completedModules)) {
    scope.progress = { completedModules: [] };
  }

  return scope;
}

// ============================================================================
// 1. MEMBACA SELURUH DATA (Aman jika belum ada atau rusak)
// ============================================================================

/**
 * Membaca seluruh data ChemiVerse dari localStorage.
 * - Jika key belum ada: mengembalikan status 'kosong' dengan data default (aman).
 * - Jika JSON rusak: mengembalikan status 'rusak', data null, tanpa menimpa.
 * - Jika berhasil: mengembalikan status 'berhasil' dengan data terurai.
 */
export function readAllData(): ReadStorageResult {
  const storage = getStorage();
  if (!storage) {
    return {
      success: false,
      status: 'gagal',
      data: null,
      error: 'LocalStorage tidak tersedia atau akses ditolak oleh peramban.',
    };
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return {
        success: true,
        status: 'kosong',
        data: createEmptyStorage(),
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      return {
        success: false,
        status: 'rusak',
        data: null,
        error: `JSON tidak valid: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      };
    }

    if (!isValidStorageSchema(parsed)) {
      return {
        success: false,
        status: 'rusak',
        data: null,
        error: 'Format data penyimpanan tidak sesuai skema ChemiVerse (schemaVersion atau scopes tidak valid).',
      };
    }

    // Pastikan scope guest terinisialisasi
    ensureScope(parsed, DEFAULT_SCOPE);

    return {
      success: true,
      status: 'berhasil',
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      status: 'gagal',
      data: null,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat membaca data lokal.',
    };
  }
}
export const getStorageData = readAllData;
export const readStorage = readAllData;

/**
 * Helper internal untuk menulis kembali ChemiVerseStorage ke localStorage.
 * Memeriksa status kerusakan JSON saat ini agar tidak menimpa data yang rusak.
 */
function writeFullStorage(storageData: ChemiVerseStorage): StorageWriteResult {
  const storage = getStorage();
  if (!storage) {
    return {
      success: false,
      status: 'gagal',
      error: 'LocalStorage tidak tersedia atau akses ditolak oleh peramban.',
    };
  }

  try {
    // Validasi data saat ini di storage sebelum menimpa
    const existingRaw = storage.getItem(STORAGE_KEY);
    if (existingRaw !== null) {
      try {
        const parsed = JSON.parse(existingRaw);
        if (!isValidStorageSchema(parsed)) {
          return {
            success: false,
            status: 'rusak',
            error: 'Data penyimpanan di peramban terdeteksi rusak. Operasi penyimpanan dibatalkan untuk mencegah penimpaan data.',
          };
        }
      } catch {
        return {
          success: false,
          status: 'rusak',
          error: 'Data penyimpanan di peramban terdeteksi rusak (JSON corrupt). Operasi penyimpanan dibatalkan untuk mencegah penimpaan data.',
        };
      }
    }

    const serialized = JSON.stringify(storageData);
    storage.setItem(STORAGE_KEY, serialized);
    return {
      success: true,
      status: 'berhasil',
    };
  } catch (error) {
    return {
      success: false,
      status: 'gagal',
      error: error instanceof Error ? error.message : 'Gagal menyimpan data ke peramban (kuota penuh atau akses ditolak).',
    };
  }
}

// ============================================================================
// 2. MENYIMPAN & MEMBACA DRAF PER ACTIVITYKEY
// ============================================================================

/**
 * Menyimpan draf jawaban per activityKey.
 * Mendukung pemanggilan:
 * - saveDraft(draft) -> activityKey diambil dari isi draft
 * - saveDraft(activityKey, draft) -> activityKey ditentukan eksplisit
 */
export function saveDraft(draft: Draft, scope?: string): StorageWriteResult;
export function saveDraft(activityKey: string, draft: Draft, scope?: string): StorageWriteResult;
export function saveDraft(
  arg1: Draft | string,
  arg2?: Draft | string,
  arg3?: string
): StorageWriteResult {
  let activityKey: string;
  let draftToSave: Draft;
  let targetScope = DEFAULT_SCOPE;

  if (typeof arg1 === 'string') {
    activityKey = arg1;
    if (!arg2 || typeof arg2 !== 'object') {
      return {
        success: false,
        status: 'gagal',
        error: 'Argumen draf tidak valid.',
      };
    }
    draftToSave = arg2 as Draft;
    if (typeof arg3 === 'string' && arg3.trim() !== '') {
      targetScope = arg3;
    }
  } else {
    draftToSave = arg1;
    activityKey = buildActivityKey(
      draftToSave.moduleId,
      draftToSave.activityId,
      draftToSave.questionVersion
    );
    if (typeof arg2 === 'string' && arg2.trim() !== '') {
      targetScope = arg2;
    }
  }

  // Baca penyimpanan saat ini
  const current = readAllData();
  if (current.status === 'rusak') {
    return {
      success: false,
      status: 'rusak',
      error: 'Data penyimpanan di peramban terdeteksi rusak. Draf tidak disimpan untuk mencegah penimpaan data.',
    };
  }
  if (!current.success || !current.data) {
    return {
      success: false,
      status: 'gagal',
      error: current.error || 'Gagal membaca penyimpanan lokal.',
    };
  }

  const storageData = current.data;
  const scopeObj = ensureScope(storageData, targetScope);

  // Pastikan timestamp updatedAt terisi/terbarukan
  const finalDraft: Draft = {
    ...draftToSave,
    startedAt: draftToSave.startedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  scopeObj.drafts[activityKey] = finalDraft;

  return writeFullStorage(storageData);
}

/**
 * Membaca draf jawaban berdasarkan activityKey atau (moduleId, activityId, questionVersion).
 */
export function getDraft(activityKey: string, scope?: string): ReadDraftResult;
export function getDraft(
  moduleId: string,
  activityId: string,
  questionVersion: string,
  scope?: string
): ReadDraftResult;
export function getDraft(
  arg1: string,
  arg2?: string,
  arg3?: string,
  arg4?: string
): ReadDraftResult {
  let activityKey: string;
  let targetScope = DEFAULT_SCOPE;

  if (arg2 && arg3) {
    activityKey = buildActivityKey(arg1, arg2, arg3);
    if (typeof arg4 === 'string' && arg4.trim() !== '') {
      targetScope = arg4;
    }
  } else {
    activityKey = arg1;
    if (typeof arg2 === 'string' && arg2.trim() !== '') {
      targetScope = arg2;
    }
  }

  const current = readAllData();
  if (current.status === 'rusak') {
    return {
      success: false,
      status: 'rusak',
      data: null,
      error: current.error || 'Data penyimpanan lokal terdeteksi rusak.',
    };
  }
  if (current.status === 'kosong' || !current.data) {
    return {
      success: true,
      status: 'kosong',
      data: null,
    };
  }

  const scopeObj = current.data.scopes[targetScope];
  if (!scopeObj || !scopeObj.drafts || !scopeObj.drafts[activityKey]) {
    return {
      success: true,
      status: 'kosong',
      data: null,
    };
  }

  return {
    success: true,
    status: 'berhasil',
    data: scopeObj.drafts[activityKey],
  };
}
export const readDraft = getDraft;

// ============================================================================
// 3. MENGHAPUS DRAF SATU AKTIVITAS (Ulangi Kuis)
// ============================================================================

/**
 * Menghapus draf untuk satu aktivitas tertentu saja (Aksi "Ulangi kuis").
 * Sesuai Bagian 7 docs/DATABASE.md:
 * - Menghapus: Draf aktivitas itu saja.
 * - Tetap tersimpan: Semua record hasil percobaan dan progress modul.
 */
export function deleteDraft(activityKey: string, scope?: string): StorageWriteResult;
export function deleteDraft(
  moduleId: string,
  activityId: string,
  questionVersion: string,
  scope?: string
): StorageWriteResult;
export function deleteDraft(
  arg1: string,
  arg2?: string,
  arg3?: string,
  arg4?: string
): StorageWriteResult {
  let activityKey: string;
  let targetScope = DEFAULT_SCOPE;

  if (arg2 && arg3) {
    activityKey = buildActivityKey(arg1, arg2, arg3);
    if (typeof arg4 === 'string' && arg4.trim() !== '') {
      targetScope = arg4;
    }
  } else {
    activityKey = arg1;
    if (typeof arg2 === 'string' && arg2.trim() !== '') {
      targetScope = arg2;
    }
  }

  const current = readAllData();
  if (current.status === 'rusak') {
    return {
      success: false,
      status: 'rusak',
      error: 'Data penyimpanan lokal terdeteksi rusak. Operasi hapus draf dibatalkan.',
    };
  }
  if (current.status === 'kosong' || !current.data) {
    // Tidak ada yang perlu dihapus
    return {
      success: true,
      status: 'berhasil',
    };
  }

  const storageData = current.data;
  const scopeObj = storageData.scopes[targetScope];
  if (!scopeObj || !scopeObj.drafts || !(activityKey in scopeObj.drafts)) {
    // Draf memang tidak ada, operasi dianggap selesai
    return {
      success: true,
      status: 'berhasil',
    };
  }

  delete scopeObj.drafts[activityKey];
  return writeFullStorage(storageData);
}
export const removeDraft = deleteDraft;

// ============================================================================
// 4. MENYIMPAN HASIL (RECORD) & MEMBACA RECORD SATU AKTIVITAS
// ============================================================================

/**
 * Menyimpan hasil kuis/percobaan (Record).
 * Disimpan saat siswa menekan tombol Kirim.
 * Record yang sudah disimpan dibekukan (tidak diubah lagi).
 */
export function saveRecord(record: QuizRecord, scope: string = DEFAULT_SCOPE): StorageWriteResult {
  if (!record || typeof record !== 'object' || !record.id) {
    return {
      success: false,
      status: 'gagal',
      error: 'Objek record tidak valid atau tidak memiliki ID.',
    };
  }

  const current = readAllData();
  if (current.status === 'rusak') {
    return {
      success: false,
      status: 'rusak',
      error: 'Data penyimpanan di peramban terdeteksi rusak. Hasil belum tersimpan pada perangkat untuk mencegah penimpaan data.',
    };
  }
  if (!current.success || !current.data) {
    return {
      success: false,
      status: 'gagal',
      error: current.error || 'Gagal membaca penyimpanan lokal.',
    };
  }

  const storageData = current.data;
  const scopeObj = ensureScope(storageData, scope);

  // Normalisasi record sesuai kontrak docs/DATABASE.md
  const recordToSave: QuizRecord = {
    ...record,
    ownerId: record.ownerId || scope,
    alias: '', // Sesuai Bagian 5: Dikosongkan, jangan menyimpan data pribadi
    status: 'local',
    completedAt: record.completedAt || new Date().toISOString(),
  };

  scopeObj.records[recordToSave.id] = recordToSave;

  return writeFullStorage(storageData);
}

/**
 * Membaca semua record hasil percobaan untuk satu aktivitas tertentu.
 * Mendukung pemanggilan:
 * - getRecordsByActivity('modul-1:kuis-teori:v1')
 * - getRecordsByActivity('modul-1', 'kuis-teori')
 * - getRecordsByActivity('modul-1', 'kuis-teori', 'v1')
 *
 * Hasil diurutkan dari yang paling baru (completedAt terbaru di awal).
 */
export function getRecordsByActivity(
  arg1: string,
  arg2?: string,
  arg3?: string,
  arg4?: string
): ReadRecordsResult {
  let targetModuleId = '';
  let targetActivityId = '';
  let targetVersion = '';
  let targetScope = DEFAULT_SCOPE;

  if (arg2) {
    targetModuleId = arg1;
    targetActivityId = arg2;
    if (arg3 && !arg4) {
      targetVersion = arg3;
    } else if (arg3 && arg4) {
      targetVersion = arg3;
      targetScope = arg4;
    }
  } else {
    const parsed = parseActivityKey(arg1);
    if (parsed) {
      targetModuleId = parsed.moduleId;
      targetActivityId = parsed.activityId;
      targetVersion = parsed.questionVersion;
    } else {
      targetActivityId = arg1;
    }
  }

  const current = readAllData();
  if (current.status === 'rusak') {
    return {
      success: false,
      status: 'rusak',
      data: [],
      error: current.error || 'Data penyimpanan lokal terdeteksi rusak.',
    };
  }
  if (current.status === 'kosong' || !current.data) {
    return {
      success: true,
      status: 'kosong',
      data: [],
    };
  }

  const scopeObj = current.data.scopes[targetScope];
  if (!scopeObj || !scopeObj.records) {
    return {
      success: true,
      status: 'kosong',
      data: [],
    };
  }

  const recordsList = Object.values(scopeObj.records).filter((r) => {
    if (targetModuleId && r.moduleId !== targetModuleId) return false;
    if (targetActivityId && r.activityId !== targetActivityId) return false;
    if (targetVersion && r.questionVersion !== targetVersion) return false;
    return true;
  });

  // Urutkan dari yang terbaru (completedAt descending)
  recordsList.sort((a, b) => {
    const timeA = new Date(a.completedAt || a.startedAt).getTime();
    const timeB = new Date(b.completedAt || b.startedAt).getTime();
    return timeB - timeA;
  });

  return {
    success: true,
    status: recordsList.length > 0 ? 'berhasil' : 'kosong',
    data: recordsList,
  };
}
export const readRecordsByActivity = getRecordsByActivity;

/**
 * Membaca seluruh record yang pernah dibuat pada scope tertentu.
 */
export function getAllRecords(scope: string = DEFAULT_SCOPE): ReadRecordsResult {
  const current = readAllData();
  if (current.status === 'rusak') {
    return {
      success: false,
      status: 'rusak',
      data: [],
      error: current.error || 'Data penyimpanan lokal terdeteksi rusak.',
    };
  }
  if (current.status === 'kosong' || !current.data) {
    return {
      success: true,
      status: 'kosong',
      data: [],
    };
  }

  const scopeObj = current.data.scopes[scope];
  if (!scopeObj || !scopeObj.records) {
    return {
      success: true,
      status: 'kosong',
      data: [],
    };
  }

  const recordsList = Object.values(scopeObj.records);
  recordsList.sort((a, b) => {
    const timeA = new Date(a.completedAt || a.startedAt).getTime();
    const timeB = new Date(b.completedAt || b.startedAt).getTime();
    return timeB - timeA;
  });

  return {
    success: true,
    status: recordsList.length > 0 ? 'berhasil' : 'kosong',
    data: recordsList,
  };
}

// ============================================================================
// 5. MENANDAI MODUL SELESAI DI PROGRESS
// ============================================================================

/**
 * Menandai sebuah modul sebagai selesai di dalam progress.
 * Mencegah duplikasi modulId pada daftar completedModules.
 */
export function markModuleCompleted(
  moduleId: string,
  scope: string = DEFAULT_SCOPE
): StorageWriteResult {
  if (!moduleId || typeof moduleId !== 'string') {
    return {
      success: false,
      status: 'gagal',
      error: 'ID modul tidak valid.',
    };
  }

  const current = readAllData();
  if (current.status === 'rusak') {
    return {
      success: false,
      status: 'rusak',
      error: 'Data penyimpanan di peramban terdeteksi rusak. Progres tidak disimpan untuk mencegah penimpaan data.',
    };
  }
  if (!current.success || !current.data) {
    return {
      success: false,
      status: 'gagal',
      error: current.error || 'Gagal membaca penyimpanan lokal.',
    };
  }

  const storageData = current.data;
  const scopeObj = ensureScope(storageData, scope);

  if (!scopeObj.progress.completedModules.includes(moduleId)) {
    scopeObj.progress.completedModules.push(moduleId);
  }

  return writeFullStorage(storageData);
}

/**
 * Membaca daftar ID modul yang telah diselesaikan siswa.
 */
export function getCompletedModules(scope: string = DEFAULT_SCOPE): ReadProgressResult {
  const current = readAllData();
  if (current.status === 'rusak') {
    return {
      success: false,
      status: 'rusak',
      data: [],
      error: current.error || 'Data penyimpanan lokal terdeteksi rusak.',
    };
  }
  if (current.status === 'kosong' || !current.data) {
    return {
      success: true,
      status: 'kosong',
      data: [],
    };
  }

  const scopeObj = current.data.scopes[scope];
  if (!scopeObj || !scopeObj.progress || !Array.isArray(scopeObj.progress.completedModules)) {
    return {
      success: true,
      status: 'kosong',
      data: [],
    };
  }

  return {
    success: true,
    status: scopeObj.progress.completedModules.length > 0 ? 'berhasil' : 'kosong',
    data: [...scopeObj.progress.completedModules],
  };
}

/**
 * Memeriksa apakah suatu modul sudah ditandai selesai.
 */
export function isModuleCompleted(moduleId: string, scope: string = DEFAULT_SCOPE): boolean {
  const res = getCompletedModules(scope);
  return res.success && res.data.includes(moduleId);
}

// ============================================================================
// 6. MENGHAPUS SELURUH DATA PRODUK (Hapus Riwayat Perangkat)
// ============================================================================

/**
 * Menghapus seluruh data ChemiVerse dari perangkat.
 * Sesuai Bagian 7 docs/DATABASE.md:
 * - Menghapus seluruh isi key 'chem:chemiverse:v1'.
 * - Wajib menggunakan localStorage.removeItem(STORAGE_KEY).
 * - DILARANG menggunakan localStorage.clear() agar data situs lain tidak terhapus.
 */
export function clearAllData(): StorageWriteResult {
  const storage = getStorage();
  if (!storage) {
    return {
      success: false,
      status: 'gagal',
      error: 'LocalStorage tidak tersedia atau akses ditolak oleh peramban.',
    };
  }

  try {
    storage.removeItem(STORAGE_KEY);
    return {
      success: true,
      status: 'berhasil',
    };
  } catch (error) {
    return {
      success: false,
      status: 'gagal',
      error: error instanceof Error ? error.message : 'Gagal menghapus data dari peramban.',
    };
  }
}
export const clearChemiVerseStorage = clearAllData;
export const removeChemiVerseData = clearAllData;

