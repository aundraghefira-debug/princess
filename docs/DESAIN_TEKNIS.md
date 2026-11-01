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
│   └── phCalc.ts
├── components/
│   ├── ModulDetail.tsx         # F1
│   ├── TheoryMatrix.tsx        # F2
│   ├── PhExplorer.tsx          # F3
│   ├── MicroMacroSimulator.tsx # F4
│   ├── PhCalculator.tsx        # F5
│   ├── TitrationLab.tsx        # F6
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

## 7. Penyimpanan Progres (Sprint 5)

Mengikuti struktur JSON di `AGENT.md` Bagian 02. Semua akses `localStorage` dibungkus `try/catch`; jika data rusak, aplikasi memakai data awal.

---

## 8. Tampilan & Responsif

- Lebar konten maksimal ±960px, berada di tengah layar.
- Tidak ada scroll horizontal pada lebar 360px sampai 1440px.
- Kartu modul tersusun 3 kolom di laptop, 1 kolom di HP.
- Rumus kimia memakai karakter subskrip/superskrip Unicode (H₂SO₄, OH⁻).

---

## 9. Cara Menguji

1. Jalankan `npm run dev` dan buka `localhost:5173`.
2. Pastikan tidak ada error di terminal maupun di Console browser (F12).
3. Klik semua kartu dan tombol navigasi; pastikan tidak ada halaman kosong atau macet.
4. Kecilkan jendela browser hingga selebar HP; pastikan teks tidak terpotong.
5. Cocokkan rumus, angka, dan istilah kimia yang tampil dengan buku sumber.
