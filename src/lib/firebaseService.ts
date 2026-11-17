// src/lib/firebaseService.ts
// Layanan login Firebase: Google dan Email/Sandi.
// Kirim/baca hasil kuis ditambahkan pada tahap berikutnya.

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
  getDocs,
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
      return 'Akses ditolak. Pastikan akunmu terdaftar di daftar kelas (members/).';
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

/** Membaca peran akun: guru (UID di settings/classroom) dan anggota kelas (members/UID). */
export async function getAccess(): Promise<AksesAkun> {
  const user = await getIdentity();
  if (!user) return { uid: null, email: null, guru: false, anggota: null };

  const { db } = clients();
  const [settings, member] = await Promise.all([
    getDocFromServer(doc(db, 'settings', 'classroom')).catch(() => null),
    getDocFromServer(doc(db, 'members', user.uid)).catch(() => null),
  ]);

  const dataAnggota = member?.exists() ? (member.data() as { alias?: string }) : null;
  return {
    uid: user.uid,
    email: user.email,
    guru: settings?.data()?.teacherUid === user.uid,
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

/**
 * Menyimpan hasil kuis ke Firestore koleksi 'attempts'.
 * Mengikuti Lampiran B-A3 dan kontrak DATABASE.md.
 * Menggunakan doc(db, 'attempts', attempt.id) dan setDoc agar ID percobaan tetap sama
 * dan pengiriman ulang (retry) tidak menggandakan data.
 * Hanya akun yang tercantum di members/ yang boleh mengirim.
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
    throw new Error('Hanya akun yang tercantum di daftar kelas (members/) yang boleh mengirim hasil.');
  }

  const { db } = clients();
  const docRef = doc(db, 'attempts', record.id);

  // Field persis sesuai kontrak Lampiran B-A3 dan DATABASE.md
  const payload = {
    id: record.id,
    ownerId: user.uid,
    alias: access.anggota.alias || record.alias || '',
    moduleId: record.moduleId,
    activityId: record.activityId,
    questionVersion: record.questionVersion,
    kind: record.kind,
    answers: record.answers,
    score: record.score,
    completedAt: record.completedAt,
    receivedAt: serverTimestamp(),
  };

  await setDoc(docRef, payload);
}

/**
 * Mengambil seluruh hasil percobaan milik siswa yang sedang masuk.
 */
export async function listMine(): Promise<AttemptRecord[]> {
  const user = await getIdentity();
  if (!user) return [];

  const { db } = clients();
  const q = query(collection(db, 'attempts'), where('ownerId', '==', user.uid));
  const snap = await getDocs(q);

  const list: AttemptRecord[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: data.id ?? d.id,
      ownerId: data.ownerId,
      alias: data.alias,
      moduleId: data.moduleId,
      activityId: data.activityId,
      questionVersion: data.questionVersion,
      kind: data.kind,
      answers: data.answers,
      score: data.score,
      completedAt: data.completedAt,
      receivedAt: data.receivedAt,
    };
  });

  list.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  return list;
}

/**
 * Mengambil seluruh hasil percobaan siswa di kelas (untuk peran guru).
 */
export async function listClass(): Promise<AttemptRecord[]> {
  const user = await getIdentity();
  if (!user) return [];

  const { db } = clients();
  const snap = await getDocs(collection(db, 'attempts'));

  const list: AttemptRecord[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: data.id ?? d.id,
      ownerId: data.ownerId,
      alias: data.alias,
      moduleId: data.moduleId,
      activityId: data.activityId,
      questionVersion: data.questionVersion,
      kind: data.kind,
      answers: data.answers,
      score: data.score,
      completedAt: data.completedAt,
      receivedAt: data.receivedAt,
    };
  });

  list.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  return list;
}