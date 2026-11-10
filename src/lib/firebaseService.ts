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
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
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
    default:
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