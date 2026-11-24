// src/components/KirimHasilKuis.tsx
// Hasil kuis otomatis dikirim ke guru bila siswa sudah login.
// Jika gagal, tombol "Coba kirim lagi" tetap memakai ID percobaan yang sama.

import { useEffect, useRef, useState } from 'react';
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
  const sudahOtomatisRef = useRef<string | null>(null);

  async function jalankanKirim() {
    setKonfirmasiTerbuka(false);
    setStatus('Menunggu kirim');
    setPenyebabGagal('');
    try {
      await saveAttempt(hasil); // hasil.id sama => retry aman
      setStatus('Terkirim');
      onBerhasilKirim?.();
    } catch (e) {
      setStatus('Gagal mengirim');
      setPenyebabGagal(pesanError(e));
    }
  }

  // Periksa akun, lalu kirim otomatis (sekali per ID percobaan)
  useEffect(() => {
    if (!cloudAda) return;
    let aktif = true;
    void (async () => {
      try {
        const akun = await getAccess();
        if (!aktif) return;
        setAkses(akun);
        if (!akun.uid || akun.guru || !akun.anggota) return;

        const mine = await listMine();
        if (!aktif) return;
        if (mine.some((m) => m.id === hasil.id)) {
          setStatus('Terkirim');
          return;
        }
        if (sudahOtomatisRef.current === hasil.id) return;
        sudahOtomatisRef.current = hasil.id;
        await jalankanKirim();
      } catch {
        // Abaikan error saat inisialisasi awal
      } finally {
        if (aktif) setMemuatAkses(false);
      }
    })();
    return () => {
      aktif = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudAda, hasil.id]);

  const bolehKirim = Boolean(akses?.uid && akses.anggota && !akses.guru);

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
          <span>✓ Hasil kuis sudah terkirim ke guru kelas.</span>
        </div>
      )}

      {status === 'Menunggu kirim' && (
        <p className="khk-desc">Mengirim hasil kuis ke guru kelas... Mohon tunggu.</p>
      )}

      {status === 'Gagal mengirim' && (
        <>
          <div className="khk-error-detail" role="alert">
            <strong>Gagal mengirim:</strong> {penyebabGagal || 'Terjadi kesalahan sistem.'}
          </div>
          {!konfirmasiTerbuka && (
            <div className="khk-actions">
              <button
                type="button"
                className="khk-btn khk-btn-retry"
                onClick={() => setKonfirmasiTerbuka(true)}
              >
                Coba kirim lagi
              </button>
            </div>
          )}
        </>
      )}

      {status === 'Lokal' && (
        <>
          {memuatAkses && <p className="khk-desc">Memeriksa status akun...</p>}
          {!memuatAkses && !akses?.uid && (
            <p className="khk-desc">
              Hasil tersimpan di perangkat ini saja. Masuk dengan akun di menu <strong>Akun</strong>{' '}
              agar hasil kuis berikutnya langsung terkirim ke guru.
            </p>
          )}
          {!memuatAkses && akses?.uid && akses.guru && (
            <p className="khk-desc">Akun guru tidak mengirim hasil kuis.</p>
          )}
          {!memuatAkses && akses?.uid && !akses.guru && !akses.anggota && (
            <p className="khk-desc">
              Akun belum terdaftar sebagai siswa. Buka menu <strong>Akun</strong> lalu tekan
              "Coba daftarkan ulang".
            </p>
          )}
          {!memuatAkses && bolehKirim && (
            <div className="khk-actions">
              <button
                type="button"
                className="khk-btn khk-btn-primary"
                onClick={() => setKonfirmasiTerbuka(true)}
              >
                Kirim Hasil ke Guru
              </button>
            </div>
          )}
        </>
      )}

      {konfirmasiTerbuka && akses && (status === 'Lokal' || status === 'Gagal mengirim') && (
        <div className="khk-confirm-panel" role="dialog" aria-labelledby="khk-dialog-title">
          <h4 id="khk-dialog-title" className="khk-confirm-title">
            Konfirmasi Pengiriman Hasil
          </h4>
          <p className="khk-confirm-meta">
            <strong>Akun tujuan:</strong> {akses.email} ({akses.anggota?.alias || 'Tanpa alias'})
          </p>
          <div className="khk-actions">
            <button type="button" className="khk-btn khk-btn-primary" autoFocus onClick={jalankanKirim}>
              Kirim Sekarang
            </button>
            <button
              type="button"
              className="khk-btn khk-btn-ghost"
              onClick={() => setKonfirmasiTerbuka(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}