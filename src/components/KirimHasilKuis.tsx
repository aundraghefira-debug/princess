// src/components/KirimHasilKuis.tsx
// Komponen untuk mengirim hasil kuis lokal ke Firestore setelah siswa masuk.

import { useEffect, useState } from 'react';
import type { QuizRecord } from '../lib/localStore';
import {
  cloudTersedia,
  getAccess,
  listMine,
  saveAttempt,
  pesanError,
} from '../lib/firebaseService';
import type { AksesAkun } from '../lib/firebaseService';
import './KirimHasilKuis.css';

interface KirimHasilKuisProps {
  hasil: QuizRecord;
  onBerhasilKirim?: () => void;
}

export type StatusPengiriman = 'Lokal' | 'Menunggu kirim' | 'Terkirim' | 'Gagal mengirim';

export function KirimHasilKuis({ hasil, onBerhasilKirim }: KirimHasilKuisProps) {
  const [cloudAda] = useState(() => cloudTersedia());
  const [akses, setAkses] = useState<AksesAkun | null>(null);
  const [memuatAkses, setMemuatAkses] = useState(() => cloudTersedia());
  const [status, setStatus] = useState<StatusPengiriman>('Lokal');
  const [penyebabGagal, setPenyebabGagal] = useState('');
  const [konfirmasiTerbuka, setKonfirmasiTerbuka] = useState(false);

  // Periksa login dan apakah hasil ini sudah pernah dikirim sebelumnya
  useEffect(() => {
    if (!cloudAda) return;

    let aktif = true;
    void (async () => {
      try {
        const akun = await getAccess();
        if (!aktif) return;
        setAkses(akun);

        if (akun.uid) {
          const mine = await listMine();
          if (!aktif) return;
          const sudahAda = mine.some((m) => m.id === hasil.id);
          if (sudahAda) {
            setStatus('Terkirim');
          }
        }
      } catch {
        // Abaikan error saat inisialisasi awal
      } finally {
        if (aktif) setMemuatAkses(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, [cloudAda, hasil.id]);

  async function jalankanKirim() {
    setKonfirmasiTerbuka(false);
    setStatus('Menunggu kirim');
    setPenyebabGagal('');

    try {
      await saveAttempt(hasil);
      setStatus('Terkirim');
      onBerhasilKirim?.();
    } catch (e) {
      setStatus('Gagal mengirim');
      setPenyebabGagal(pesanError(e));
    }
  }

  function batalkanKirim() {
    setKonfirmasiTerbuka(false);
    // Batal = hasil tetap lokal
  }

  return (
    <div className="khk-box">
      <div className="khk-header">
        <span className="khk-title">
          <span>☁️</span>
          <span>Sinkronisasi ke Guru Kelas</span>
        </span>

        <span
          className={`status-badge ${
            status === 'Terkirim'
              ? 'is-terkirim'
              : status === 'Menunggu kirim'
                ? 'is-menunggu'
                : status === 'Gagal mengirim'
                  ? 'is-gagal'
                  : 'is-lokal'
          }`}
        >
          {status}
        </span>
      </div>

      {status === 'Terkirim' && (
        <div className="khk-success-msg">
          <span>✓ Hasil kuis ini sudah tersimpan di cloud dan dapat dibaca oleh guru kelas.</span>
        </div>
      )}

      {status === 'Menunggu kirim' && (
        <p className="khk-desc">
          Sedang mengirimkan hasil kuis ke cloud guru kelas... Mohon tunggu.
        </p>
      )}

      {status === 'Gagal mengirim' && (
        <>
          <div className="khk-error-detail" role="alert">
            <strong>Gagal mengirim:</strong> {penyebabGagal || 'Terjadi kesalahan sistem.'}
          </div>
          <div className="khk-actions">
            <button
              type="button"
              className="khk-btn khk-btn-retry"
              onClick={() => setKonfirmasiTerbuka(true)}
            >
              Coba kirim lagi
            </button>
          </div>
        </>
      )}

      {status === 'Lokal' && (
        <>
          {memuatAkses && <p className="khk-desc">Memeriksa status akun...</p>}

          {!memuatAkses && !akses?.uid && (
            <p className="khk-desc">
              Hasil kuis ini tersimpan pada perangkat Anda (Lokal). Masuk dengan akun kelas di menu{' '}
              <strong>Akun</strong> jika ingin mengirimkannya ke guru.
            </p>
          )}

          {!memuatAkses && akses?.uid && !akses.anggota && !akses.guru && (
            <p className="khk-desc">
              Akunmu ({akses.email}) belum terdaftar di daftar anggota kelas (<code>members/</code>).
              Hanya akun yang tercantum di <code>members/</code> yang boleh mengirim hasil kuis.
            </p>
          )}

          {!memuatAkses && akses?.uid && (akses.anggota || akses.guru) && !konfirmasiTerbuka && (
            <>
              <p className="khk-desc">
                Hasil ini tersimpan di perangkat lokal. Kamu dapat mengirimkannya ke guru kelas sekarang.
              </p>
              <div className="khk-actions">
                <button
                  type="button"
                  className="khk-btn khk-btn-primary"
                  onClick={() => setKonfirmasiTerbuka(true)}
                >
                  Kirim Hasil ke Guru
                </button>
              </div>
            </>
          )}

          {konfirmasiTerbuka && akses && (
            <div className="khk-confirm-panel" role="dialog" aria-labelledby="khk-dialog-title">
              <h4 id="khk-dialog-title" className="khk-confirm-title">
                Konfirmasi Pengiriman Hasil
              </h4>
              <p className="khk-confirm-meta">
                <strong>Akun tujuan:</strong> {akses.email} ({akses.anggota?.alias || 'Tanpa alias'})
              </p>
              <div className="khk-confirm-warning" role="alert">
                ⚠️ <strong>Perhatian:</strong> Guru kelas dapat membaca hasil kuis ini beserta nama/alias akunmu.
              </div>
              <div className="khk-actions">
                <button type="button" className="khk-btn khk-btn-primary" onClick={jalankanKirim}>
                  Kirim Sekarang
                </button>
                <button type="button" className="khk-btn khk-btn-ghost" onClick={batalkanKirim}>
                  Batal
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
