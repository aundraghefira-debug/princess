// src/utils/titrationEngine.ts
import type { JenisTitrasi, Indikator } from '../data/chemData';

const KW = 1e-14; // 25 °C

export interface ParameterTitrasi {
  jenis: JenisTitrasi;
  konsentrasiTitrat: number;   // M
  volumeTitrat: number;        // mL
  valensiTitrat: number;       // a (asam lemah: harus 1)
  konsentrasiTitran: number;   // M
  valensiTitran: number;       // b
  volumeTitran: number;        // mL
  ka?: number;                 // wajib untuk asam lemah
}

export interface TitikKurva {
  volume: number; // mL
  pH: number;
}

/** Pemeriksaan masukan. Mengembalikan pesan mendidik, atau null jika valid. */
export function validasiParameter(p: ParameterTitrasi): string | null {
  if (p.konsentrasiTitrat <= 0 || p.konsentrasiTitran <= 0) {
    return 'Konsentrasi larutan harus lebih dari nol. Silakan periksa kembali data kamu.';
  }
  if (p.volumeTitrat <= 0) {
    return 'Volume larutan yang dititrasi harus lebih dari nol.';
  }
  if (p.volumeTitran < 0) {
    return 'Volume titran tidak boleh bernilai negatif.';
  }
  if (p.jenis === 'asam_lemah-basa_kuat') {
    if (!p.ka || p.ka <= 0) return 'Nilai Ka diperlukan untuk menghitung pH asam lemah.';
    if (p.valensiTitrat !== 1) return 'Titrasi asam lemah di sini hanya untuk asam monoprotik.';
  }
  return null;
}

/** Volume titran saat ekuivalen (mL). */
export function hitungVolumeEkuivalen(p: ParameterTitrasi): number {
  return (
    (p.valensiTitrat * p.konsentrasiTitrat * p.volumeTitrat) /
    (p.valensiTitran * p.konsentrasiTitran)
  );
}

/** Bisection pada log10([H+]). g(h) naik monoton terhadap h. */
function selesaikanPH(g: (h: number) => number): number {
  let bawah = -15;
  let atas = 1;
  for (let i = 0; i < 80; i++) {
    const tengah = (bawah + atas) / 2;
    if (g(10 ** tengah) > 0) atas = tengah;
    else bawah = tengah;
  }
  return -(bawah + atas) / 2;
}

/** pH campuran pada volume titran tertentu. Tanpa pembulatan. */
export function hitungPHTitrasi(p: ParameterTitrasi): number {
  const volumeTotal = p.volumeTitrat + p.volumeTitran;
  const cTitrat = (p.konsentrasiTitrat * p.volumeTitrat) / volumeTotal;
  const muatanKation =
    (p.valensiTitran * p.konsentrasiTitran * p.volumeTitran) / volumeTotal;

  if (p.jenis === 'asam_kuat-basa_kuat') {
    const muatanAnion = p.valensiTitrat * cTitrat;
    return selesaikanPH((h) => h + muatanKation - muatanAnion - KW / h);
  }

  const ka = p.ka as number;
  return selesaikanPH(
    (h) => h + muatanKation - (cTitrat * ka) / (ka + h) - KW / h,
  );
}

/**
 * Titik-titik kurva dari 0 hingga volumeMaks.
 * Langkah halus (0,01 mL) di sekitar titik ekuivalen (±1 mL), kasar di tempat lain.
 */
export function buatKurva(
  p: Omit<ParameterTitrasi, 'volumeTitran'>,
  volumeMaks: number,
  langkahKasar = 0.1,
): TitikKurva[] {
  const ve = hitungVolumeEkuivalen({ ...p, volumeTitran: 0 });
  const hasil: TitikKurva[] = [];
  let v = 0;
  while (v <= volumeMaks + 1e-9) {
    hasil.push({ volume: v, pH: hitungPHTitrasi({ ...p, volumeTitran: v }) });
    const langkah = Math.abs(v - ve) <= 1 ? 0.01 : langkahKasar;
    v = Math.round((v + langkah) * 100) / 100;
  }
  return hasil;
}

/** Warna larutan bertahap di dalam trayek indikator (interpolasi RGB). */
export function warnaIndikator(pH: number, indikator: Indikator): string {
  const t = Math.min(
    1,
    Math.max(0, (pH - indikator.trayekBawah) / (indikator.trayekAtas - indikator.trayekBawah)),
  );
  const a = hexKeRgb(indikator.warnaAsam);
  const b = hexKeRgb(indikator.warnaBasa);
  const campur = a.map((nilai, i) => Math.round(nilai + (b[i] - nilai) * t));
  return `rgb(${campur[0]}, ${campur[1]}, ${campur[2]})`;
}

function hexKeRgb(hex: string): number[] {
  const bersih = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(bersih.slice(i, i + 2), 16));
}

/** Apakah indikator cocok untuk pH titik ekuivalen? (untuk umpan balik refleksi) */
export function indikatorCocok(pHEkuivalen: number, indikator: Indikator): boolean {
  return pHEkuivalen >= indikator.trayekBawah && pHEkuivalen <= indikator.trayekAtas;
}

/** Pemeriksaan nilai acuan (toleransi ±0,02). Dipakai sementara saat pengujian. */
export function periksaNilaiAcuan(kaAsetat: number) {
  const dasar = {
    konsentrasiTitrat: 0.1,
    volumeTitrat: 25,
    valensiTitrat: 1,
    konsentrasiTitran: 0.1,
    valensiTitran: 1,
  };
  const kasus = [
    { label: 'HCl, 0,00 mL',      jenis: 'asam_kuat-basa_kuat' as const,  v: 0,    harapan: 1.0 },
    { label: 'HCl, 24,90 mL',     jenis: 'asam_kuat-basa_kuat' as const,  v: 24.9, harapan: 3.7 },
    { label: 'HCl, 25,00 mL',     jenis: 'asam_kuat-basa_kuat' as const,  v: 25,   harapan: 7.0 },
    { label: 'HCl, 25,10 mL',     jenis: 'asam_kuat-basa_kuat' as const,  v: 25.1, harapan: 10.3 },
    { label: 'CH₃COOH, 0,00 mL',  jenis: 'asam_lemah-basa_kuat' as const, v: 0,    harapan: 2.87 },
    { label: 'CH₃COOH, 12,50 mL', jenis: 'asam_lemah-basa_kuat' as const, v: 12.5, harapan: 4.74 },
    { label: 'CH₃COOH, 25,00 mL', jenis: 'asam_lemah-basa_kuat' as const, v: 25,   harapan: 8.72 },
  ];
  return kasus.map((k) => {
    const hasil = hitungPHTitrasi({
      ...dasar,
      jenis: k.jenis,
      volumeTitran: k.v,
      ka: kaAsetat,
    });
    return {
      label: k.label,
      diharapkan: k.harapan,
      hasil: Number(hasil.toFixed(3)),
      lulus: Math.abs(hasil - k.harapan) <= 0.02,
    };
  });
}