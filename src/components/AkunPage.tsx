import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Halaman } from '../App';
import {
  cloudTersedia,
  daftarEmail,
  getAccess,
  kirimResetSandi,
  loginGoogle,
  logout,
  masukEmail,
  pantauLogin,
  pesanError,
} from '../lib/firebaseService';
import type { AksesAkun } from '../lib/firebaseService';
import './AkunPage.css';

interface AkunPageProps {
  onNavigate: (halaman: Halaman) => void;
}

type Tampilan = 'masuk' | 'daftar' | 'lupa';

const AkunPage = ({ onNavigate }: AkunPageProps) => {
  const [tampilan, setTampilan] = useState<Tampilan>('masuk');
  const [akses, setAkses] = useState<AksesAkun | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState('');
  const [info, setInfo] = useState('');

  const [email, setEmail] = useState('');
  const [sandi, setSandi] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [ingat, setIngat] = useState(false);
  const [lihatSandi, setLihatSandi] = useState(false);

  const [cloudAda] = useState(() => cloudTersedia());

  useEffect(() => {
    if (!cloudAda) {
      setMemuat(false);
      return;
    }
    const berhenti = pantauLogin(async (user) => {
      if (!user) {
        setAkses(null);
        setMemuat(false);
        return;
      }
      try {
        setAkses(await getAccess());
      } catch {
        setGalat('Gagal membaca data akun. Coba muat ulang halaman.');
      }
      setMemuat(false);
    });
    return berhenti;
  }, [cloudAda]);

  function pindah(t: Tampilan) {
    setTampilan(t);
    setGalat('');
    setInfo('');
    setSandi('');
    setKonfirmasi('');
    setLihatSandi(false);
  }

  async function jalankan(aksi: () => Promise<unknown>) {
    setProses(true);
    setGalat('');
    setInfo('');
    try {
      await aksi();
    } catch (e) {
      setGalat(pesanError(e));
    }
    setProses(false);
  }

  function kirimForm(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setGalat('Email wajib diisi.');
      return;
    }
    if (tampilan === 'lupa') {
      void jalankan(async () => {
        await kirimResetSandi(email);
        setInfo(
          'Jika email terdaftar, tautan untuk mengatur ulang sandi sudah dikirim. Periksa kotak masuk dan folder spam.'
        );
      });
      return;
    }
    if (!sandi) {
      setGalat('Kata sandi wajib diisi.');
      return;
    }
    if (tampilan === 'daftar') {
      if (sandi.length < 6) {
        setGalat('Kata sandi minimal 6 karakter.');
        return;
      }
      if (sandi !== konfirmasi) {
        setGalat('Konfirmasi kata sandi tidak sama.');
        return;
      }
      void jalankan(() => daftarEmail(email, sandi, ingat));
      return;
    }
    void jalankan(() => masukEmail(email, sandi, ingat));
  }

  let judul = 'Lupa kata sandi';
  let subjudul = 'Masukkan emailmu, kami kirim tautan untuk mengatur ulang.';
  if (akses) {
    judul = 'Profil Saya';
    subjudul = 'Kelola akunmu di ChemiVerse.';
  } else if (tampilan === 'masuk') {
    judul = 'Selamat datang kembali';
    subjudul = 'Masuk untuk mengirim hasil kuis ke gurumu.';
  } else if (tampilan === 'daftar') {
    judul = 'Buat akun baru';
    subjudul = 'Daftar gratis. Belajar tanpa akun pun tetap bisa.';
  }

  let labelTombol = 'Kirim tautan reset';
  if (proses) labelTombol = 'Memproses...';
  else if (tampilan === 'masuk') labelTombol = 'Masuk';
  else if (tampilan === 'daftar') labelTombol = 'Daftar';

  return (
    <div className="akun-wrap">
      <div className="akun-card">
        <button type="button" className="akun-back" onClick={() => onNavigate('beranda')}>
          ← Kembali ke Beranda
        </button>

        <div className="akun-brand">
          <span className="akun-logo" aria-hidden="true">
            ⚗️
          </span>
          <span className="akun-brand-name">ChemiVerse</span>
        </div>

        <h1 className="akun-title">{judul}</h1>
        <p className="akun-sub">{subjudul}</p>

        {!cloudAda && (
          <p className="akun-alert akun-alert-warn" role="alert">
            Layanan login belum dikonfigurasi di perangkat ini. Belajar tanpa login tetap bisa.
          </p>
        )}
        {galat && (
          <p className="akun-alert akun-alert-error" role="alert">
            {galat}
          </p>
        )}
        {info && (
          <p className="akun-alert akun-alert-ok" role="status">
            {info}
          </p>
        )}

        {memuat && <p className="akun-muted">Memeriksa status login...</p>}

        {!memuat && akses && (
          <div className="akun-profil">
            <div className="akun-avatar" aria-hidden="true">
              {(akses.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <dl className="akun-data">
              <dt>Email</dt>
              <dd>{akses.email}</dd>
              <dt>Alias</dt>
              <dd>{akses.anggota ? akses.anggota.alias : '-'}</dd>
              <dt>Status</dt>
              <dd>
                <span
                  className={`akun-badge ${
                    akses.guru ? 'is-guru' : akses.anggota ? 'is-anggota' : 'is-belum'
                  }`}
                >
                  {akses.guru
                    ? 'Guru'
                    : akses.anggota
                      ? 'Anggota kelas'
                      : 'Belum terdaftar di kelas'}
                </span>
              </dd>
            </dl>
            {!akses.guru && !akses.anggota && (
              <p className="akun-muted">
                Kamu tetap bisa belajar. Hasil kuis baru bisa dikirim ke guru setelah pengelola
                menambahkan akunmu ke daftar kelas.
              </p>
            )}
            <button
              type="button"
              className="akun-btn akun-btn-outline"
              onClick={() => void jalankan(logout)}
            >
              Keluar
            </button>
          </div>
        )}

        {!memuat && !akses && (
          <>
            {tampilan !== 'lupa' && (
              <>
                <button
                  type="button"
                  className="akun-btn akun-btn-google"
                  disabled={proses || !cloudAda}
                  onClick={() => void jalankan(() => loginGoogle(ingat))}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
                    />
                  </svg>
                  Lanjutkan dengan Google
                </button>
                <div className="akun-divider">
                  <span>atau dengan email</span>
                </div>
              </>
            )}

            <form className="akun-form" onSubmit={kirimForm} noValidate>
              <label className="akun-field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              {tampilan !== 'lupa' && (
                <label className="akun-field">
                  <span>Kata sandi</span>
                  <div className="akun-pw">
                    <input
                      type={lihatSandi ? 'text' : 'password'}
                      autoComplete={tampilan === 'daftar' ? 'new-password' : 'current-password'}
                      placeholder="Minimal 6 karakter"
                      value={sandi}
                      onChange={(e) => setSandi(e.target.value)}
                    />
                    <button
                      type="button"
                      className="akun-eye"
                      onClick={() => setLihatSandi(!lihatSandi)}
                    >
                      {lihatSandi ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                </label>
              )}

              {tampilan === 'daftar' && (
                <label className="akun-field">
                  <span>Konfirmasi kata sandi</span>
                  <input
                    type={lihatSandi ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Ulangi kata sandi"
                    value={konfirmasi}
                    onChange={(e) => setKonfirmasi(e.target.value)}
                  />
                </label>
              )}

              {tampilan !== 'lupa' && (
                <div className="akun-row">
                  <label className="akun-check">
                    <input
                      type="checkbox"
                      checked={ingat}
                      onChange={(e) => setIngat(e.target.checked)}
                    />
                    <span>Ingat saya di perangkat ini</span>
                  </label>
                  {tampilan === 'masuk' && (
                    <button type="button" className="akun-link" onClick={() => pindah('lupa')}>
                      Lupa sandi?
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="akun-btn akun-btn-primary"
                disabled={proses || !cloudAda}
              >
                {labelTombol}
              </button>
            </form>

            <p className="akun-switch">
              {tampilan === 'masuk' && (
                <>
                  Belum punya akun?{' '}
                  <button type="button" className="akun-link" onClick={() => pindah('daftar')}>
                    Daftar
                  </button>
                </>
              )}
              {tampilan === 'daftar' && (
                <>
                  Sudah punya akun?{' '}
                  <button type="button" className="akun-link" onClick={() => pindah('masuk')}>
                    Masuk
                  </button>
                </>
              )}
              {tampilan === 'lupa' && (
                <button type="button" className="akun-link" onClick={() => pindah('masuk')}>
                  ← Kembali ke Masuk
                </button>
              )}
            </p>

            <button type="button" className="akun-guest" onClick={() => onNavigate('beranda')}>
              Lanjut sebagai tamu
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AkunPage;