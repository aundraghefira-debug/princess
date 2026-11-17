import { useEffect, useState, useCallback } from 'react';
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
  saveAttempt,
  listMine,
  listClass,
  type AksesAkun,
  type AttemptRecord,
} from '../lib/firebaseService';
import { getAllRecords, type QuizRecord } from '../lib/localStore';
import './AkunPage.css';

interface AkunPageProps {
  onNavigate: (halaman: Halaman) => void;
}

type Tampilan = 'masuk' | 'daftar' | 'lupa';

function formatAktivitas(r: { moduleId: string; activityId: string }): string {
  if (r.activityId === 'kuis-gabungan') return 'Kuis Evaluasi (Modul 1–3)';
  if (r.activityId === 'kuis-belajar') return 'Kuis Belajar (Modul 1–3)';
  if (r.moduleId === 'modul_1' || r.moduleId === 'modul-1') return 'Kuis Modul 1';
  if (r.moduleId === 'modul_2' || r.moduleId === 'modul-2') return 'Kuis Modul 2';
  if (r.moduleId === 'modul_3' || r.moduleId === 'modul-3') return 'Kuis Modul 3';
  return `${r.moduleId}: ${r.activityId}`;
}

function formatWaktu(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return isoString;
  }
}

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

  // Data riwayat kuis lokal dan cloud
  const [localRecords, setLocalRecords] = useState<QuizRecord[]>([]);
  const [classAttempts, setClassAttempts] = useState<AttemptRecord[]>([]);
  const [memuatRiwayat, setMemuatRiwayat] = useState(false);
  const [selectedRecordForConfirm, setSelectedRecordForConfirm] = useState<QuizRecord | null>(null);
  const [statusMap, setStatusMap] = useState<
    Record<string, { status: 'Lokal' | 'Menunggu kirim' | 'Terkirim' | 'Gagal mengirim'; error?: string }>
  >({});

  const muatDataRiwayat = useCallback(async (currentAkses: AksesAkun | null) => {
    const resLocal = getAllRecords();
    const records = resLocal.status === 'rusak' ? [] : resLocal.data;
    setLocalRecords(records);

    if (currentAkses?.uid) {
      setMemuatRiwayat(true);
      try {
        const mine = await listMine();

        const newMap: Record<
          string,
          { status: 'Lokal' | 'Menunggu kirim' | 'Terkirim' | 'Gagal mengirim'; error?: string }
        > = {};
        for (const r of records) {
          const sudah = mine.some((m) => m.id === r.id);
          newMap[r.id] = { status: sudah ? 'Terkirim' : 'Lokal' };
        }
        setStatusMap(newMap);

        if (currentAkses.guru) {
          const allClass = await listClass();
          setClassAttempts(allClass);
        }
      } catch (e) {
        console.error('Gagal memuat riwayat kuis cloud:', e);
      } finally {
        setMemuatRiwayat(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!cloudAda) {
      setMemuat(false);
      return;
    }
    const berhenti = pantauLogin(async (user) => {
      if (!user) {
        setAkses(null);
        setMemuat(false);
        setLocalRecords([]);
        setClassAttempts([]);
        return;
      }
      try {
        const akun = await getAccess();
        setAkses(akun);
        await muatDataRiwayat(akun);
      } catch {
        setGalat('Gagal membaca data akun. Coba muat ulang halaman.');
      }
      setMemuat(false);
    });
    return berhenti;
  }, [cloudAda, muatDataRiwayat]);

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

  async function prosesKirim(record: QuizRecord) {
    if (!akses?.anggota && !akses?.guru) {
      setGalat('Hanya akun yang tercantum di daftar kelas (members/) yang boleh mengirim.');
      setSelectedRecordForConfirm(null);
      return;
    }

    setSelectedRecordForConfirm(null);
    setStatusMap((prev) => ({
      ...prev,
      [record.id]: { status: 'Menunggu kirim' },
    }));

    try {
      await saveAttempt(record);
      setStatusMap((prev) => ({
        ...prev,
        [record.id]: { status: 'Terkirim' },
      }));
      if (akses.guru) {
        const allClass = await listClass();
        setClassAttempts(allClass);
      }
    } catch (e) {
      setStatusMap((prev) => ({
        ...prev,
        [record.id]: {
          status: 'Gagal mengirim',
          error: pesanError(e),
        },
      }));
    }
  }

  let judul = 'Lupa kata sandi';
  let subjudul = 'Masukkan emailmu, kami kirim tautan untuk mengatur ulang.';
  if (akses) {
    judul = 'Profil Saya';
    subjudul = 'Kelola akunmu di ChemiVerse dan kirim hasil kuis ke guru kelas.';
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
      <div className={`akun-card ${akses ? 'is-logged-in' : ''}`}>
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
                menambahkan akunmu ke daftar kelas (<code>members/</code>).
              </p>
            )}

            {/* Modal / Dialog Konfirmasi Pengiriman */}
            {selectedRecordForConfirm && (
              <div className="akun-confirm-card" role="dialog" aria-labelledby="confirm-heading">
                <h3 id="confirm-heading" className="akun-confirm-heading">
                  Konfirmasi Kirim Hasil Kuis
                </h3>
                <p className="akun-confirm-info">
                  <strong>Kuis:</strong> {formatAktivitas(selectedRecordForConfirm)} (Skor:{' '}
                  {selectedRecordForConfirm.score})
                  <br />
                  <strong>Waktu selesai:</strong> {formatWaktu(selectedRecordForConfirm.completedAt)}
                </p>
                <div className="akun-confirm-target">
                  <strong>Akun tujuan:</strong> {akses.email} ({akses.anggota?.alias || 'Tanpa alias'})
                </div>
                <div className="akun-confirm-alert" role="alert">
                  ⚠️ <strong>Perhatian:</strong> Guru kelas dapat membaca hasil kuis ini beserta nama/alias akunmu.
                </div>
                <div className="akun-confirm-btns">
                  <button
                    type="button"
                    className="akun-btn akun-btn-primary akun-btn-sm"
                    onClick={() => void prosesKirim(selectedRecordForConfirm)}
                  >
                    Kirim Sekarang
                  </button>
                  <button
                    type="button"
                    className="akun-btn akun-btn-outline akun-btn-sm"
                    onClick={() => setSelectedRecordForConfirm(null)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Daftar Hasil Kuis Lokal untuk Siswa */}
            <div className="akun-sync-section">
              <div className="akun-sync-head">
                <h3 className="akun-sync-title">Hasil Kuis di Perangkat Ini</h3>
                <span className="akun-sync-count">{localRecords.length} hasil</span>
              </div>
              <p className="akun-sync-sub">
                Pilih hasil lokal yang ingin kamu kirimkan ke guru kelas.
              </p>

              {memuatRiwayat && <p className="akun-muted">Memeriksa status pengiriman cloud...</p>}

              {!memuatRiwayat && localRecords.length === 0 && (
                <p className="akun-sync-empty">
                  Belum ada hasil kuis lokal di perangkat ini. Coba kerjakan kuis terlebih dahulu di menu{' '}
                  <button type="button" className="akun-link" onClick={() => onNavigate('kuis')}>
                    Kuis
                  </button>
                  .
                </p>
              )}

              {!memuatRiwayat && localRecords.length > 0 && (
                <ul className="akun-record-list">
                  {localRecords.map((r) => {
                    const infoStatus = statusMap[r.id] ?? { status: 'Lokal' };
                    const isTerkirim = infoStatus.status === 'Terkirim';
                    const isMenunggu = infoStatus.status === 'Menunggu kirim';
                    const isGagal = infoStatus.status === 'Gagal mengirim';
                    const isLokal = infoStatus.status === 'Lokal';
                    const bolehKirim = Boolean(akses.anggota || akses.guru);

                    return (
                      <li key={r.id} className="akun-record-item">
                        <div className="akun-record-top">
                          <span className="akun-record-nama">{formatAktivitas(r)}</span>
                          <span
                            className={`status-badge ${
                              isTerkirim
                                ? 'is-terkirim'
                                : isMenunggu
                                  ? 'is-menunggu'
                                  : isGagal
                                    ? 'is-gagal'
                                    : 'is-lokal'
                            }`}
                          >
                            {infoStatus.status}
                          </span>
                        </div>

                        <div className="akun-record-meta">
                          <span>
                            Skor: <strong>{r.score}</strong> ({r.correctCount}/{r.totalQuestions} benar)
                          </span>
                          <span>•</span>
                          <span>{formatWaktu(r.completedAt)}</span>
                        </div>

                        {isGagal && (
                          <div className="akun-record-error" role="alert">
                            <strong>Penyebab:</strong> {infoStatus.error || 'Terjadi kesalahan sistem.'}
                          </div>
                        )}

                        <div className="akun-record-actions">
                          {isLokal && (
                            <button
                              type="button"
                              className="akun-btn-pilih"
                              disabled={!bolehKirim}
                              onClick={() => setSelectedRecordForConfirm(r)}
                              title={
                                bolehKirim
                                  ? 'Kirim hasil ini ke guru kelas'
                                  : 'Hanya akun yang tercantum di members/ yang boleh mengirim'
                              }
                            >
                              Kirim ke Kelas
                            </button>
                          )}
                          {isGagal && (
                            <button
                              type="button"
                              className="akun-btn-pilih is-retry"
                              disabled={!bolehKirim}
                              onClick={() => setSelectedRecordForConfirm(r)}
                            >
                              Coba Kirim Lagi
                            </button>
                          )}
                          {isMenunggu && (
                            <span className="akun-record-sending">Mengirim...</span>
                          )}
                          {isTerkirim && (
                            <span className="akun-record-done">✓ Sudah tersimpan di cloud</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Pantauan Kelas untuk Guru */}
            {akses.guru && (
              <div className="akun-guru-section">
                <div className="akun-sync-head">
                  <h3 className="akun-sync-title">Hasil Kuis Seluruh Siswa Kelas</h3>
                  <span className="akun-sync-count">{classAttempts.length} kiriman</span>
                </div>

                {classAttempts.length === 0 ? (
                  <p className="akun-muted">Belum ada siswa yang mengirimkan hasil kuis.</p>
                ) : (
                  <div className="akun-guru-table-wrap">
                    <table className="akun-guru-table">
                      <thead>
                        <tr>
                          <th>Siswa</th>
                          <th>Aktivitas</th>
                          <th>Skor</th>
                          <th>Waktu Selesai</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classAttempts.map((ca) => (
                          <tr key={ca.id}>
                            <td>
                              <strong>{ca.alias || 'Tanpa alias'}</strong>
                            </td>
                            <td>{formatAktivitas(ca)}</td>
                            <td>
                              <span className="akun-table-skor">{ca.score}</span>
                            </td>
                            <td>{formatWaktu(ca.completedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
