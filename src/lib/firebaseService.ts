// src/lib/firebaseService.ts
// Layanan login Firebase: Google dan Email/Sandi.
// Kirim dan baca hasil kuis (attempts) mengikuti kontrak docs/DATABASE.md.
// Aturan akses: satu akun guru (settings/classroom). Akun lain yang login
// otomatis menjadi siswa (members/UID dibuat otomatis saat pertama kali masuk).

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDocsFromServer,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

interface Handles {
  auth: Auth;
  db: Firestore;
}

let handles: Handles | undefined;

function clients(): Handles {
  if (!handles) {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    if (Object.values(config).some((v) => !v)) {
      throw new Error('Konfigurasi login/cloud belum lengkap');
    }
    const app = initializeApp(config);
    handles = { auth: getAuth(app), db: getFirestore(app) };
  }
  return handles;
}

export interface AksesAkun {
  uid: string | null;
  email: string | null;
  guru: boolean;
  anggota: { alias: string } | null;
}

/** Mengubah kode error Firebase menjadi pesan bahasa Indonesia yang jelas. */
export function pesanError(error: unknown): string {
  if (error instanceof Error && error.message) {
    if (!error.message.startsWith('Firebase:') && !error.message.includes('/')) {
      return error.message;
    }
  }
  const kode = (error as { code?: string })?.code ?? '';
  switch (kode) {
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan masuk.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email atau kata sandi salah.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
    case 'auth/network-request-failed':
      return 'Tidak ada koneksi internet. Coba lagi saat online.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Login dibatalkan.';
    case 'auth/popup-blocked':
      return 'Popup diblokir browser. Izinkan popup untuk situs ini.';
    case 'permission-denied':
      return 'Akses ditolak oleh server. Pastikan kamu sudah masuk dan aturan Firestore sudah diperbarui.';
    case 'unavailable':
      return 'Layanan cloud tidak dapat dihubungi. Periksa koneksi internet.';
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return 'Terjadi kesalahan. Coba lagi.';
  }
}

/** Cek apakah konfigurasi lengkap tanpa melempar error. */
export function cloudTersedia(): boolean {
  try {
    clients();
    return true;
  } catch {
    return false;
  }
}

async function aturSesi(ingat: boolean): Promise<void> {
  const { auth } = clients();
  await setPersistence(auth, ingat ? browserLocalPersistence : browserSessionPersistence);
}

export async function getIdentity(): Promise<User | null> {
  const { auth } = clients();
  await auth.authStateReady();
  return auth.currentUser;
}

export async function loginGoogle(ingat = false): Promise<User | null> {
  const { auth } = clients();
  await aturSesi(ingat);
  await signInWithPopup(auth, new GoogleAuthProvider());
  return getIdentity();
}

export async function masukEmail(email: string, sandi: string, ingat = false): Promise<User | null> {
  const { auth } = clients();
  await aturSesi(ingat);
  await signInWithEmailAndPassword(auth, email.trim(), sandi);
  return getIdentity();
}

export async function daftarEmail(email: string, sandi: string, ingat = false): Promise<User | null> {
  const { auth } = clients();
  await aturSesi(ingat);
  await createUserWithEmailAndPassword(auth, email.trim(), sandi);
  return getIdentity();
}

export async function kirimResetSandi(email: string): Promise<void> {
  await sendPasswordResetEmail(clients().auth, email.trim());
}

export async function logout(): Promise<void> {
  await signOut(clients().auth);
}

/** Memantau perubahan status login. Mengembalikan fungsi untuk berhenti memantau. */
export function pantauLogin(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(clients().auth, callback);
}

/** Alias bawaan siswa: nama akun, atau bagian depan email. Maksimal 60 karakter. */
function aliasDariAkun(user: User): string {
  const nama = user.displayName?.trim();
  const dasar = nama || user.email?.split('@')[0] || 'Siswa';
  return dasar.slice(0, 60);
}

/**
 * Membaca peran akun.
 * - Guru: UID cocok dengan settings/classroom.teacherUid.
 * - Selain guru: siswa. Dokumen members/UID dibuat otomatis bila belum ada.
 */
export async function getAccess(): Promise<AksesAkun> {
  const user = await getIdentity();
  if (!user) return { uid: null, email: null, guru: false, anggota: null };

  const { db } = clients();
  const memberRef = doc(db, 'members', user.uid);
  const [settings, member] = await Promise.all([
    getDocFromServer(doc(db, 'settings', 'classroom')).catch(() => null),
    getDocFromServer(memberRef).catch(() => null),
  ]);

  const guru = settings?.data()?.teacherUid === user.uid;
  let dataAnggota = member?.exists() ? (member.data() as { alias?: string }) : null;

  // Siswa baru: daftarkan otomatis ke kelas
  if (!guru && !dataAnggota && member !== null) {
    const alias = aliasDariAkun(user);
    try {
      await setDoc(memberRef, { alias, createdAt: serverTimestamp() });
      dataAnggota = { alias };
    } catch {
      // Mungkin sudah dibuat oleh pemanggilan lain di saat yang sama: baca ulang
      const ulang = await getDocFromServer(memberRef).catch(() => null);
      dataAnggota = ulang?.exists() ? (ulang.data() as { alias?: string }) : null;
    }
  }

  return {
    uid: user.uid,
    email: user.email,
    guru,
    anggota: dataAnggota ? { alias: dataAnggota.alias ?? '' } : null,
  };
}

export interface AttemptRecord {
  id: string;
  ownerId: string;
  alias: string;
  moduleId: string;
  activityId: string;
  questionVersion: string;
  kind: string;
  answers: Record<string, string>;
  score: number;
  completedAt: string;
  receivedAt?: unknown;
}

/** Isi percobaan yang dikirim (tanpa receivedAt, karena itu dibuat oleh server). */
type IsiPercobaan = Omit<AttemptRecord, 'receivedAt'>;

const KUNCI_ISI: (keyof IsiPercobaan)[] = [
  'id',
  'ownerId',
  'alias',
  'moduleId',
  'activityId',
  'questionVersion',
  'kind',
  'score',
  'completedAt',
];

/** Membandingkan isi dokumen server dengan isi yang akan dikirim. */
function samaIsi(server: Record<string, unknown>, lokal: IsiPercobaan): boolean {
  for (const kunci of KUNCI_ISI) {
    if (server[kunci] !== lokal[kunci]) return false;
  }
  const jawabanServer = (server.answers ?? {}) as Record<string, unknown>;
  const kunciLokal = Object.keys(lokal.answers);
  if (Object.keys(jawabanServer).length !== kunciLokal.length) return false;
  return kunciLokal.every((k) => jawabanServer[k] === lokal.answers[k]);
}

function petakanDokumen(id: string, data: Record<string, unknown>): AttemptRecord {
  return {
    id: (data.id as string | undefined) ?? id,
    ownerId: data.ownerId as string,
    alias: data.alias as string,
    moduleId: data.moduleId as string,
    activityId: data.activityId as string,
    questionVersion: data.questionVersion as string,
    kind: data.kind as string,
    answers: data.answers as Record<string, string>,
    score: data.score as number,
    completedAt: data.completedAt as string,
    receivedAt: data.receivedAt,
  };
}

/**
 * Mengirim hasil kuis ke Firestore koleksi 'attempts'.
 * - ID percobaan tetap. Jika ID sudah ada di server dengan isi yang SAMA,
 *   dianggap berhasil tanpa menulis ulang (retry aman, tidak menggandakan data).
 * - Jika ID sudah ada tetapi isinya berbeda, pengiriman ditolak.
 * - Berhasil hanya jika server mengonfirmasi dokumen yang sama.
 * - Setiap akun siswa yang login boleh mengirim (terdaftar otomatis).
 */
export async function saveAttempt(record: {
  id: string;
  moduleId: string;
  activityId: string;
  questionVersion: string;
  kind: string;
  answers: Record<string, string>;
  score: number;
  completedAt: string;
  alias?: string;
  ownerId?: string;
}): Promise<void> {
  const user = await getIdentity();
  if (!user) {
    throw new Error('Kamu harus masuk terlebih dahulu untuk mengirim hasil.');
  }

  const access = await getAccess();
  if (!access.anggota) {
    throw new Error('Akun siswa belum dapat didaftarkan ke kelas. Periksa koneksi lalu coba kirim lagi.');
  }

  const { db } = clients();
  const ref = doc(db, 'attempts', record.id);

  // Alias harus sama persis dengan alias di members/ (diperiksa oleh Rules)
  const isi: IsiPercobaan = {
    id: record.id,
    ownerId: user.uid,
    alias: access.anggota.alias,
    moduleId: record.moduleId,
    activityId: record.activityId,
    questionVersion: record.questionVersion,
    kind: record.kind,
    answers: record.answers,
    score: record.score,
    completedAt: record.completedAt,
  };

  // 1. Sudah ada di server? Isi sama = sudah terkirim, isi beda = tolak.
  const sebelum = await getDocFromServer(ref);
  if (sebelum.exists()) {
    if (!samaIsi(sebelum.data(), isi)) {
      throw new Error('ID percobaan ini sudah berisi hasil yang berbeda di server.');
    }
    return;
  }

  // 2. Pastikan akun tidak berganti selama proses
  if ((await getIdentity())?.uid !== user.uid) {
    throw new Error('Akun pengirim berubah. Coba kirim lagi.');
  }

  // 3. Kirim. Jika gagal, periksa apakah pengiriman lain sempat berhasil.
  try {
    await setDoc(ref, { ...isi, receivedAt: serverTimestamp() });
  } catch (error) {
    const ada = await getDocFromServer(ref).catch(() => null);
    if (!ada || !ada.exists() || !samaIsi(ada.data(), isi)) throw error;
  }

  // 4. Konfirmasi dari server
  const tersimpan = await getDocFromServer(ref);
  if (!tersimpan.exists() || !samaIsi(tersimpan.data(), isi)) {
    throw new Error('Penerimaan oleh server belum terkonfirmasi. Coba kirim lagi.');
  }
}

/** Mengambil hasil percobaan milik akun yang sedang masuk (langsung dari server). */
export async function listMine(): Promise<AttemptRecord[]> {
  const user = await getIdentity();
  if (!user) return [];

  const { db } = clients();
  const q = query(collection(db, 'attempts'), where('ownerId', '==', user.uid));
  const snap = await getDocsFromServer(q);

  const list = snap.docs.map((d) => petakanDokumen(d.id, d.data()));
  list.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  return list;
}

/** Mengambil seluruh hasil kelas (hanya guru yang diizinkan oleh Rules). */
export async function listClass(): Promise<AttemptRecord[]> {
  const user = await getIdentity();
  if (!user) return [];

  const { db } = clients();
  const snap = await getDocsFromServer(collection(db, 'attempts'));

  const list = snap.docs.map((d) => petakanDokumen(d.id, d.data()));
  list.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  return list;
}