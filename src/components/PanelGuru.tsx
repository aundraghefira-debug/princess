// src/components/PanelGuru.tsx
// Halaman Panel Guru ChemiVerse (Khusus Akun Guru)
// Tahap 2: Kartu ringkasan, grafik batang SVG/CSS, daftar siswa & filter, menu dan proteksi guru.

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { Halaman } from '../App';
import {
  cloudTersedia,
  getAccess,
  listClass,
  pesanError,
  type AttemptRecord,
  type AksesAkun,
} from '../lib/firebaseService';
import {
  hitungRingkasanKelas,
  ekstrakStatusSiswa,
  filterDanUrutSiswa,
  MODUL_IDS,
  BATAS_TUNTAS,
  type ModulId,
  type StatusSiswa,
  type RingkasanKelas,
} from '../lib/analisisHasil';
import './PanelGuru.css';

interface PanelGuruProps {
  onNavigate: (halaman: Halaman) => void;
  onPilihSiswa?: (siswa: StatusSiswa) => void;
}

function formatWaktuIndonesia(isoString: string): string {
  if (!isoString) return '-';
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

export const PanelGuru: FC<PanelGuruProps> = ({ onNavigate, onPilihSiswa }) => {
  const [cloudAda] = useState(() => cloudTersedia());
  const [akses, setAkses] = useState<AksesAkun | null>(null);
  const [memuatAkses, setMemuatAkses] = useState(() => cloudTersedia());
  const [memuatData, setMemuatData] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  // Filter & pengurutan daftar siswa
  const [filterMode, setFilterMode] = useState<'semua' | 'diagnostic' | 'practice'>('semua');
  const [urutBerdasarkan, setUrutBerdasarkan] = useState<'skor' | 'waktu' | 'nama'>('skor');
  const [arahUrutan, setArahUrutan] = useState<'asc' | 'desc'>('desc');
  const [kataKunciCari, setKataKunciCari] = useState('');

  // 1. Muat akses guru dan data kelas
  useEffect(() => {
    if (!cloudAda) return;
    let aktif = true;

    async function inisialisasi() {
      try {
        const acc = await getAccess();
        if (!aktif) return;
        setAkses(acc);

        if (acc.guru) {
          setMemuatData(true);
          const data = await listClass();
          if (aktif) setAttempts(data);
        }
      } catch (err) {
        if (aktif) setGalat(pesanError(err));
      } finally {
        if (aktif) {
          setMemuatAkses(false);
          setMemuatData(false);
        }
      }
    }

    void inisialisasi();
    return () => {
      aktif = false;
    };
  }, [cloudAda]);

  // Tombol muat ulang data
  const handleRefresh = async () => {
    if (!akses?.guru) return;
    try {
      setMemuatData(true);
      setGalat(null);
      const data = await listClass();
      setAttempts(data);
    } catch (err) {
      setGalat(pesanError(err));
    } finally {
      setMemuatData(false);
    }
  };

  // 2. Tampilan: Sedang memeriksa akses
  if (memuatAkses) {
    return (
      <div className="pg-wrap">
        <div className="pg-container">
          <div className="pg-state-card">
            <div className="pg-spinner" aria-hidden="true"></div>
            <h2>Memeriksa Akses Akun...</h2>
            <p>Memverifikasi hak akses guru pada sistem cloud ChemiVerse.</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tampilan: Akses ditolak (Bukan Guru atau Belum Login)
  if (!akses || !akses.guru) {
    return (
      <div className="pg-wrap">
        <div className="pg-container">
          <div className="pg-top-bar">
            <button
              type="button"
              className="pg-btn-back"
              onClick={() => onNavigate('beranda')}
            >
              ← Kembali ke Beranda
            </button>
          </div>

          <div className="pg-state-card">
            <div className="pg-state-icon" aria-hidden="true">
              🔒
            </div>
            <h2>Akses Ditolak</h2>
            <p>
              Halaman <strong>Panel Guru</strong> hanya dapat diakses oleh akun guru yang
              terdaftar di konfigurasi kelas (<code>settings/classroom</code>).
            </p>
            {!akses?.uid ? (
              <button
                type="button"
                className="pg-btn-primary"
                onClick={() => onNavigate('akun')}
              >
                Masuk dengan Akun Guru
              </button>
            ) : (
              <p className="akun-muted">
                Masuk sebagai: <strong>{akses.email || akses.uid}</strong> (Akun Siswa/Anggota)
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Kalkulasi data statistik kelas & siswa
  const ringkasan: RingkasanKelas = hitungRingkasanKelas(attempts);
  const statusSiswaList: StatusSiswa[] = ekstrakStatusSiswa(attempts);

  // Filter teks pencarian nama
  const filteredByName = kataKunciCari.trim()
    ? statusSiswaList.filter((s) =>
        s.alias.toLowerCase().includes(kataKunciCari.trim().toLowerCase())
      )
    : statusSiswaList;

  // Filter mode & urutkan
  const siswaTerurut = filterDanUrutSiswa(
    filteredByName,
    filterMode,
    urutBerdasarkan,
    arahUrutan
  );

  return (
    <div className="pg-wrap">
      <div className="pg-container">
        {/* Bar Navigasi Atas */}
        <div className="pg-top-bar">
          <button
            type="button"
            className="pg-btn-back"
            onClick={() => onNavigate('beranda')}
          >
            ← Kembali ke Beranda
          </button>

          <button
            type="button"
            className="pg-btn-refresh"
            onClick={() => void handleRefresh()}
            disabled={memuatData}
          >
            {memuatData ? 'Memperbarui...' : '🔄 Segarkan Data'}
          </button>
        </div>

        {/* Header Panel Guru */}
        <header className="pg-header">
          <div className="pg-header-text">
            <h1>
              <span>Panel Guru</span>
              <span className="pg-guru-badge">Akun Guru</span>
            </h1>
            <p>
              Pantauan hasil kuis, ketuntasan modul, dan miskonsepsi siswa kelas secara
              real-time.
            </p>
          </div>
        </header>

        {/* Notifikasi Galat Firestore bila ada */}
        {galat && (
          <div className="pg-state-card" role="alert" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--merah)', fontWeight: 700, marginBottom: '0.4rem' }}>
              ⚠️ Gagal Memuat Data dari Cloud
            </div>
            <p style={{ margin: '0 0 1rem' }}>{galat}</p>
            <button
              type="button"
              className="pg-btn-primary"
              onClick={() => void handleRefresh()}
            >
              Coba Muat Lagi
            </button>
          </div>
        )}

        {/* Jika belum ada data sama sekali */}
        {!galat && attempts.length === 0 && !memuatData && (
          <div className="pg-state-card">
            <div className="pg-state-icon" aria-hidden="true">
              📭
            </div>
            <h2>Belum Ada Hasil Kuis Terkirim</h2>
            <p>
              Siswa-siswi di kelas belum mengirimkan hasil kuis lokal ke Firestore. Begitu
              siswa menekan tombol &quot;Kirim ke Kelas&quot; di menu Akun atau Kuis, hasilnya
              akan langsung muncul di sini.
            </p>
          </div>
        )}

        {/* 1. KARTU RINGKASAN STATISTIK */}
        {attempts.length > 0 && (
          <>
            <div className="pg-summary-grid">
              {/* Kartu 1: Jumlah Siswa Mengirim */}
              <div className="pg-summary-card">
                <div>
                  <div className="pg-card-label">Siswa Mengirim</div>
                  <div className="pg-card-value">{ringkasan.jumlahSiswa}</div>
                  <p className="pg-card-sub">
                    {ringkasan.jumlahSiswaEvaluasi} sudah mengikuti Mode Evaluasi
                  </p>
                </div>
              </div>

              {/* Kartu 2: Total Percobaan */}
              <div className="pg-summary-card">
                <div>
                  <div className="pg-card-label">Total Percobaan</div>
                  <div className="pg-card-value">{ringkasan.totalPercobaan}</div>
                  <p className="pg-card-sub">
                    {ringkasan.totalPercobaanEvaluasi} Evaluasi · {ringkasan.totalPercobaanBelajar} Belajar
                  </p>
                </div>
              </div>

              {/* Kartu 3: Rata-Rata Skor Evaluasi */}
              <div className="pg-summary-card">
                <div>
                  <div className="pg-card-label">Rata-Rata Evaluasi</div>
                  <div className="pg-card-value">
                    {ringkasan.jumlahSiswaEvaluasi > 0
                      ? ringkasan.rataRataSkorEvaluasi
                      : '-'}
                    {ringkasan.jumlahSiswaEvaluasi > 0 && (
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--teks-redup)' }}>
                        /100
                      </span>
                    )}
                  </div>
                  <p className="pg-card-sub">
                    Berdasarkan evaluasi terbaru {ringkasan.jumlahSiswaEvaluasi} siswa
                  </p>
                </div>
              </div>

              {/* Kartu 4: Persentase Siswa Tuntas per Modul */}
              <div className="pg-summary-card">
                <div>
                  <div className="pg-card-label">Persentase Tuntas (≥60)</div>
                  <div className="pg-module-pass-list">
                    <div className="pg-module-pass-item">
                      <span>Modul 1 (Teori)</span>
                      <strong className="pg-module-pass-pct">
                        {ringkasan.persentaseTuntas.modul_1}%
                      </strong>
                    </div>
                    <div className="pg-module-pass-item">
                      <span>Modul 2 (pH)</span>
                      <strong className="pg-module-pass-pct">
                        {ringkasan.persentaseTuntas.modul_2}%
                      </strong>
                    </div>
                    <div className="pg-module-pass-item">
                      <span>Modul 3 (Titrasi)</span>
                      <strong className="pg-module-pass-pct">
                        {ringkasan.persentaseTuntas.modul_3}%
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GRAFIK BATANG RATA-RATA SKOR PER MODUL (SVG Mandiri) */}
            <section className="pg-section-card" aria-labelledby="pg-chart-title">
              <div className="pg-section-header">
                <div>
                  <h2 id="pg-chart-title">Rata-Rata Skor per Modul (Mode Evaluasi)</h2>
                  <p>
                    Perbandingan rata-rata pencapaian materi siswa pada Modul 1, 2, dan 3.
                  </p>
                </div>
              </div>

              <div className="pg-chart-container">
                {/* Custom SVG Bar Chart */}
                <svg
                  className="pg-chart-svg"
                  viewBox="0 0 600 240"
                  role="img"
                  aria-label="Grafik batang rata-rata skor per modul"
                >
                  <defs>
                    <linearGradient id="barGradPass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="barGradFail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines horizontal (0, 20, 40, 60, 80, 100) */}
                  {[0, 20, 40, 60, 80, 100].map((val) => {
                    // y: 100 -> 30, 0 -> 190. Height = 160. Per poin = 1.6
                    const y = 190 - val * 1.6;
                    const isBatas = val === BATAS_TUNTAS;
                    return (
                      <g key={val}>
                        <line
                          x1="70"
                          y1={y}
                          x2="560"
                          y2={y}
                          stroke={isBatas ? '#7c3aed' : '#e4d9f5'}
                          strokeWidth={isBatas ? '2' : '1'}
                          strokeDasharray={isBatas ? '6 4' : undefined}
                        />
                        <text
                          x="60"
                          y={y + 4}
                          fontSize="11"
                          fill={isBatas ? '#7c3aed' : '#8b7ca6'}
                          textAnchor="end"
                          fontWeight={isBatas ? '700' : '500'}
                        >
                          {val}
                        </text>
                        {isBatas && (
                          <text
                            x="555"
                            y={y - 6}
                            fontSize="10"
                            fill="#7c3aed"
                            textAnchor="end"
                            fontWeight="700"
                          >
                            Batas Tuntas (60)
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Garis sumbu X dasar */}
                  <line x1="70" y1="190" x2="560" y2="190" stroke="#c4b5fd" strokeWidth="2" />

                  {/* Tiga Batang Modul */}
                  {MODUL_IDS.map((mid, idx) => {
                    const skor = ringkasan.rataRataPerModul[mid] || 0;
                    const barWidth = 75;
                    const xCenter = 150 + idx * 150;
                    const xBar = xCenter - barWidth / 2;
                    const barHeight = Math.max(skor * 1.6, 2);
                    const yBar = 190 - barHeight;
                    const tuntas = skor >= BATAS_TUNTAS;

                    const namaModul =
                      mid === 'modul_1'
                        ? 'Modul 1: Teori'
                        : mid === 'modul_2'
                        ? 'Modul 2: pH'
                        : 'Modul 3: Titrasi';

                    return (
                      <g key={mid}>
                        {/* Batang */}
                        <rect
                          x={xBar}
                          y={yBar}
                          width={barWidth}
                          height={barHeight}
                          rx="8"
                          fill={tuntas ? 'url(#barGradPass)' : 'url(#barGradFail)'}
                        />

                        {/* Angka Label di Atas Batang */}
                        <text
                          x={xCenter}
                          y={yBar - 8}
                          fontSize="13"
                          fontWeight="800"
                          fill={tuntas ? '#047857' : '#b45309'}
                          textAnchor="middle"
                        >
                          {skor > 0 ? skor.toFixed(1) : '0'}
                        </text>

                        {/* Label Sumbu X di Bawah Batang */}
                        <text
                          x={xCenter}
                          y="212"
                          fontSize="12"
                          fontWeight="700"
                          fill="#3b2a57"
                          textAnchor="middle"
                        >
                          {namaModul}
                        </text>
                        <text
                          x={xCenter}
                          y="228"
                          fontSize="10"
                          fill="#6b5b86"
                          textAnchor="middle"
                        >
                          {ringkasan.persentaseTuntas[mid]}% siswa tuntas
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Keterangan Grafik */}
                <div className="pg-chart-legend">
                  <div className="pg-legend-item">
                    <span className="pg-legend-dot tuntas" aria-hidden="true"></span>
                    <span>Rata-Rata Tuntas (≥60)</span>
                  </div>
                  <div className="pg-legend-item">
                    <span className="pg-legend-dot belum" aria-hidden="true"></span>
                    <span>Rata-Rata Belum Tuntas (&lt;60)</span>
                  </div>
                  <div className="pg-legend-item">
                    <span className="pg-legend-line" aria-hidden="true"></span>
                    <span>Garis Batas Tuntas (60)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. DAFTAR SISWA & FILTER */}
            <section className="pg-section-card" aria-labelledby="pg-students-title">
              <div className="pg-section-header">
                <div>
                  <h2 id="pg-students-title">Daftar Hasil Siswa</h2>
                  <p>
                    Rincian perolehan skor kuis evaluasi dan status ketuntasan per modul.
                  </p>
                </div>
              </div>

              {/* Bar Alat Filter dan Pencarian */}
              <div className="pg-filter-bar">
                {/* Tab Filter Mode */}
                <div className="pg-mode-tabs" role="tablist" aria-label="Filter Mode Percobaan">
                  <button
                    type="button"
                    className={`pg-tab-btn ${filterMode === 'semua' ? 'active' : ''}`}
                    onClick={() => setFilterMode('semua')}
                  >
                    Semua ({statusSiswaList.length})
                  </button>
                  <button
                    type="button"
                    className={`pg-tab-btn ${filterMode === 'diagnostic' ? 'active' : ''}`}
                    onClick={() => setFilterMode('diagnostic')}
                  >
                    Evaluasi ({statusSiswaList.filter((s) => s.percobaanEvaluasiCount > 0).length})
                  </button>
                  <button
                    type="button"
                    className={`pg-tab-btn ${filterMode === 'practice' ? 'active' : ''}`}
                    onClick={() => setFilterMode('practice')}
                  >
                    Belajar ({statusSiswaList.filter((s) => s.percobaanBelajarCount > 0).length})
                  </button>
                </div>

                {/* Search & Sort */}
                <div className="pg-filter-right">
                  <input
                    type="text"
                    className="pg-search-input"
                    placeholder="Cari nama siswa..."
                    value={kataKunciCari}
                    onChange={(e) => setKataKunciCari(e.target.value)}
                    aria-label="Cari nama siswa"
                  />

                  <select
                    className="pg-sort-select"
                    value={urutBerdasarkan}
                    onChange={(e) =>
                      setUrutBerdasarkan(e.target.value as 'skor' | 'waktu' | 'nama')
                    }
                    aria-label="Urutkan berdasarkan"
                  >
                    <option value="skor">Urut: Skor Evaluasi</option>
                    <option value="waktu">Urut: Waktu Kirim</option>
                    <option value="nama">Urut: Nama Siswa</option>
                  </select>

                  <button
                    type="button"
                    className="pg-btn-arah"
                    onClick={() => setArahUrutan((a) => (a === 'asc' ? 'desc' : 'asc'))}
                    title="Ubah Arah Urutan"
                  >
                    {urutBerdasarkan === 'nama'
                      ? arahUrutan === 'asc'
                        ? 'A → Z'
                        : 'Z → A'
                      : arahUrutan === 'asc'
                      ? '↑ Rendah'
                      : '↓ Tinggi'}
                  </button>
                </div>
              </div>

              {/* Tabel Siswa */}
              <div className="pg-table-wrap">
                <table className="pg-table">
                  <thead>
                    <tr>
                      <th>Siswa</th>
                      <th style={{ textAlign: 'center' }}>Skor Evaluasi</th>
                      <th style={{ textAlign: 'center' }}>Modul 1 (Teori)</th>
                      <th style={{ textAlign: 'center' }}>Modul 2 (pH)</th>
                      <th style={{ textAlign: 'center' }}>Modul 3 (Titrasi)</th>
                      <th>Waktu Kirim</th>
                      <th>Riwayat</th>
                      <th style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswaTerurut.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--teks-redup)' }}>
                          Tidak ada siswa yang sesuai dengan filter atau kata kunci.
                        </td>
                      </tr>
                    ) : (
                      siswaTerurut.map((siswa) => {
                        const avatarLetter = (siswa.alias || 'S').charAt(0).toUpperCase();

                        return (
                          <tr key={siswa.ownerId}>
                            {/* Nama Siswa */}
                            <td>
                              <div className="pg-siswa-cell">
                                <span className="pg-avatar">{avatarLetter}</span>
                                <div className="pg-siswa-info">
                                  <span className="pg-siswa-name">{siswa.alias}</span>
                                  <span className="pg-siswa-id">UID: {siswa.ownerId.slice(0, 8)}...</span>
                                </div>
                              </div>
                            </td>

                            {/* Skor Total Evaluasi */}
                            <td style={{ textAlign: 'center' }}>
                              <span
                                className={`pg-score-pill ${
                                  !siswa.sudahEvaluasi ? 'is-empty' : ''
                                }`}
                              >
                                {siswa.skorTotalDisplay}
                              </span>
                            </td>

                            {/* Tiga Lencana Modul */}
                            {(['modul_1', 'modul_2', 'modul_3'] as ModulId[]).map((mid) => {
                              const status = siswa.statusModul[mid];
                              const skor = siswa.skorPerModulTerbaru[mid];

                              if (status === 'tuntas') {
                                return (
                                  <td key={mid} style={{ textAlign: 'center' }}>
                                    <span className="pg-badge-modul tuntas" title={`Skor ${skor}`}>
                                      ✓ Tuntas ({skor})
                                    </span>
                                  </td>
                                );
                              }
                              if (status === 'belum_tuntas') {
                                return (
                                  <td key={mid} style={{ textAlign: 'center' }}>
                                    <span className="pg-badge-modul belum-tuntas" title={`Skor ${skor}`}>
                                      Belum ({skor})
                                    </span>
                                  </td>
                                );
                              }
                              return (
                                <td key={mid} style={{ textAlign: 'center' }}>
                                  <span className="pg-badge-modul belum-evaluasi">
                                    Belum evaluasi
                                  </span>
                                </td>
                              );
                            })}

                            {/* Waktu Kirim Terbaru */}
                            <td>
                              <div className="pg-time-cell">
                                {formatWaktuIndonesia(siswa.waktuKirimTerbaru)}
                              </div>
                            </td>

                            {/* Riwayat Percobaan */}
                            <td>
                              <span className="pg-attempts-pill">
                                {siswa.percobaanEvaluasiCount} Eval · {siswa.percobaanBelajarCount} Belajar
                              </span>
                            </td>

                            {/* Tombol Aksi Detail (dipersiapkan untuk Tahap 3) */}
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="pg-btn-detail"
                                onClick={() => onPilihSiswa?.(siswa)}
                              >
                                Detail Jawaban
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default PanelGuru;
