# DESAIN_TEKNIS.md — Rancangan Teknis ChemiVerse

> Mengikuti `docs/PRD.md` dan `docs/AGENT.md`. Jika ada perbedaan, `AGENT.md` yang dipakai.

---

## 1. Teknologi

| Bagian | Pilihan |
|---|---|
| Framework | React (Functional Component + Hooks) |
| Build tool | Vite |
| Bahasa | TypeScript (`.tsx` untuk komponen, `.ts` untuk data & logika) |
| Styling | CSS biasa (`App.css` dan CSS per komponen) |
| Penyimpanan | `localStorage` (key `_chemiverse_user_state`) |
| Server / database | Tidak ada; semua berjalan di browser |

**Batasan sesi ini:** tidak menambah library baru (termasuk router, library grafik, atau animasi) tanpa persetujuan tim.

---

## 2. Arsitektur Tiga Lapis

```
DATA LAYER            COMPONENT LAYER           PRESENTATION LAYER
src/data/chemData.ts  →  src/components/*.tsx  →  Browser siswa
src/utils/phCalc.ts
(isi kimia & rumus)      (tata letak & interaksi)  (tampilan responsif)
```

Revisi materi kimia cukup dilakukan di `chemData.ts`, tanpa membongkar komponen.

---

## 3. Struktur Folder

```
src/
├── data/
│   └── chemData.ts
├── utils/
│   ├── phCalc.ts
│   └── titrationEngine.ts       # F6 mesin pH titrasi
├── components/
│   ├── ModulDetail.tsx         # F1
│   ├── TheoryMatrix.tsx        # F2
│   ├── PhExplorer.tsx          # F3
│   ├── MicroMacroSimulator.tsx # F4
│   ├── PhCalculator.tsx        # F5
│   ├── TitrationLab.tsx        # F6 (komponen induk, memegang state)
│   ├── titration/              # F6 komponen pendukung
│   │   ├── Burette.tsx
│   │   ├── Flask.tsx
│   │   ├── TitrationChart.tsx
│   │   └── DataTable.tsx
│   └── QuizScaffolding.tsx     # F7
├── App.tsx
└── App.css
```

Komponen yang sudah ada di baseline (termasuk Eksplorasi Skala pH) tetap di lokasinya sekarang sampai tim sepakat memindahkannya.

---

## 4. Navigasi

Karena tidak memakai library router, perpindahan halaman diatur dengan state di `App.tsx`:

```tsx
type Halaman = 'beranda' | 'eksplorasi-ph' | 'modul_1' | 'modul_2' | 'modul_3';

const [halaman, setHalaman] = useState<Halaman>('beranda');
```

- Kartu modul di beranda memanggil `setHalaman('modul_1')`.
- Tombol "Kembali ke Beranda" memanggil `setHalaman('beranda')`.
- Saat halaman berganti, layar digulir ke atas (`window.scrollTo(0, 0)`).

---

## 5. Struktur Data `chemData.ts`

```ts
export interface Representasi {
  makroskopis: string;
  submikroskopis: string;
  simbolik: string;
}

export interface SubMateri {
  id: string;
  judul: string;
  isi: string[];               // paragraf-paragraf penjelasan
  persamaanReaksi?: string[];  // contoh: "HCl(aq) → H⁺(aq) + Cl⁻(aq)"
  representasi?: Representasi;
}

export interface ContohSoal {
  soal: string;
  langkah: string[];
  jawaban: string;
}

export interface Sumber {
  penulis: string;
  tahun: string;
  judul: string;
  penerbit: string;
  halaman?: string;
}

export interface Modul {
  id: 'modul_1' | 'modul_2' | 'modul_3';
  judul: string;
  tersedia: boolean;           // false → kartu berlabel "Segera hadir"
  tujuan: string[];
  apersepsi: { judul: string; cerita: string; pertanyaan: string[]; kaitan: string };
  subMateri: SubMateri[];
  contohSoal: ContohSoal[];
  ringkasan: string[];
  sumber: Sumber[];
}

export const daftarModul: Modul[] = [ /* diisi tim */ ];
```

**Data tambahan (sprint berikutnya):**

```ts
export interface Zat {
  id: string;
  nama: string;          // "Asam asetat"
  rumus: string;         // "CH₃COOH"
  jenis: 'asam_kuat' | 'basa_kuat' | 'asam_lemah' | 'basa_lemah';
  valensi: number;
  ka?: number;           // dari buku sumber
  kb?: number;           // dari buku sumber
}

export interface Indikator {
  id: string;
  nama: string;
  trayekBawah: number;
  trayekAtas: number;
  warnaAsam: string;     // kode hex
  warnaBasa: string;     // kode hex
}
```

Nilai `ka`, `kb`, dan trayek indikator wajib berasal dari buku sumber yang tercantum di PRD.

**Data titrasi (F6), ditambahkan ke `chemData.ts`:**

```ts
export type JenisTitrasi = 'asam_kuat-basa_kuat' | 'asam_lemah-basa_kuat';

export interface PresetTitrasi {
  id: string;
  label: string;               // "HCl dititrasi NaOH"
  jenis: JenisTitrasi;
  idTitrat: string;            // merujuk Zat.id (asam yang dititrasi)
  idTitran: string;            // merujuk Zat.id (basa penitrasi)
  konsentrasiTitran: number;   // M
  rentangKonsentrasiTitrat: [number, number]; // M, untuk slider
  rentangVolumeTitrat: [number, number];      // mL
  volumeBuret: number;         // kapasitas buret, mL
}

export const daftarPresetTitrasi: PresetTitrasi[] = [
  // diisi tim; satu preset per jenis titrasi
];

export const daftarIndikator: Indikator[] = [
  // trayek mengikuti tabel F6 pada PRD; TODO: cocokkan dengan buku sumber
  { id: 'metil_jingga',   nama: 'Metil jingga',   trayekBawah: 3.1, trayekAtas: 4.4,  warnaAsam: '#e53935', warnaBasa: '#fdd835' },
  { id: 'metil_merah',    nama: 'Metil merah',    trayekBawah: 4.4, trayekAtas: 6.2,  warnaAsam: '#e53935', warnaBasa: '#fdd835' },
  { id: 'bromtimol_biru', nama: 'Bromtimol biru', trayekBawah: 6.0, trayekAtas: 7.6,  warnaAsam: '#fdd835', warnaBasa: '#1e88e5' },
  { id: 'fenolftalein',   nama: 'Fenolftalein',   trayekBawah: 8.3, trayekAtas: 10.0, warnaAsam: '#f5f5f5', warnaBasa: '#ec407a' },
];
```

Nilai `ka` untuk asam lemah pada titrasi (contoh asam asetat) diisi di `daftarZat` dengan `// TODO: isi dari buku sumber`. Nilai acuan uji di Bagian 6A memakai Ka = 1,8 × 10⁻⁵; jika buku sumber berbeda, nilai acuan ikut diperbarui. Kode warna hex adalah warna tampilan, boleh disesuaikan tampilannya.
---

## 6. Logika Perhitungan `phCalc.ts` (Sprint 3)

Fungsi murni tanpa tampilan, supaya mudah diuji:

| Fungsi | Masukan | Keluaran |
|---|---|---|
| `hitungHPlusAsamKuat` | konsentrasi, valensi | [H⁺] |
| `hitungOHBasaKuat` | konsentrasi, valensi | [OH⁻] |
| `hitungHPlusAsamLemah` | konsentrasi, Ka | [H⁺] |
| `hitungOHBasaLemah` | konsentrasi, Kb | [OH⁻] |
| `hitungPH` | [H⁺] | pH |
| `hitungPOH` | [OH⁻] | pOH |

Semua fungsi mengembalikan angka mentah. Pembulatan 2 angka di belakang koma hanya dilakukan saat menampilkan.

---

## 6A. Mesin Titrasi `titrationEngine.ts` (F6)

Fungsi murni tanpa tampilan. Komponen hanya memanggil fungsi ini dan tidak menghitung pH sendiri.

### Metode

Rumus pendekatan per daerah (sebelum, saat, sesudah ekuivalen) kurang akurat di sekitar titik ekuivalen. Mesin memakai **persamaan kesetimbangan muatan** yang dipecahkan secara numerik dengan bisection pada skala log₁₀[H⁺]. Satu persamaan berlaku untuk seluruh kurva.

Notasi: h = [H⁺]; a dan b = valensi titrat dan titran; Vₜ = volume titrat; V = Vₜ + volume titran.

| Jenis titrasi | Persamaan g(h) = 0 |
|---|---|
| Asam kuat–basa kuat | h + (b·C_titran·V_titran)/V − a·(C_titrat·Vₜ)/V − Kw/h |
| Asam lemah–basa kuat (a = 1) | h + (b·C_titran·V_titran)/V − c_titrat·Ka/(Ka + h) − Kw/h |

g(h) naik monoton terhadap h, sehingga bisection selalu menemukan satu akar. Volume ekuivalen: Ve = (a × Mₐ × Vₐ) / (b × M_b).

### Kode

```ts
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
  volume: number;              // mL
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
```

### Nilai acuan uji (toleransi ±0,02)

Kasus A: HCl 0,1 M (25 mL) + NaOH 0,1 M, Ve = 25,00 mL

| Volume NaOH (mL) | pH |
|---|---|
| 0,00 | 1,00 |
| 24,90 | 3,70 |
| 25,00 | 7,00 |
| 25,10 | 10,30 |

Kasus B: CH₃COOH 0,1 M (25 mL, Ka = 1,8 × 10⁻⁵) + NaOH 0,1 M, Ve = 25,00 mL

| Volume NaOH (mL) | pH |
|---|---|
| 0,00 | 2,87 |
| 12,50 | 4,74 |
| 25,00 | 8,72 |

Karena `package.json` terkunci (tanpa framework uji), pemeriksaan dilakukan dengan fungsi berikut. Agen menjalankannya sementara (misalnya lewat `console.log` di `App.tsx`), melaporkan hasilnya, lalu menghapus pemanggilannya:

```ts
export function periksaNilaiAcuan(kaAsetat: number) {
  const dasar = { konsentrasiTitrat: 0.1, volumeTitrat: 25, valensiTitrat: 1, konsentrasiTitran: 0.1, valensiTitran: 1 };
  const kasus = [
    { label: 'HCl, 0,00 mL',  jenis: 'asam_kuat-basa_kuat' as const,  v: 0,    harapan: 1.0 },
    { label: 'HCl, 24,90 mL', jenis: 'asam_kuat-basa_kuat' as const,  v: 24.9, harapan: 3.7 },
    { label: 'HCl, 25,00 mL', jenis: 'asam_kuat-basa_kuat' as const,  v: 25,   harapan: 7.0 },
    { label: 'HCl, 25,10 mL', jenis: 'asam_kuat-basa_kuat' as const,  v: 25.1, harapan: 10.3 },
    { label: 'CH₃COOH, 0,00 mL',  jenis: 'asam_lemah-basa_kuat' as const, v: 0,    harapan: 2.87 },
    { label: 'CH₃COOH, 12,50 mL', jenis: 'asam_lemah-basa_kuat' as const, v: 12.5, harapan: 4.74 },
    { label: 'CH₃COOH, 25,00 mL', jenis: 'asam_lemah-basa_kuat' as const, v: 25,   harapan: 8.72 },
  ];
  return kasus.map((k) => {
    const hasil = hitungPHTitrasi({ ...dasar, jenis: k.jenis, volumeTitran: k.v, ka: kaAsetat });
    return { label: k.label, diharapkan: k.harapan, hasil, lulus: Math.abs(hasil - k.harapan) <= 0.02 };
  });
}
```

### Pembagian tugas komponen F6

| Komponen | Tugas | Data masuk |
|---|---|---|
| `TitrationLab.tsx` | Memegang state (pengaturan, `volumeTitran`, riwayat titik); memanggil mesin; mengatur tahap alur (persiapan → refleksi) | `daftarPresetTitrasi`, `daftarIndikator` |
| `Burette.tsx` | Buret SVG berskala, kran, animasi tetes | `volumeTitran`, `volumeBuret`, `onTambah(mL)` |
| `Flask.tsx` | Erlenmeyer SVG; warna dari `warnaIndikator` | `pH`, `indikator` |
| `TitrationChart.tsx` | Kurva SVG dari `buatKurva`; garis Ve dan pita trayek indikator muncul setelah siswa menandai perkiraannya | `kurva`, `ve`, `indikator` |
| `DataTable.tsx` | Tabel pengamatan (volume awal, akhir, pH, warna) | `riwayat` |

Aturan implementasi:
- `buatKurva` dipanggil dengan `useMemo` agar tidak dihitung ulang setiap render.
- Aliran cepat memakai `setInterval` di dalam `useEffect` dengan fungsi pembersih (`clearInterval`) agar tidak bocor saat komponen ditutup.
- Perubahan pengaturan (zat, konsentrasi, volume) mengosongkan riwayat dan mengembalikan buret ke 0,00 mL.
- Volume ditampilkan dengan koma desimal dan satuan (24,90 mL) memakai format dari AGENT.md Bagian 06.
- Posisi terakhir (preset, konsentrasi, volume titran) disimpan lewat `src/lib/localStore.ts`; tambahkan bidangnya ke `docs/DATABASE.md` terlebih dulu.

## 7. Penyimpanan Progres (Sprint 5)

Mengikuti struktur JSON di `AGENT.md` Bagian 02. Semua akses `localStorage` dibungkus `try/catch`; jika data rusak, aplikasi memakai data awal.

---

## 8. Tampilan & Responsif

- Lebar konten maksimal ±960px, berada di tengah layar.
- Tidak ada scroll horizontal pada lebar 360px sampai 1440px.
- Kartu modul tersusun 3 kolom di laptop, 1 kolom di HP.
- Rumus kimia memakai karakter subskrip/superskrip Unicode (H₂SO₄, OH⁻).
- Simulator titrasi: tiga panel berdampingan di laptop, tersusun vertikal di HP (urutan: pengaturan → buret/labu → kurva → data). SVG memakai `viewBox` dan `width: 100%` agar menyesuaikan lebar; tabel data yang lebar menggulir di dalam wadahnya sendiri (`overflow-x: auto`), bukan pada halaman.

---

## 9. Cara Menguji

1. Jalankan `npm run dev` dan buka `localhost:5173`.
2. Pastikan tidak ada error di terminal maupun di Console browser (F12).
3. Klik semua kartu dan tombol navigasi; pastikan tidak ada halaman kosong atau macet.
4. Kecilkan jendela browser hingga selebar HP; pastikan teks tidak terpotong.
5. Cocokkan rumus, angka, dan istilah kimia yang tampil dengan buku sumber.
6. Simulator titrasi: jalankan `periksaNilaiAcuan` (Bagian 6A) dan pastikan semua baris `lulus: true`. Lalu coba satu alur penuh di Modul 3 (persiapan sampai refleksi) untuk kedua jenis titrasi; pastikan warna labu berubah bertahap, kurva terbentuk titik demi titik, dan pesan indikator tidak cocok muncul saat memakai metil jingga pada titrasi asam lemah.
