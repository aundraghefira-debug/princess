import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  daftarPresetTitrasi,
  daftarIndikator,
  daftarZat,
  type PresetTitrasi,
  type Indikator,
  type Zat,
} from '../../data/chemData';
import {
  hitungPHTitrasi,
  hitungVolumeEkuivalen,
  warnaIndikator,
  indikatorCocok,
  validasiParameter,
  type ParameterTitrasi,
} from '../../utils/titrationEngine';
import Burette from './Burette';
import Flask from './Flask';
import TitrationChart from './TitrationChart';
import DataTable, { type TitikPengamatan } from './DataTable';
import './TitrationLab.css';

export interface TitrationLabProps {
  /** Callback opsional jika ingin memberitahu parent saat titrasi mencapai titik ekuivalen */
  onTitikEkuivalenTercapai?: (ve: number, ph: number) => void;
  /** Volume titran awal (dari checkpoint) */
  initialVolumeTitran?: number;
  /** Callback saat volume titran berubah untuk menyimpan checkpoint */
  onVolumeTitranChange?: (volumeTitran: number, volumeBuretLeft: number) => void;
  /** Kelas CSS tambahan opsional */
  className?: string;
}

export const TitrationLab: React.FC<TitrationLabProps> = ({
  onTitikEkuivalenTercapai,
  initialVolumeTitran = 0,
  onVolumeTitranChange,
  className = '',
}) => {
  // 1. STATE PENGATURAN PRAKTIKUM
  const [presetTerpilih, setPresetTerpilih] = useState<PresetTitrasi>(() => daftarPresetTitrasi[0]);
  const [konsentrasiTitrat, setKonsentrasiTitrat] = useState<number>(0.1);
  const [volumeTitrat, setVolumeTitrat] = useState<number>(20);
  const [indikatorTerpilih, setIndikatorTerpilih] = useState<Indikator>(() => {
    return daftarIndikator.find((ind) => ind.id === 'fenolftalein') || daftarIndikator[3];
  });

  // 2. STATE KONDISI TITRASI BERJALAN
  const [volumeTitran, setVolumeTitran] = useState<number>(() => Math.max(0, Math.min(50, initialVolumeTitran)));
  const [_sedangTitrasi, setSedangTitrasi] = useState<boolean>(() => initialVolumeTitran > 0);
  const [aliranAktif, setAliranAktif] = useState<boolean>(false);
  const [sedangMenetesAnimasi, setSedangMenetesAnimasi] = useState<boolean>(false);

  // 3. STATE TABEL DATA PENGAMATAN
  const [dataPengamatan, setDataPengamatan] = useState<TitikPengamatan[]>([]);

  // Ref untuk mendeteksi perubahan volumeTitran dan memanggil checkpoint
  const isFirstMount = useRef(true);

  // Ambil detail zat dari daftarZat
  const zatTitrat: Zat | undefined = useMemo(() => {
    return daftarZat.find((z) => z.id === presetTerpilih.idTitrat);
  }, [presetTerpilih]);

  const zatTitran: Zat | undefined = useMemo(() => {
    return daftarZat.find((z) => z.id === presetTerpilih.idTitran);
  }, [presetTerpilih]);

  // Parameter titrasi untuk dikirim ke titrationEngine.ts
  const parameterTitrasi: ParameterTitrasi = useMemo(() => {
    return {
      jenis: presetTerpilih.jenis,
      konsentrasiTitrat,
      volumeTitrat,
      valensiTitrat: zatTitrat?.valensi || 1,
      konsentrasiTitran: presetTerpilih.konsentrasiTitran,
      valensiTitran: zatTitran?.valensi || 1,
      volumeTitran,
      ka: zatTitrat?.ka,
    };
  }, [presetTerpilih, konsentrasiTitrat, volumeTitrat, zatTitrat, zatTitran, volumeTitran]);

  // Parameter dasar (tanpa volumeTitran) untuk kurva teoretis
  const parameterKurva = useMemo<Omit<ParameterTitrasi, 'volumeTitran'>>(() => {
    return {
      jenis: presetTerpilih.jenis,
      konsentrasiTitrat,
      volumeTitrat,
      valensiTitrat: zatTitrat?.valensi || 1,
      konsentrasiTitran: presetTerpilih.konsentrasiTitran,
      valensiTitran: zatTitran?.valensi || 1,
      ka: zatTitrat?.ka,
    };
  }, [presetTerpilih, konsentrasiTitrat, volumeTitrat, zatTitrat, zatTitran]);

  // Validasi parameter dari engine
  const pesanPeringatan = useMemo(() => {
    return validasiParameter(parameterTitrasi);
  }, [parameterTitrasi]);

  // Hitung Volume Ekuivalen (Ve) menggunakan titrationEngine.ts
  const volumeEkuivalen = useMemo(() => {
    return hitungVolumeEkuivalen(parameterTitrasi);
  }, [parameterTitrasi]);

  // Hitung pH titik ekuivalen
  const phEkuivalen = useMemo(() => {
    return hitungPHTitrasi({
      ...parameterTitrasi,
      volumeTitran: volumeEkuivalen,
    });
  }, [parameterTitrasi, volumeEkuivalen]);

  // Hitung pH saat ini secara real-time dari titrationEngine.ts
  const phSekarang = useMemo(() => {
    return hitungPHTitrasi(parameterTitrasi);
  }, [parameterTitrasi]);

  // Hitung warna larutan saat ini menggunakan warnaIndikator dari titrationEngine.ts
  const warnaLarutan = useMemo(() => {
    return warnaIndikator(phSekarang, indikatorTerpilih);
  }, [phSekarang, indikatorTerpilih]);

  // Periksa apakah indikator saat ini cocok dengan TE
  const isIndikatorCocok = useMemo(() => {
    return indikatorCocok(phEkuivalen, indikatorTerpilih);
  }, [phEkuivalen, indikatorTerpilih]);

  // Status Titrasi
  const statusTitrasi = useMemo(() => {
    if (volumeTitran === 0) return 'Awal Titrasi';
    const selisih = volumeTitran - volumeEkuivalen;
    if (Math.abs(selisih) <= 0.05) return 'Titik Ekuivalen Tercapai! 🎯';
    if (selisih < 0 && Math.abs(selisih) <= 1.0) return 'Mendekati Titik Ekuivalen ⚠️';
    if (selisih < 0) return 'Sebelum Titik Ekuivalen';
    return 'Titran Berlebih (Setelah Ekuivalen)';
  }, [volumeTitran, volumeEkuivalen]);

  // Handler penambahan volume titran
  const handleTambahVolume = useCallback(
    (tambahMl: number) => {
      const volMaks = presetTerpilih.volumeBuret;
      setVolumeTitran((prev) => {
        const baru = Math.min(volMaks, Math.round((prev + tambahMl) * 100) / 100);
        return baru;
      });
      setSedangTitrasi(true);

      // Picu animasi tetesan singkat
      setSedangMenetesAnimasi(true);
      window.setTimeout(() => setSedangMenetesAnimasi(false), 300);
    },
    [presetTerpilih.volumeBuret]
  );

  // Efek aliran kontinu saat kran buret dibuka
  useEffect(() => {
    if (!aliranAktif) return;

    const timer = window.setInterval(() => {
      setVolumeTitran((prev) => {
        const baru = Math.round((prev + 0.1) * 100) / 100;
        if (baru >= presetTerpilih.volumeBuret) {
          setAliranAktif(false);
          return presetTerpilih.volumeBuret;
        }
        return baru;
      });
      setSedangMenetesAnimasi(true);
    }, 200);

    return () => {
      window.clearInterval(timer);
    };
  }, [aliranAktif, presetTerpilih.volumeBuret]);

  // Efek sinkronisasi checkpoint ke parent komponen
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (onVolumeTitranChange) {
      const vLeft = Math.max(0, Math.round((presetTerpilih.volumeBuret - volumeTitran) * 100) / 100);
      onVolumeTitranChange(volumeTitran, vLeft);
    }
  }, [volumeTitran, presetTerpilih.volumeBuret, onVolumeTitranChange]);

  // Efek notifikasi saat mencapai titik ekuivalen
  useEffect(() => {
    if (Math.abs(volumeTitran - volumeEkuivalen) <= 0.03 && onTitikEkuivalenTercapai) {
      onTitikEkuivalenTercapai(volumeEkuivalen, phSekarang);
    }
  }, [volumeTitran, volumeEkuivalen, phSekarang, onTitikEkuivalenTercapai]);

  // Otomatis catat titik awal saat pertama kali dimuat
  useEffect(() => {
    if (dataPengamatan.length === 0) {
      const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDataPengamatan([
        {
          id: 'titik-awal',
          volume: volumeTitran,
          pH: phSekarang,
          warna: warnaLarutan,
          keterangan: volumeTitran === 0 ? 'Kondisi Awal' : 'Posisi Awal Checkpoint',
          waktu,
          isTE: Math.abs(volumeTitran - volumeEkuivalen) <= 0.05,
        },
      ]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handler Catat Titik Manual ke Tabel
  const handleCatatTitikManual = useCallback(() => {
    const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const isTE = Math.abs(volumeTitran - volumeEkuivalen) <= 0.05;

    let ket = 'Sebelum Titik Ekuivalen';
    if (isTE) ket = '🎯 Titik Ekuivalen (TE)';
    else if (volumeTitran === 0) ket = 'Kondisi Awal (0 mL)';
    else if (volumeTitran > volumeEkuivalen) ket = 'Titran Berlebih (Setelah TE)';

    setDataPengamatan((prev) => [
      ...prev,
      {
        id: `titik-${Date.now()}-${prev.length}`,
        volume: volumeTitran,
        pH: phSekarang,
        warna: warnaLarutan,
        keterangan: ket,
        waktu,
        isTE,
      },
    ]);
  }, [volumeTitran, phSekarang, warnaLarutan, volumeEkuivalen]);

  // Handler Reset Praktikum
  const handleReset = () => {
    setVolumeTitran(0);
    setAliranAktif(false);
    setSedangTitrasi(false);
    setSedangMenetesAnimasi(false);

    // Reset data tabel ke kondisi awal
    const paramAwal = { ...parameterTitrasi, volumeTitran: 0 };
    const phAwal = hitungPHTitrasi(paramAwal);
    const warnaAwal = warnaIndikator(phAwal, indikatorTerpilih);
    const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setDataPengamatan([
      {
        id: `titik-reset-${Date.now()}`,
        volume: 0,
        pH: phAwal,
        warna: warnaAwal,
        keterangan: 'Reset (Kondisi Awal)',
        waktu,
        isTE: false,
      },
    ]);

    if (onVolumeTitranChange) {
      onVolumeTitranChange(0, presetTerpilih.volumeBuret);
    }
  };

  // Handler Ganti Preset
  const handleGantiPreset = (presetId: string) => {
    const baru = daftarPresetTitrasi.find((p) => p.id === presetId);
    if (baru) {
      setPresetTerpilih(baru);
      setKonsentrasiTitrat(0.1);
      setVolumeTitrat(20);
      setVolumeTitran(0);
      setAliranAktif(false);
      setSedangTitrasi(false);
      setDataPengamatan([]);
      if (onVolumeTitranChange) {
        onVolumeTitranChange(0, baru.volumeBuret);
      }
    }
  };

  // Suasana larutan berdasarkan pH
  const getSuasanaLarutan = (ph: number) => {
    if (ph < 6.8) return { label: 'Asam', kelas: 'badge-asam' };
    if (ph > 7.2) return { label: 'Basa', kelas: 'badge-basa' };
    return { label: 'Netral', kelas: 'badge-netral' };
  };
  const suasana = getSuasanaLarutan(phSekarang);

  return (
    <div className={`titration-lab-root ${className}`}>
      {/* Top Bar Praktikum: Keterangan Singkat & Tombol Reset */}
      <div className="titration-lab-top-bar">
        <p className="lab-subtitle">
          Eksplorasi penambahan titran dari buret ke labu Erlenmeyer, amati perubahan warna larutan, grafik kurva kontinu, dan tabel data pengamatan secara interaktif.
        </p>
        <div className="lab-header-actions">
          <button
            type="button"
            className="btn-lab-action btn-lab-reset"
            onClick={handleReset}
            title="Kembalikan buret ke 0,00 mL dan reset praktikum"
          >
            <span className="btn-icon">↺</span>
            <span>Reset Simulasi</span>
          </button>
        </div>
      </div>

      {pesanPeringatan && (
        <div className="titration-alert-warning">
          <span className="alert-icon">⚠️</span>
          <span>{pesanPeringatan}</span>
        </div>
      )}

      {/* Konten Utama: 3-Panel Laboratorium Virtual */}
      <div className="titration-grid-container">
        {/* ===================================================================
            PANEL 1: PENGATURAN PRAKTIKUM
            =================================================================== */}
        <aside className="titration-panel panel-controls">
          <div className="panel-header">
            <span className="panel-step-badge">1</span>
            <h3 className="panel-title">Pengaturan Praktikum</h3>
          </div>

          {/* Pilihan Preset Titrasi */}
          <div className="control-group">
            <label className="control-label" htmlFor="select-preset">
              Pilih Jenis Titrasi:
            </label>
            <select
              id="select-preset"
              className="control-select"
              value={presetTerpilih.id}
              onChange={(e) => handleGantiPreset(e.target.value)}
              disabled={aliranAktif}
            >
              {daftarPresetTitrasi.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pengaturan Larutan Titrat (Analit dalam Erlenmeyer) */}
          <div className="control-card-subgroup">
            <h4 className="subgroup-title">
              <span>🧪</span> Larutan Titrat (Erlenmeyer)
            </h4>
            <div className="subgroup-info">
              <strong>{zatTitrat?.nama}</strong> ({zatTitrat?.rumus})
            </div>

            {/* Slider Konsentrasi Titrat */}
            <div className="control-group">
              <div className="slider-label-row">
                <span className="control-sublabel">Konsentrasi ([Ma]):</span>
                <span className="slider-val-badge font-mono">
                  {konsentrasiTitrat.toFixed(2).replace('.', ',')} M
                </span>
              </div>
              <input
                type="range"
                min={presetTerpilih.rentangKonsentrasiTitrat[0]}
                max={presetTerpilih.rentangKonsentrasiTitrat[1]}
                step="0.01"
                value={konsentrasiTitrat}
                onChange={(e) => {
                  setKonsentrasiTitrat(parseFloat(e.target.value));
                  handleReset();
                }}
                disabled={aliranAktif}
                className="control-slider"
              />
            </div>

            {/* Slider Volume Titrat */}
            <div className="control-group">
              <div className="slider-label-row">
                <span className="control-sublabel">Volume Awal (Va):</span>
                <span className="slider-val-badge font-mono">
                  {volumeTitrat.toFixed(0)} mL
                </span>
              </div>
              <input
                type="range"
                min={presetTerpilih.rentangVolumeTitrat[0]}
                max={presetTerpilih.rentangVolumeTitrat[1]}
                step="1"
                value={volumeTitrat}
                onChange={(e) => {
                  setVolumeTitrat(parseFloat(e.target.value));
                  handleReset();
                }}
                disabled={aliranAktif}
                className="control-slider"
              />
            </div>
          </div>

          {/* Pengaturan Larutan Titran (Dalam Buret) */}
          <div className="control-card-subgroup">
            <h4 className="subgroup-title">
              <span>📍</span> Larutan Titran (Buret)
            </h4>
            <div className="subgroup-info">
              <strong>{zatTitran?.nama}</strong> ({zatTitran?.rumus}) -{' '}
              <span className="font-mono">
                {presetTerpilih.konsentrasiTitran.toFixed(2).replace('.', ',')} M
              </span>
            </div>
          </div>

          {/* Pemilihan Indikator Asam-Basa */}
          <div className="control-group">
            <label className="control-label" htmlFor="select-indikator">
              Pilihan Indikator:
            </label>
            <select
              id="select-indikator"
              className="control-select"
              value={indikatorTerpilih.id}
              onChange={(e) => {
                const ind = daftarIndikator.find((i) => i.id === e.target.value);
                if (ind) setIndikatorTerpilih(ind);
              }}
            >
              {daftarIndikator.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.nama} (pH {ind.trayekBawah}–{ind.trayekAtas})
                </option>
              ))}
            </select>

            {/* Cuplikan Trayek Indikator Terpilih */}
            <div className="indikator-preview-card">
              <div className="preview-top-row">
                <span className="preview-nama">{indikatorTerpilih.nama}</span>
                <span className="preview-trayek font-mono">
                  Trayek: {indikatorTerpilih.trayekBawah} – {indikatorTerpilih.trayekAtas}
                </span>
              </div>
              <div className="preview-color-bar">
                <span
                  className="color-chip"
                  style={{ backgroundColor: indikatorTerpilih.warnaAsam }}
                  title="Warna Asam"
                />
                <div
                  className="color-gradient"
                  style={{
                    background: `linear-gradient(to right, ${indikatorTerpilih.warnaAsam}, ${indikatorTerpilih.warnaBasa})`,
                  }}
                />
                <span
                  className="color-chip"
                  style={{ backgroundColor: indikatorTerpilih.warnaBasa }}
                  title="Warna Basa"
                />
              </div>
            </div>
          </div>

          {/* Target Ekuivalen Teoretis */}
          <div className="teori-target-card">
            <div className="target-title">Target Ekuivalen Teoretis:</div>
            <div className="target-values-row font-mono">
              <span>Ve = {volumeEkuivalen.toFixed(2).replace('.', ',')} mL</span>
              <span>·</span>
              <span>pHE = {phEkuivalen.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </aside>

        {/* ===================================================================
            PANEL 2: MEJA LABORATORIUM VIRTUAL (Buret & Erlenmeyer)
            =================================================================== */}
        <section className="titration-panel panel-apparatus" aria-label="Alat Praktikum Titrasi">
          <div className="panel-header">
            <span className="panel-step-badge">2</span>
            <h3 className="panel-title">Meja Praktikum Virtual</h3>
          </div>

          {/* Area Visual Alat Laboratorium Tersusun Vertikal */}
          <div className="apparatus-bench">
            {/* 1. Buret Berskala */}
            <Burette
              volumeTerpakai={volumeTitran}
              volumeBuret={presetTerpilih.volumeBuret}
              warnaTitran="rgba(200, 230, 255, 0.7)"
              onTambahVolume={handleTambahVolume}
              aliranAktif={aliranAktif}
              onToggleAliran={() => setAliranAktif((prev) => !prev)}
            />

            {/* 2. Labu Erlenmeyer Berada Tepat di Bawah Buret */}
            <Flask
              volumeTotal={volumeTitrat + volumeTitran}
              warnaCairan={warnaLarutan}
              labelZat={`${zatTitrat?.rumus} + ${indikatorTerpilih.nama}`}
              sedangMenetes={sedangMenetesAnimasi || aliranAktif}
              nilaiPH={phSekarang}
            />
          </div>
        </section>

        {/* ===================================================================
            PANEL 3: MONITOR DATA & pH METER DIGITAL
            =================================================================== */}
        <aside className="titration-panel panel-monitor">
          <div className="panel-header">
            <span className="panel-step-badge">3</span>
            <h3 className="panel-title">Monitor Instrumen Digital</h3>
          </div>

          <div className="panel-monitor-content">
            {/* pH Meter Display (Bergaya LCD Laboratorium) */}
            <div className="ph-meter-instrument">
              <div className="instrument-top-row">
                <span className="instrument-brand">ChemiVerse pH-9000</span>
                <span className={`suasana-badge ${suasana.kelas}`}>{suasana.label}</span>
              </div>

              <div className="ph-lcd-screen">
                <span className="lcd-label">pH</span>
                <span className="lcd-value font-mono">
                  {phSekarang.toFixed(2).replace('.', ',')}
                </span>
                <span className="lcd-temp">25.0 °C</span>
              </div>

              <div className="instrument-status-row">
                <span className="status-label">Kondisi:</span>
                <span className="status-text">{statusTitrasi}</span>
              </div>
            </div>

            {/* Kartu Status Pembacaan Titrasi */}
            <div className="monitor-details-card">
              <div className="detail-data-row">
                <span className="data-name">Volume Titrat (Va):</span>
                <span className="data-val font-mono">{volumeTitrat.toFixed(2).replace('.', ',')} mL</span>
              </div>
              <div className="detail-data-row">
                <span className="data-name">Titran Terpakai (Vb):</span>
                <span className="data-val font-mono">{volumeTitran.toFixed(2).replace('.', ',')} mL</span>
              </div>
              <div className="detail-data-row">
                <span className="data-name">Volume Total:</span>
                <span className="data-val font-mono">
                  {(volumeTitrat + volumeTitran).toFixed(2).replace('.', ',')} mL
                </span>
              </div>
            </div>

            {/* Kotak Kesesuaian Indikator */}
            <div className={`indikator-fit-box ${isIndikatorCocok ? 'fit-good' : 'fit-warning'}`}>
              <div className="fit-header">
                <span className="fit-icon">{isIndikatorCocok ? '✓' : 'ℹ️'}</span>
                <span className="fit-title">
                  {isIndikatorCocok ? 'Indikator Sesuai' : 'Perlu Diperhatikan'}
                </span>
              </div>
              <p className="fit-desc">
                {isIndikatorCocok
                  ? `Trayek ${indikatorTerpilih.nama} (${indikatorTerpilih.trayekBawah}–${indikatorTerpilih.trayekAtas}) mencakup pH titik ekuivalen (${phEkuivalen.toFixed(2).replace('.', ',')}). Titik akhir titrasi akan berimpit baik dengan titik ekuivalen.`
                  : `Trayek ${indikatorTerpilih.nama} (${indikatorTerpilih.trayekBawah}–${indikatorTerpilih.trayekAtas}) berada di luar pH titik ekuivalen (${phEkuivalen.toFixed(2).replace('.', ',')}). Perubahan warna dapat terjadi terlalu dini atau terlambat.`}
              </p>
            </div>

            {/* Tombol Cepat Catat Data ke Tabel */}
            <button
              type="button"
              className="btn-quick-record"
              onClick={handleCatatTitikManual}
              title="Catat pembacaan buret dan pH saat ini ke tabel data"
            >
              <span>📌</span>
              <span>Catat Titik ke Tabel Data</span>
            </button>
          </div>
        </aside>
      </div>

      {/* =====================================================================
          BAGIAN BAWAH: GRAFIK KURVA TITRASI & TABEL DATA PENGAMATAN
          ===================================================================== */}
      <section className="titration-analytics-section" aria-label="Grafik dan Data Pengamatan Titrasi">
        <div className="analytics-section-header">
          <span className="analytics-badge">Data &amp; Analisis Pengamatan</span>
          <h3 className="analytics-title">Kurva Titrasi &amp; Buku Jurnal Pengamatan</h3>
          <p className="analytics-subtitle">
            Bandingkan titik-titik data eksperimenmu dengan kurva teoritis titrasi dan titik ekuivalen stoikiometri.
          </p>
        </div>

        <div className="analytics-grid">
          {/* 1. Komponen Grafik Kurva Titrasi SVG */}
          <TitrationChart
            parameter={parameterKurva}
            volumeMaks={presetTerpilih.volumeBuret}
            volumeTitranAktual={volumeTitran}
            phAktual={phSekarang}
            volumeEkuivalen={volumeEkuivalen}
            phEkuivalen={phEkuivalen}
            indikator={indikatorTerpilih}
          />

          {/* 2. Komponen Tabel Data Pengamatan */}
          <DataTable
            dataPengamatan={dataPengamatan}
            volumeEkuivalen={volumeEkuivalen}
            phEkuivalen={phEkuivalen}
            volumeSaatIni={volumeTitran}
            phSaatIni={phSekarang}
            onCatatTitik={handleCatatTitikManual}
            onBersihkanTabel={() => setDataPengamatan([])}
          />
        </div>
      </section>
    </div>
  );
};

export default TitrationLab;
